-- Production transaction authorized October 15, 2026; checked against hosted catalog.
-- Eligibility reconciliation and backend/frontend changes in paid-content-review.txt
-- are prerequisites. No changes to courses, quizzes, progress, or free learning.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $guard$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_policy WHERE polrelid='public.ve_content_items'::regclass)
 OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.ve_content_items'::regclass
  AND relkind='r' AND relrowsecurity AND pg_get_userbyid(relowner)='postgres')
 OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.content_items'::regclass
  AND relkind='v' AND pg_get_userbyid(relowner)='postgres' AND reloptions IS NULL)
 OR EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid IN
 ('public.content_items'::regclass,'public.ve_content_items'::regclass)
 AND attnum>0 AND NOT attisdropped AND attacl IS NOT NULL)
 THEN RAISE EXCEPTION 'Content metadata drift: stop for review'; END IF;
END $guard$;

-- Owner-maintained verified evidence boundary. No client/service writes or reads.
-- Empty on installation; populated only by a separately reviewed reconciliation writer.
CREATE TABLE public.rr_retention_catalog (
 account_id text NOT NULL, price_id text NOT NULL, product_id text NOT NULL,
 PRIMARY KEY(account_id,price_id,product_id),
 amount integer NOT NULL CHECK(amount=4700), currency text NOT NULL CHECK(currency='usd'),
 interval_unit text NOT NULL CHECK(interval_unit='month'), interval_count integer NOT NULL CHECK(interval_count=1)
);
CREATE TABLE public.rr_retention_bindings (
 account_id text NOT NULL, subscription_id text NOT NULL,
 user_id uuid NOT NULL REFERENCES public.users(id), customer_id text NOT NULL,
 price_id text NOT NULL, product_id text NOT NULL,
 PRIMARY KEY(account_id,subscription_id),
 UNIQUE(account_id,subscription_id,user_id,customer_id,price_id,product_id),
 FOREIGN KEY(account_id,price_id,product_id) REFERENCES public.rr_retention_catalog
);
CREATE TABLE public.rr_retention_evidence (
 account_id text NOT NULL, subscription_id text NOT NULL,
 user_id uuid NOT NULL, customer_id text NOT NULL, price_id text NOT NULL, product_id text NOT NULL,
 invoice_id text NOT NULL, charge_id text NOT NULL CHECK(length(charge_id)>0),
 payment_intent_id text NOT NULL CHECK(length(payment_intent_id)>0),
 amount_paid integer NOT NULL CHECK(amount_paid=4700), currency text NOT NULL CHECK(currency='usd'),
 period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
 verified_at timestamptz NOT NULL,
 provider_state text NOT NULL CHECK(provider_state IN ('active','canceled','past_due','unpaid')),
 PRIMARY KEY(account_id,invoice_id),
 UNIQUE(account_id,charge_id), UNIQUE(account_id,payment_intent_id),
 CHECK(period_end>period_start),
 FOREIGN KEY(account_id,subscription_id,user_id,customer_id,price_id,product_id)
 REFERENCES public.rr_retention_bindings(account_id,subscription_id,user_id,customer_id,price_id,product_id)
);
CREATE TABLE public.rr_retention_review_holds (
 user_id uuid NOT NULL REFERENCES public.users(id), reason text NOT NULL,
 evidence_ref text NOT NULL CHECK(length(evidence_ref)>0),
 PRIMARY KEY(user_id,reason)
);
DO $acl$ DECLARE n text; BEGIN
 FOREACH n IN ARRAY ARRAY['rr_retention_catalog','rr_retention_bindings','rr_retention_evidence',
 'rr_retention_review_holds'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',n);
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated,service_role',n);
 END LOOP;
END $acl$;

-- Identity comes only from the verified JWT, never a caller-supplied UUID.
-- Existing trusted profile fields preserve admin/lifetime entitlement.
-- Subscription condition mirrors deployed rr_access/rr_v_access, with explicit
-- premium product scope rather than making every enabled scan plan a membership.
CREATE FUNCTION public.rr_retention_access() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $fn$
DECLARE profile public.users; paid_through timestamptz;
BEGIN
 IF auth.uid() IS NULL THEN RETURN jsonb_build_object('state','denied'); END IF;
 SELECT * INTO profile FROM public.users WHERE id=auth.uid();
 IF NOT FOUND THEN RETURN jsonb_build_object('state','review'); END IF;
 IF profile.role='admin' OR profile.plan='lifetime' THEN
  RETURN jsonb_build_object('state','allowed','valid_until',NULL); END IF;
 -- Holds precede paid evidence, including existing future-paid rows.
 IF EXISTS(SELECT 1 FROM public.rr_retention_review_holds WHERE user_id=profile.id) THEN
  RETURN jsonb_build_object('state','review'); END IF;
 -- Reject future-dated verification or contradictory evidence. Provider cancellation and
 -- failed renewal do not themselves erase a settled interval or extend it.
 IF EXISTS(SELECT 1 FROM public.rr_retention_evidence WHERE user_id=profile.id
   AND verified_at>now()) THEN
  RETURN jsonb_build_object('state','review'); END IF;
 IF EXISTS(SELECT 1 FROM public.rr_retention_evidence a JOIN public.rr_retention_evidence b
   ON a.user_id=b.user_id AND (a.account_id,a.invoice_id)<(b.account_id,b.invoice_id)
   AND a.period_start<b.period_end AND b.period_start<a.period_end
   WHERE a.user_id=profile.id) THEN RETURN jsonb_build_object('state','review'); END IF;
 SELECT max(e.period_end) INTO paid_through FROM public.rr_retention_evidence e
 JOIN public.rr_retention_bindings b USING(account_id,subscription_id,user_id,customer_id,price_id,product_id)
 JOIN public.rr_retention_catalog c USING(account_id,price_id,product_id)
 WHERE e.user_id=profile.id AND e.period_start<=now() AND e.period_end>now()
 AND e.verified_at<=now();
 IF paid_through IS NOT NULL THEN
  RETURN jsonb_build_object('state','allowed','valid_until',paid_through); END IF;
 IF EXISTS(SELECT 1 FROM public.rr_retention_evidence WHERE user_id=profile.id) THEN
  RETURN jsonb_build_object('state','denied'); END IF;
 IF EXISTS(SELECT 1 FROM public.rr_retention_bindings WHERE user_id=profile.id) THEN
  RETURN jsonb_build_object('state','review'); END IF;
 -- Any legacy premium row without verified provenance requires review.
 IF EXISTS(SELECT 1 FROM public.rr_subscriptions WHERE user_id=profile.id AND plan='premium') THEN
  RETURN jsonb_build_object('state','review'); END IF;
 -- Normalized coverage remains active after provider cancellation/failed renewal
 -- through paid_until (foundation contract). Nonactive legacy coverage is not
 -- verified normalized evidence; review it without inventing access.
 IF EXISTS(SELECT 1 FROM public.rr_subscriptions WHERE user_id=profile.id
   AND (plan NOT IN ('free','premium') OR (status<>'active' AND paid_until>now()))) THEN
  RETURN jsonb_build_object('state','review'); END IF;
 IF EXISTS(SELECT 1 FROM public.founders_annual_members WHERE user_id=profile.id) THEN
  RETURN jsonb_build_object('state','review'); END IF;
 IF EXISTS(SELECT 1 FROM public.rr_subscriptions WHERE user_id=profile.id AND plan='premium') THEN
  RETURN jsonb_build_object('state','denied'); END IF;
 IF profile.has_paid IS TRUE OR profile.plan IN ('reseller','pro_reseller','founders_annual') THEN
  RETURN jsonb_build_object('state','review'); END IF;
 RETURN jsonb_build_object('state','denied');
END;
$fn$;
REVOKE ALL ON FUNCTION public.rr_retention_access() FROM PUBLIC,anon,service_role;
GRANT EXECUTE ON FUNCTION public.rr_retention_access() TO authenticated;
CREATE FUNCTION public.rr_can_read_retention_content() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
 SELECT public.rr_retention_access()->>'state'='allowed';
$fn$;
REVOKE ALL ON FUNCTION public.rr_can_read_retention_content() FROM PUBLIC,anon,service_role;
GRANT EXECUTE ON FUNCTION public.rr_can_read_retention_content() TO authenticated;
REVOKE ALL ON TABLE public.ve_content_items FROM PUBLIC,anon,authenticated;
GRANT SELECT ON TABLE public.ve_content_items TO authenticated;
CREATE POLICY rr_read_paid_retention_content ON public.ve_content_items
 FOR SELECT TO authenticated USING (
  (SELECT public.rr_can_read_retention_content())
  AND level='member' AND content_type IN ('playbook','premium_briefing')
  AND published_at IS NOT NULL AND published_at<=now()
 );
ALTER VIEW public.content_items SET(security_invoker=true);
REVOKE ALL ON TABLE public.content_items FROM PUBLIC,anon,authenticated;
GRANT SELECT ON TABLE public.content_items TO authenticated;
-- Service grants/owner editing remain unchanged. Admin member-facing views obey
-- publication rules too; draft administration remains a separate trusted route.
COMMIT;
