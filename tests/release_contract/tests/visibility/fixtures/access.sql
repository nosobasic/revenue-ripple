-- REVIEW DRAFT ONLY. Do not apply without schema/security/offer review.
-- Additive: does not change existing users, courses, quizzes, homework, tours,
-- content_items, or their hosted Oct 7 policies. Approved premium quota only; no Stripe price ID or partner terms seeded.
BEGIN;
CREATE TABLE public.rr_plan_rules (
  plan text PRIMARY KEY CHECK (plan IN ('free','premium','reseller','pro_reseller')),
  completed_scan_limit integer NOT NULL CHECK (completed_scan_limit BETWEEN 0 AND 10000),
  period text NOT NULL CHECK (period IN ('lifetime','month')),
  stripe_price_id text UNIQUE,
  enabled boolean NOT NULL DEFAULT false
);
INSERT INTO public.rr_plan_rules VALUES ('free',1,'lifetime',NULL,true),('premium',10,'month',NULL,true);
-- Entitlement rules do not enable sales: premium has no Stripe price ID and the billing flag stays off.
CREATE TABLE public.rr_subscriptions (
  subscription_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan text NOT NULL REFERENCES public.rr_plan_rules(plan),
  status text NOT NULL,
  paid_until timestamptz NOT NULL,
  event_created bigint NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false
);
CREATE TABLE public.rr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  request_key uuid NOT NULL,
  input_hash text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,request_key)
);
CREATE INDEX ON public.rr_scans(user_id,created_at);
CREATE FUNCTION public.rr_access(p_user uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE rule public.rr_plan_rules; used integer;
BEGIN
 SELECT r.* INTO rule FROM public.rr_subscriptions s JOIN public.rr_plan_rules r ON r.plan=s.plan
 WHERE s.user_id=p_user AND s.status='active' AND s.paid_until>now() AND r.enabled
 ORDER BY r.completed_scan_limit DESC LIMIT 1;
 IF NOT FOUND THEN SELECT * INTO STRICT rule FROM public.rr_plan_rules WHERE plan='free' AND enabled; END IF;
 SELECT count(*) INTO used FROM public.rr_scans WHERE user_id=p_user
 AND (rule.period='lifetime' OR created_at >= date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');
 RETURN jsonb_build_object('plan',rule.plan,'limit',rule.completed_scan_limit,'used',used,
 'remaining',greatest(0,rule.completed_scan_limit-used),'period',rule.period,
 'existing_learning_access','unchanged','paid_offer_status','approved_not_live');
END $$;
CREATE FUNCTION public.rr_complete_scan(p_user uuid,p_key uuid,p_hash text,p_result jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE previous public.rr_scans; entitlement jsonb;
BEGIN
 -- Serialize every submission for a user, including distinct keys on concurrent tabs.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 SELECT * INTO previous FROM public.rr_scans WHERE user_id=p_user AND request_key=p_key;
 IF FOUND THEN
   IF previous.input_hash<>p_hash THEN RETURN jsonb_build_object('error','key_conflict'); END IF;
   RETURN jsonb_build_object('id',previous.id,'result',previous.result,'replayed',true);
 END IF;
 entitlement:=public.rr_access(p_user);
 IF (entitlement->>'remaining')::int<=0 THEN
   RETURN jsonb_build_object('error','quota_exhausted','access',entitlement);
 END IF;
 IF jsonb_typeof(p_result->'actions') IS DISTINCT FROM 'array' OR jsonb_array_length(p_result->'actions')<>3 THEN
   RAISE EXCEPTION 'Incomplete scan';
 END IF;
 INSERT INTO public.rr_scans(user_id,request_key,input_hash,result) VALUES(p_user,p_key,p_hash,p_result)
 RETURNING * INTO previous;
 RETURN jsonb_build_object('id',previous.id,'result',previous.result,'replayed',false);
END $$;
ALTER TABLE public.rr_plan_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_scans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rr_plan_rules,public.rr_subscriptions,public.rr_scans FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.rr_plan_rules,public.rr_subscriptions,public.rr_scans TO service_role;
REVOKE ALL ON FUNCTION public.rr_access(uuid),public.rr_complete_scan(uuid,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rr_access(uuid),public.rr_complete_scan(uuid,uuid,text,jsonb) TO service_role;

-- Apply this section in the same reviewed release as the access schema above.
CREATE TABLE public.rr_partners (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id), code text UNIQUE NOT NULL,
 program text NOT NULL CHECK(program IN ('affiliate','reseller','pro_reseller')),
 approved boolean NOT NULL DEFAULT false
);
CREATE TABLE public.rr_commission_rules (
 program text NOT NULL, purchased_plan text NOT NULL REFERENCES public.rr_plan_rules(plan),
 basis_points integer NOT NULL CHECK(basis_points BETWEEN 0 AND 10000),
 enabled boolean NOT NULL DEFAULT false, PRIMARY KEY(program,purchased_plan)
);
CREATE TABLE public.rr_billing_events (event_id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.rr_commissions (
 invoice_id text PRIMARY KEY, buyer_id uuid NOT NULL REFERENCES auth.users(id),
 partner_id uuid NOT NULL REFERENCES auth.users(id), subscription_id text NOT NULL,
 amount_paid_cents integer NOT NULL CHECK(amount_paid_cents>0),
 basis_points integer NOT NULL CHECK(basis_points BETWEEN 0 AND 10000),
 commission_cents integer NOT NULL CHECK(commission_cents>=0),
 status text NOT NULL DEFAULT 'held' CHECK(status IN ('held','void')),
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(buyer_id<>partner_id)
);
CREATE FUNCTION public.rr_apply_billing(p_event text,p_created bigint,p_snapshot jsonb,p_invoice jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE buyer uuid:=(p_snapshot->>'user_id')::uuid; sid text:=p_snapshot->>'subscription_id';
 partner public.rr_partners; rate integer; amount integer; prior public.rr_subscriptions;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(sid,1));
 IF EXISTS(SELECT 1 FROM public.rr_billing_events WHERE event_id=p_event) THEN
  RETURN jsonb_build_object('status','duplicate');
 END IF;
 SELECT * INTO prior FROM public.rr_subscriptions WHERE subscription_id=sid FOR UPDATE;
 IF FOUND AND prior.user_id<>buyer THEN RAISE EXCEPTION 'Subscription owner mismatch'; END IF;
 -- Only an actually paid invoice can extend the paid-through timestamp.
 -- Lifecycle updates can revoke status without shortening scheduled cancellation.
 IF prior.subscription_id IS NULL OR p_created>=prior.event_created THEN
  INSERT INTO public.rr_subscriptions(subscription_id,user_id,plan,status,paid_until,event_created,cancel_at_period_end)
  VALUES(sid,buyer,p_snapshot->>'plan',p_snapshot->>'status',
   CASE WHEN p_invoice IS NOT NULL THEN to_timestamp((p_snapshot->>'paid_until')::bigint)
        ELSE coalesce(prior.paid_until,to_timestamp(0)) END,
   p_created,(p_snapshot->>'cancel_at_period_end')::boolean)
  ON CONFLICT(subscription_id) DO UPDATE SET plan=excluded.plan,status=CASE WHEN public.rr_subscriptions.status='canceled' THEN 'canceled' ELSE excluded.status END,
   paid_until=greatest(public.rr_subscriptions.paid_until,excluded.paid_until),
   event_created=excluded.event_created,cancel_at_period_end=excluded.cancel_at_period_end;
 END IF;
 IF p_invoice IS NOT NULL THEN
  UPDATE public.rr_subscriptions SET paid_until=greatest(paid_until,to_timestamp((p_snapshot->>'paid_until')::bigint))
   WHERE subscription_id=sid;
  -- An older invoice must not extend access to a newer unpaid billing period.
  -- Python supplies a paid-through boundary only after checking the invoice period.
  SELECT * INTO partner FROM public.rr_partners WHERE code=p_snapshot->>'referral_code' AND approved;
  IF FOUND AND partner.user_id<>buyer AND NOT EXISTS(
   SELECT 1 FROM auth.users a JOIN auth.users b ON lower(a.email)=lower(b.email)
   WHERE a.id=buyer AND b.id=partner.user_id
  ) THEN
   -- Paid reseller eligibility requires its own active, unexpired paid subscription.
   IF partner.program='affiliate' OR EXISTS(SELECT 1 FROM public.rr_subscriptions
     WHERE user_id=partner.user_id AND plan=partner.program AND status='active' AND paid_until>now()) THEN
    SELECT basis_points INTO rate FROM public.rr_commission_rules
      WHERE program=partner.program AND purchased_plan=p_snapshot->>'plan' AND enabled;
    IF FOUND THEN
     amount:=(p_invoice->>'amount_paid')::integer;
     INSERT INTO public.rr_commissions(invoice_id,buyer_id,partner_id,subscription_id,amount_paid_cents,basis_points,commission_cents)
      VALUES(p_invoice->>'id',buyer,partner.user_id,sid,amount,rate,floor(amount::numeric*rate/10000)::int)
      ON CONFLICT(invoice_id) DO NOTHING;
    END IF;
   END IF;
  END IF;
 END IF;
 INSERT INTO public.rr_billing_events(event_id) VALUES(p_event);
 RETURN jsonb_build_object('status','recorded');
END $$;
ALTER TABLE public.rr_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rr_commissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rr_partners,public.rr_commission_rules,public.rr_billing_events,public.rr_commissions FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.rr_partners,public.rr_commission_rules,public.rr_billing_events,public.rr_commissions TO service_role;
REVOKE ALL ON FUNCTION public.rr_apply_billing(text,bigint,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rr_apply_billing(text,bigint,jsonb,jsonb) TO service_role;

-- Reversal tombstone also covers a refund/dispute arriving before invoice.paid.
CREATE TABLE public.rr_reversed_invoices(invoice_id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.rr_reversed_invoices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rr_reversed_invoices FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.rr_reversed_invoices TO service_role;
CREATE FUNCTION public.rr_hold_reversed_commission() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.invoice_id,2));
 IF EXISTS(SELECT 1 FROM public.rr_reversed_invoices WHERE invoice_id=NEW.invoice_id) THEN NEW.status:='void'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER rr_commission_reversal BEFORE INSERT ON public.rr_commissions
 FOR EACH ROW EXECUTE FUNCTION public.rr_hold_reversed_commission();
CREATE FUNCTION public.rr_reverse_commission(p_invoice text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_invoice,2));
 INSERT INTO public.rr_reversed_invoices(invoice_id) VALUES(p_invoice) ON CONFLICT DO NOTHING;
 UPDATE public.rr_commissions SET status='void' WHERE invoice_id=p_invoice;
END $$;
REVOKE ALL ON FUNCTION public.rr_hold_reversed_commission(),public.rr_reverse_commission(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rr_hold_reversed_commission(),public.rr_reverse_commission(text) TO service_role;

COMMIT;
