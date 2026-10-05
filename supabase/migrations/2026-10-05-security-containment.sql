-- Revenue Ripple containment stage 1. NOT APPLIED.
-- Prerequisites: fresh catalog backup/drift review, backend service-role verification,
-- passing synthetic tests, and exact production action-time confirmation.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'); $$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Keep authenticated admin operations; ordinary users may change only observed
-- profile fields. Comparing the whole row fails closed for future columns.
CREATE OR REPLACE FUNCTION public.rr_guard_profile_update()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF current_user IN ('postgres', 'service_role') THEN RETURN NEW; END IF;
  IF public.is_admin() THEN RETURN NEW; END IF;
  IF auth.uid() IS NULL OR OLD.id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Profile update not authorized' USING ERRCODE = '42501';
  END IF;
  IF (to_jsonb(NEW) - ARRAY['name','phone','company','bio','paypal_email','value_engine_last_seen','updated_at','email'])
     IS DISTINCT FROM
     (to_jsonb(OLD) - ARRAY['name','phone','company','bio','paypal_email','value_engine_last_seen','updated_at','email']) THEN
    RAISE EXCEPTION 'Protected profile fields require trusted administration' USING ERRCODE = '42501';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS DISTINCT FROM (auth.jwt()->>'email') THEN
    RAISE EXCEPTION 'Email must match the verified Auth identity' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.rr_guard_profile_update() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER rr_guard_profile_update BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.rr_guard_profile_update();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users FROM PUBLIC, anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.users FROM authenticated;
DROP POLICY "Allow_read" ON public.users;
DROP POLICY "Allow_Insert" ON public.users;
DROP POLICY "update" ON public.users;
-- Preserve observed own-profile/admin policies and table grants.
CREATE POLICY rr_self_signup ON public.users FOR INSERT TO authenticated WITH CHECK (
  id = auth.uid() AND email = (auth.jwt()->>'email') AND role = 'member'
  AND (plan IS NULL OR plan IN ('','member','core'))
  AND status = 'active' AND COALESCE(has_paid,false) = false
  AND (payment_status IS NULL OR payment_status = 'pending')
  AND COALESCE(is_founder,false) = false AND subscription_type IS NULL
  AND (founder_benefits IS NULL OR founder_benefits = '{}'::jsonb)
  AND COALESCE(commission_rate,0) = 0
  AND (username IS NULL OR username = '') AND value_engine_segment IS NULL
);

-- Do not replace the existing owner/admin SELECT policies with broad access.
DROP POLICY "Service role can manage payments" ON public.payments;
DROP POLICY "Service role can manage subscriptions" ON public.subscriptions;
REVOKE ALL ON public.payments, public.subscriptions FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.payments, public.subscriptions FROM authenticated;
-- Financial history is readable only through the existing owner/admin policy.
DROP POLICY "Allow insert for all users" ON public.commissions;
DROP POLICY "Allow update for all users" ON public.commissions;
DROP POLICY "Service role can insert commissions" ON public.commissions;
DROP POLICY "commissions select" ON public.commissions;
DROP POLICY "Service role can insert purchases" ON public.tripwire_purchases;
DROP POLICY "Service role can insert webhook logs" ON public.webhook_logs;
REVOKE ALL ON public.commissions, public.tripwire_purchases, public.webhook_logs FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.commissions, public.tripwire_purchases, public.webhook_logs FROM authenticated;
-- Inactive session analytics has no caller in the searched application code.
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_engagement FROM PUBLIC, anon, authenticated;
-- Remove independent column grants too; table REVOKE alone does not remove them.
DO $$
DECLARE target text; cols text; priv text; recipients text;
BEGIN
  FOREACH target IN ARRAY ARRAY['users','payments','subscriptions','commissions','tripwire_purchases','webhook_logs','user_engagement'] LOOP
    SELECT string_agg(quote_ident(attname), ',') INTO cols FROM pg_attribute
      WHERE attrelid=format('public.%I',target)::regclass AND attnum>0 AND NOT attisdropped;
    FOREACH priv IN ARRAY ARRAY['SELECT','INSERT','UPDATE','REFERENCES'] LOOP
      recipients := 'PUBLIC, anon';
      IF target='user_engagement' OR (target<>'users' AND priv<>'SELECT') THEN
        recipients := recipients || ', authenticated';
      END IF;
      EXECUTE format('REVOKE %s (%s) ON public.%I FROM %s',priv,cols,target,recipients);
    END LOOP;
  END LOOP;
END $$;
-- service_role retains its existing grants and bypasses RLS.
COMMIT;
