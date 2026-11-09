-- LOCAL REVIEW PROPOSAL ONLY. Apply only after integrated owner pilot, never automatically.
-- Explicit beta opt-in; 10 lifetime invite slots and 2 lifetime admissions are proposed safety limits.
BEGIN;
LOCK TABLE public.rr_v_config IN ACCESS EXCLUSIVE MODE;
DO $guard$ BEGIN
IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='public.rr_v_access(uuid)'::regprocedure) <> 'ccafa12993decb5ab792e48e5a545f9a' THEN RAISE EXCEPTION 'Beta baseline drift'; END IF;
IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='public.rr_v_submit(uuid,uuid,text,jsonb,jsonb)'::regprocedure) <> '0f29336495deedf8edefc336aa8c2fbb' THEN RAISE EXCEPTION 'Beta baseline drift'; END IF;
IF (SELECT count(*) FROM public.rr_v_config)<>1 OR EXISTS(SELECT 1 FROM public.rr_v_config WHERE enabled OR provider<>'disabled' OR budget_micros<>0) OR EXISTS(SELECT 1 FROM public.rr_v_jobs WHERE status IN ('queued','running','reconciliation')) THEN RAISE EXCEPTION 'Beta requires closed gates and no outstanding jobs'; END IF;
END $guard$;
ALTER TABLE public.rr_v_config ADD COLUMN admission_mode text NOT NULL DEFAULT 'owner' CHECK(admission_mode IN ('owner','beta'));
CREATE TABLE public.rr_v_beta_members (
 slot smallint PRIMARY KEY CHECK(slot BETWEEN 1 AND 10),
 user_id uuid NOT NULL UNIQUE,
 enabled boolean NOT NULL DEFAULT false,
 admissions smallint NOT NULL DEFAULT 0 CHECK(admissions BETWEEN 0 AND 2),
 invited_at timestamptz NOT NULL DEFAULT now()
);
-- No FK cascade: deleting/recreating accounts or jobs cannot reopen lifetime seats.
ALTER TABLE public.rr_v_beta_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rr_v_beta_members FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION rr_visibility_internal.protect_beta_member() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF TG_OP IN ('DELETE','TRUNCATE') THEN RAISE EXCEPTION 'Beta seats cannot be recycled'; END IF;
 IF NEW.slot IS DISTINCT FROM OLD.slot OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.invited_at IS DISTINCT FROM OLD.invited_at OR NEW.admissions<OLD.admissions THEN RAISE EXCEPTION 'Beta lifetime identity and usage are immutable'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION rr_visibility_internal.protect_beta_member() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER rr_v_beta_member_immutable BEFORE UPDATE OR DELETE ON public.rr_v_beta_members FOR EACH ROW EXECUTE FUNCTION rr_visibility_internal.protect_beta_member();
CREATE TRIGGER rr_v_beta_member_no_truncate BEFORE TRUNCATE ON public.rr_v_beta_members FOR EACH STATEMENT EXECUTE FUNCTION rr_visibility_internal.protect_beta_member();
CREATE FUNCTION rr_visibility_internal.beta_eligible(p_user uuid) RETURNS boolean
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.rr_v_beta_members m JOIN auth.users u ON u.id=m.user_id WHERE m.user_id=p_user AND m.enabled AND u.email IS NOT NULL AND u.email_confirmed_at IS NOT NULL AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=now()));
$$;
REVOKE ALL ON FUNCTION rr_visibility_internal.beta_eligible(uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.rr_v_access(p_user uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.rr_plan_rules; used int; reserved int; config public.rr_v_config; bonus jsonb;
BEGIN
 SELECT * INTO config FROM public.rr_v_config WHERE id;
 SELECT pr.* INTO r FROM public.rr_subscriptions s JOIN public.rr_plan_rules pr ON pr.plan=s.plan
 WHERE s.user_id=p_user AND s.status='active' AND s.paid_until>now() AND pr.enabled ORDER BY pr.completed_scan_limit DESC LIMIT 1;
 IF NOT FOUND THEN SELECT * INTO STRICT r FROM public.rr_plan_rules WHERE plan='free' AND enabled; END IF;
 SELECT count(*) FILTER(WHERE credit='charged'),count(*) FILTER(WHERE credit='reserved') INTO used,reserved
 FROM public.rr_v_jobs WHERE user_id=p_user AND credit_plan=r.plan AND bonus_grant_id IS NULL AND
 (r.period='lifetime' OR created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' OR credit='reserved');
 SELECT jsonb_build_object('limit',count(*),'remaining',count(*) FILTER(WHERE state='available'),
 'reserved',count(*) FILTER(WHERE state='reserved'),'used',count(*) FILTER(WHERE state='charged')) INTO bonus
 FROM public.rr_v_bonus_grants WHERE user_id=p_user;
 RETURN jsonb_build_object('plan',r.plan,'limit',r.completed_scan_limit,'used',used,'reserved',reserved,
 'remaining',greatest(0,r.completed_scan_limit-used-reserved)+(bonus->>'remaining')::int,
 'base_remaining',greatest(0,r.completed_scan_limit-used-reserved),'bonus',bonus,'period',r.period,
 'attempts_per_24h',config.attempts_per_day,'reset_timezone','UTC','resets_at',CASE WHEN r.period='month' THEN
  to_char(date_trunc('month',now() AT TIME ZONE 'UTC')+interval '1 month','YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END,
 'approved_offer',jsonb_build_object('monthly_price_cents',4700,'currency','USD','monthly_scans',10,'free_lifetime_scans',1,'status','approved_not_live'),
 'provider',config.provider,'enabled',(config.enabled AND CASE WHEN config.admission_mode='owner' THEN config.pilot_owner_uuid IS NOT NULL AND p_user=config.pilot_owner_uuid AND config.pilot_job_id IS NULL WHEN config.admission_mode='beta' THEN rr_visibility_internal.beta_eligible(p_user) AND EXISTS(SELECT 1 FROM public.rr_v_beta_members WHERE user_id=p_user AND admissions<2) ELSE false END),'is_fixture',config.provider='fixture');
END $$;
CREATE OR REPLACE FUNCTION public.rr_v_submit(p_user uuid,p_key uuid,p_hash text,p_input jsonb,p_prompts jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.rr_v_config;j public.rr_v_jobs;a jsonb;spent bigint;held bigint; bonus_id uuid;
BEGIN
 SELECT * INTO c FROM public.rr_v_config WHERE id FOR UPDATE; -- shared admission/budget mutex
 IF c.admission_mode='owner' THEN
  IF c.pilot_owner_uuid IS NULL OR p_user IS DISTINCT FROM c.pilot_owner_uuid THEN RETURN jsonb_build_object('error','pilot_unavailable');END IF;
 ELSIF c.admission_mode='beta' THEN
  -- Lock member and auth rows so revocation/deletion cannot race admission.
  PERFORM 1 FROM public.rr_v_beta_members WHERE user_id=p_user FOR UPDATE;
  PERFORM 1 FROM auth.users WHERE id=p_user FOR SHARE;
  IF NOT rr_visibility_internal.beta_eligible(p_user) THEN RETURN jsonb_build_object('error','beta_unavailable');END IF;
 ELSE RETURN jsonb_build_object('error','unavailable'); END IF;
 SELECT * INTO j FROM public.rr_v_jobs WHERE user_id=p_user AND request_key=p_key;
 IF FOUND THEN
  IF j.input_hash<>p_hash THEN RETURN jsonb_build_object('error','key_conflict');END IF;
  RETURN jsonb_build_object('id',j.id,'status',j.status,'replayed',true);
 END IF;
 IF c.admission_mode='beta' AND EXISTS(SELECT 1 FROM public.rr_v_beta_members WHERE user_id=p_user AND admissions>=2) THEN RETURN jsonb_build_object('error','beta_complete');END IF;
 IF c.admission_mode='owner' AND c.pilot_job_id IS NOT NULL THEN RETURN jsonb_build_object('error','pilot_complete');END IF;
 IF NOT c.enabled OR c.provider='disabled' THEN RETURN jsonb_build_object('error','unavailable');END IF;
 IF jsonb_typeof(p_prompts) IS DISTINCT FROM 'array' OR jsonb_array_length(p_prompts)<>3 THEN RAISE EXCEPTION 'Three questions required';END IF;
 IF EXISTS(SELECT 1 FROM public.rr_v_jobs WHERE user_id=p_user AND status IN ('queued','running','reconciliation')) THEN
  RETURN jsonb_build_object('error','run_in_progress');END IF;
 a:=public.rr_v_access(p_user);
 IF (a->>'remaining')::int<1 THEN RETURN jsonb_build_object('error','credits_used');END IF;
 IF (SELECT count(*) FROM public.rr_v_jobs WHERE user_id=p_user AND created_at>now()-interval '24 hours')>=c.attempts_per_day THEN
  RETURN jsonb_build_object('error','attempt_cap');END IF;
 IF (SELECT count(*) FROM public.rr_v_jobs WHERE status IN ('queued','running'))>=c.max_pending THEN
  RETURN jsonb_build_object('error','queue_full');END IF;
 SELECT coalesce(sum(cost_micros),0) INTO spent FROM public.rr_v_questions;
 SELECT coalesce(sum(hold_micros),0) INTO held FROM public.rr_v_jobs;
 IF spent+held+c.reserve_micros>c.budget_micros THEN RETURN jsonb_build_object('error','budget_unavailable');END IF;
 IF (a->>'base_remaining')::int<1 THEN
  SELECT id INTO bonus_id FROM public.rr_v_bonus_grants WHERE user_id=p_user AND state='available' ORDER BY granted_at,id LIMIT 1 FOR UPDATE;
  IF bonus_id IS NULL THEN RETURN jsonb_build_object('error','credits_used');END IF;
 END IF;
 INSERT INTO public.rr_v_jobs(user_id,request_key,input_hash,input,prompts,provider,model,hold_micros,reserve_micros,credit_plan,bonus_grant_id)
 VALUES(p_user,p_key,p_hash,p_input,p_prompts,c.provider,c.model,c.reserve_micros,c.reserve_micros,a->>'plan',bonus_id) RETURNING * INTO j;
 IF c.admission_mode='owner' THEN UPDATE public.rr_v_config SET pilot_job_id=j.id WHERE id;
 ELSE UPDATE public.rr_v_beta_members SET admissions=admissions+1 WHERE user_id=p_user; END IF;
 INSERT INTO public.rr_v_questions(job_id,idx) SELECT j.id,n FROM generate_series(0,2) n;
 INSERT INTO public.rr_v_outbox(job_id) VALUES(j.id); -- same transaction as reservation
 RETURN jsonb_build_object('id',j.id,'status',j.status,'replayed',false);
END $$;
COMMIT;
