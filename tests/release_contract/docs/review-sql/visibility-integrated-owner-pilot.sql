-- COMBINED OWNER PILOT CANDIDATE ONLY. Never apply automatically. No grants seeded or services enabled.
-- Exact live rr_v_access/submit baseline verified read-only on 2026-11-05.
-- Refuses owner-pilot or any other definition drift; compose and retest before release.
BEGIN;
LOCK TABLE public.rr_v_config IN ACCESS EXCLUSIVE MODE;
DO $guard$ BEGIN
 IF md5(pg_get_functiondef('public.rr_v_access(uuid)'::regprocedure)) <> '4f83bda6040cbaf62b5190bebe9b6e9a'
 OR md5(pg_get_functiondef('public.rr_v_submit(uuid,uuid,text,jsonb,jsonb)'::regprocedure)) <> 'a222ec7f8e14402393c6b96e0d1f16f6' THEN
 RAISE EXCEPTION 'Visibility definition drift: compose changes and retest'; END IF;
 IF (SELECT count(*) FROM public.rr_v_config)<>1 OR EXISTS(SELECT 1 FROM public.rr_v_jobs) OR EXISTS(SELECT 1 FROM public.rr_v_outbox) OR EXISTS(SELECT 1 FROM public.rr_v_config WHERE enabled OR provider<>'disabled' OR budget_micros<>0) THEN
 RAISE EXCEPTION 'Candidate requires disabled zero-budget configuration'; END IF;
END $guard$;
ALTER TABLE public.rr_v_config ADD COLUMN pilot_owner_uuid uuid, ADD COLUMN pilot_job_id uuid;
-- Consumed pilot slot has no FK/reset hook: refunds/deletions never reopen it.
CREATE SCHEMA rr_visibility_internal;
REVOKE ALL ON SCHEMA rr_visibility_internal FROM PUBLIC,anon,authenticated,service_role;
CREATE TABLE public.rr_v_bonus_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id),
 campaign text NOT NULL CHECK(campaign='welcome-back-v1'),
 eligibility_reference text NOT NULL CHECK(length(trim(eligibility_reference)) BETWEEN 10 AND 240),
 granted_at timestamptz NOT NULL DEFAULT now(),
 state text NOT NULL DEFAULT 'available' CHECK(state IN ('available','reserved','charged')),
 job_id uuid REFERENCES public.rr_v_jobs(id),
 UNIQUE(user_id,campaign),
 CHECK((state='available' AND job_id IS NULL) OR (state IN ('reserved','charged') AND job_id IS NOT NULL))
);
ALTER TABLE public.rr_v_bonus_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rr_v_bonus_grants FROM PUBLIC,anon,authenticated,service_role;
-- Issuance is intentionally owner-only, with no API, service-role grant, claim link or CRM coupling.
ALTER TABLE public.rr_v_jobs ADD COLUMN bonus_grant_id uuid REFERENCES public.rr_v_bonus_grants(id);
CREATE FUNCTION rr_visibility_internal.sync_bonus_credit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE changed int;
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.bonus_grant_id IS NULL AND OLD.bonus_grant_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.bonus_grant_id IS DISTINCT FROM OLD.bonus_grant_id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
   RAISE EXCEPTION 'Credit ownership is immutable'; END IF;
  IF NEW.bonus_grant_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.credit=OLD.credit THEN RETURN NEW; END IF;
  IF OLD.credit<>'reserved' OR NEW.credit NOT IN ('charged','refunded') THEN
   RAISE EXCEPTION 'Invalid bonus credit transition'; END IF;
  IF NEW.credit='charged' THEN
   UPDATE public.rr_v_bonus_grants SET state='charged'
   WHERE id=NEW.bonus_grant_id AND user_id=NEW.user_id AND state='reserved' AND job_id=NEW.id;
  ELSE
   UPDATE public.rr_v_bonus_grants SET state='available',job_id=NULL
   WHERE id=NEW.bonus_grant_id AND user_id=NEW.user_id AND state='reserved' AND job_id=NEW.id;
  END IF;
 ELSE
  IF NEW.bonus_grant_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.credit<>'reserved' THEN RAISE EXCEPTION 'New bonus job must reserve'; END IF;
  UPDATE public.rr_v_bonus_grants SET state='reserved',job_id=NEW.id
  WHERE id=NEW.bonus_grant_id AND user_id=NEW.user_id AND state='available';
 END IF;
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>1 THEN RAISE EXCEPTION 'Bonus credit unavailable or inconsistent'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION rr_visibility_internal.sync_bonus_credit() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER rr_v_bonus_credit_sync AFTER INSERT OR UPDATE ON public.rr_v_jobs
FOR EACH ROW EXECUTE FUNCTION rr_visibility_internal.sync_bonus_credit();

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
 'provider',config.provider,'enabled',(config.enabled AND config.pilot_owner_uuid IS NOT NULL AND p_user=config.pilot_owner_uuid AND config.pilot_job_id IS NULL),'is_fixture',config.provider='fixture');
END $$;

CREATE OR REPLACE FUNCTION public.rr_v_submit(p_user uuid,p_key uuid,p_hash text,p_input jsonb,p_prompts jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.rr_v_config;j public.rr_v_jobs;a jsonb;spent bigint;held bigint; bonus_id uuid;
BEGIN
 SELECT * INTO c FROM public.rr_v_config WHERE id FOR UPDATE; -- shared admission/budget mutex
 IF c.pilot_owner_uuid IS NULL OR p_user IS DISTINCT FROM c.pilot_owner_uuid THEN RETURN jsonb_build_object('error','pilot_unavailable');END IF;
 SELECT * INTO j FROM public.rr_v_jobs WHERE user_id=p_user AND request_key=p_key;
 IF FOUND THEN
  IF j.input_hash<>p_hash THEN RETURN jsonb_build_object('error','key_conflict');END IF;
  RETURN jsonb_build_object('id',j.id,'status',j.status,'replayed',true);
 END IF;
 IF c.pilot_job_id IS NOT NULL THEN RETURN jsonb_build_object('error','pilot_complete');END IF;
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
 UPDATE public.rr_v_config SET pilot_job_id=j.id WHERE id;
 INSERT INTO public.rr_v_questions(job_id,idx) SELECT j.id,n FROM generate_series(0,2) n;
 INSERT INTO public.rr_v_outbox(job_id) VALUES(j.id); -- same transaction as reservation
 RETURN jsonb_build_object('id',j.id,'status',j.status,'replayed',false);
END $$;


DO $guard$ BEGIN
 IF pg_get_functiondef('public.rr_v_worker(text,uuid,uuid,integer,jsonb)'::regprocedure) IS DISTINCT FROM $baseline$CREATE OR REPLACE FUNCTION public.rr_v_worker(p_op text, p_job uuid, p_token uuid DEFAULT NULL::uuid, p_idx integer DEFAULT NULL::integer, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE c public.rr_v_config;j public.rr_v_jobs;q public.rr_v_questions;cost bigint;unknown boolean;
BEGIN
 SELECT * INTO c FROM public.rr_v_config WHERE id FOR UPDATE;
 SELECT * INTO j FROM public.rr_v_jobs WHERE id=p_job FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','missing');END IF;
 IF p_op='claim' THEN
  IF j.status IN ('completed','failed','reconciliation') THEN RETURN jsonb_build_object('status',j.status);END IF;
  IF j.status='running' THEN RETURN jsonb_build_object('status','busy');END IF;
  IF NOT c.enabled OR (SELECT count(*) FROM public.rr_v_jobs WHERE status IN ('running','reconciliation'))>=c.max_running THEN
   RETURN jsonb_build_object('status','busy');END IF;
  UPDATE public.rr_v_jobs SET status='running',token=gen_random_uuid(),lease_until=now()+interval '150 seconds',updated_at=now()
   WHERE id=j.id RETURNING * INTO j;
  RETURN jsonb_build_object('status','claimed','job',to_jsonb(j),
   'questions',(SELECT jsonb_agg(to_jsonb(v) ORDER BY idx) FROM public.rr_v_questions v WHERE job_id=j.id));
 END IF;
 IF j.status<>'running' OR j.token IS DISTINCT FROM p_token OR j.lease_until<now() THEN
  RETURN jsonb_build_object('error','stale_worker');END IF;
 SELECT * INTO q FROM public.rr_v_questions WHERE job_id=j.id AND idx=p_idx FOR UPDATE;
 IF p_op='dispatch' THEN
  IF NOT c.enabled THEN RETURN jsonb_build_object('error','unavailable');END IF;
  IF q.state IS DISTINCT FROM 'pending' THEN RETURN jsonb_build_object('error','already_dispatched');END IF;
  IF EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=j.id AND idx<p_idx AND state<>'complete') THEN
   RETURN jsonb_build_object('error','previous_question_incomplete');END IF;
  IF j.hold_micros<30000 THEN RETURN jsonb_build_object('error','budget_unavailable');END IF;
  UPDATE public.rr_v_questions SET state='dispatched',attempt_id=gen_random_uuid(),cost_kind='unknown'
   WHERE job_id=j.id AND idx=p_idx RETURNING * INTO q;
  RETURN jsonb_build_object('attempt_id',q.attempt_id);
 ELSIF p_op='returned' THEN
  -- A retry of this persistence RPC never calls the provider again or charges twice.
  IF q.state IN ('returned','complete') AND q.attempt_id::text=p_data->>'attempt_id' THEN RETURN jsonb_build_object('status','saved');END IF;
  IF q.state IS DISTINCT FROM 'dispatched' OR q.attempt_id::text IS DISTINCT FROM p_data->>'attempt_id' THEN
   RETURN jsonb_build_object('error','attempt_mismatch');END IF;
  cost:=(p_data->>'cost_micros')::bigint;
  IF cost IS NULL OR cost<0 OR p_data->>'cost_kind' NOT IN ('estimated','confirmed') OR NOT(p_data ? 'raw') THEN RAISE EXCEPTION 'Invalid cost/response';END IF;
  UPDATE public.rr_v_questions SET state='returned',raw=p_data->'raw',cost_micros=cost,cost_kind=p_data->>'cost_kind'
   WHERE job_id=j.id AND idx=p_idx;
  UPDATE public.rr_v_jobs SET hold_micros=greatest(0,hold_micros-cost),updated_at=now() WHERE id=j.id;
  IF cost>30000 THEN UPDATE public.rr_v_config SET enabled=false WHERE id;END IF; -- incident, never hide overspend
  RETURN jsonb_build_object('status','saved');
 ELSIF p_op='evidence' THEN
  IF q.state='complete' THEN RETURN jsonb_build_object('status','saved');END IF;
  IF q.state IS DISTINCT FROM 'returned' THEN RETURN jsonb_build_object('error','response_required');END IF;
  UPDATE public.rr_v_questions SET state='complete',evidence=p_data WHERE job_id=j.id AND idx=p_idx;
  RETURN jsonb_build_object('status','saved');
 ELSIF p_op='finish' THEN
  IF (SELECT count(*) FROM public.rr_v_questions WHERE job_id=j.id AND state='complete')<>3
    OR jsonb_typeof(p_data->'actions') IS DISTINCT FROM 'array' OR jsonb_array_length(p_data->'actions')<>3 THEN
    RETURN jsonb_build_object('error','incomplete');END IF;
  UPDATE public.rr_v_jobs SET status='completed',credit='charged',result=p_data,hold_micros=0,updated_at=now() WHERE id=j.id;
  RETURN jsonb_build_object('status','completed');
 ELSIF p_op='fail' THEN
  SELECT EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=j.id AND state='dispatched') INTO unknown;
  UPDATE public.rr_v_jobs SET status=CASE WHEN unknown THEN 'reconciliation' ELSE 'failed' END,credit='refunded',
   hold_micros=CASE WHEN unknown THEN hold_micros ELSE 0 END,
   error=CASE WHEN unknown THEN 'We could not confirm a provider response. Your scan credit is restored; this attempt needs review before another scan.'
    ELSE 'The scan could not be completed. Your credit was restored. You can try again.' END,updated_at=now() WHERE id=j.id;
  RETURN jsonb_build_object('status',CASE WHEN unknown THEN 'reconciliation' ELSE 'failed' END);
 END IF;
 RAISE EXCEPTION 'Unknown operation';
END $function$
$baseline$ THEN RAISE EXCEPTION 'rr_v_worker baseline drift: review before applying'; END IF;
END $guard$;
CREATE OR REPLACE FUNCTION public.rr_v_worker(p_op text,p_job uuid,p_token uuid DEFAULT NULL,p_idx int DEFAULT NULL,p_data jsonb DEFAULT '{}') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.rr_v_config;j public.rr_v_jobs;q public.rr_v_questions;cost bigint;unknown boolean;
BEGIN
 SELECT * INTO c FROM public.rr_v_config WHERE id FOR UPDATE;
 SELECT * INTO j FROM public.rr_v_jobs WHERE id=p_job FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','missing');END IF;
 IF p_op='claim' THEN
  IF j.status IN ('completed','failed','reconciliation') THEN RETURN jsonb_build_object('status',j.status);END IF;
  IF j.status='running' THEN RETURN jsonb_build_object('status','busy');END IF;
  IF NOT c.enabled OR (SELECT count(*) FROM public.rr_v_jobs WHERE status IN ('running','reconciliation'))>=c.max_running THEN
   RETURN jsonb_build_object('status','busy');END IF;
  UPDATE public.rr_v_jobs SET status='running',token=gen_random_uuid(),lease_until=now()+interval '150 seconds',updated_at=now()
   WHERE id=j.id RETURNING * INTO j;
  RETURN jsonb_build_object('status','claimed','job',to_jsonb(j),
   'questions',(SELECT jsonb_agg(to_jsonb(v) ORDER BY idx) FROM public.rr_v_questions v WHERE job_id=j.id));
 END IF;
 IF j.status<>'running' OR j.token IS DISTINCT FROM p_token OR j.lease_until<now() THEN
  RETURN jsonb_build_object('error','stale_worker');END IF;
 SELECT * INTO q FROM public.rr_v_questions WHERE job_id=j.id AND idx=p_idx FOR UPDATE;
 IF p_op='dispatch' THEN
  IF NOT c.enabled THEN RETURN jsonb_build_object('error','unavailable');END IF;
  IF q.state IS DISTINCT FROM 'pending' THEN RETURN jsonb_build_object('error','already_dispatched');END IF;
  IF EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=j.id AND idx<p_idx AND state<>'complete') THEN
   RETURN jsonb_build_object('error','previous_question_incomplete');END IF;
  IF j.hold_micros<30000 THEN RETURN jsonb_build_object('error','budget_unavailable');END IF;
  UPDATE public.rr_v_questions SET state='dispatched',attempt_id=gen_random_uuid(),cost_kind='unknown'
   WHERE job_id=j.id AND idx=p_idx RETURNING * INTO q;
  RETURN jsonb_build_object('attempt_id',q.attempt_id);
 ELSIF p_op='returned' THEN
  -- A retry of this persistence RPC never calls the provider again or charges twice.
  IF q.state IN ('returned','complete') AND q.attempt_id::text=p_data->>'attempt_id' THEN RETURN jsonb_build_object('status','saved');END IF;
  IF q.state IS DISTINCT FROM 'dispatched' OR q.attempt_id::text IS DISTINCT FROM p_data->>'attempt_id' THEN
   RETURN jsonb_build_object('error','attempt_mismatch');END IF;
  cost:=(p_data->>'cost_micros')::bigint;
  IF cost IS NULL OR cost<0 OR p_data->>'cost_kind' NOT IN ('estimated','confirmed') OR NOT(p_data ? 'raw') THEN RAISE EXCEPTION 'Invalid cost/response';END IF;
  UPDATE public.rr_v_questions SET state='returned',raw=p_data->'raw',cost_micros=cost,cost_kind=p_data->>'cost_kind'
   WHERE job_id=j.id AND idx=p_idx;
  UPDATE public.rr_v_jobs SET hold_micros=greatest(0,hold_micros-cost),updated_at=now() WHERE id=j.id;
  IF cost>30000 THEN UPDATE public.rr_v_config SET enabled=false WHERE id;END IF; -- incident, never hide overspend
  RETURN jsonb_build_object('status','saved');
 ELSIF p_op='evidence' THEN
  IF q.state='complete' THEN RETURN jsonb_build_object('status','saved');END IF;
  IF q.state IS DISTINCT FROM 'returned' THEN RETURN jsonb_build_object('error','response_required');END IF;
  UPDATE public.rr_v_questions SET state='complete',evidence=p_data WHERE job_id=j.id AND idx=p_idx;
  RETURN jsonb_build_object('status','saved');
 ELSIF p_op='finish' THEN
  -- All three questions still need saved evidence, even when no action is supported.
  IF (SELECT count(*) FROM public.rr_v_questions WHERE job_id=j.id AND state='complete')<>3 THEN
    RETURN jsonb_build_object('error','incomplete');END IF;
  -- Check type separately: jsonb_array_length must never run on a non-array.
  IF jsonb_typeof(p_data->'actions') IS DISTINCT FROM 'array' THEN
    RETURN jsonb_build_object('error','incomplete');END IF;
  IF jsonb_array_length(p_data->'actions')>3 THEN
    RETURN jsonb_build_object('error','incomplete');END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_data->'actions') AS items(item)
    WHERE jsonb_typeof(item) IS DISTINCT FROM 'object'
      OR jsonb_typeof(item->'title') IS DISTINCT FROM 'string'
      OR item->>'title' !~ '[^[:space:]]'
      OR jsonb_typeof(item->'action') IS DISTINCT FROM 'string'
      OR item->>'action' !~ '[^[:space:]]'
      OR jsonb_typeof(item->'evidence') IS DISTINCT FROM 'string'
      OR item->>'evidence' !~ '[^[:space:]]'
      OR (item ? 'source_url' AND item->'source_url'<>'null'::jsonb AND (
        jsonb_typeof(item->'source_url') IS DISTINCT FROM 'string'
        OR item->>'source_url' !~ '^https?://[^[:space:]/?#]+'))
  ) THEN RETURN jsonb_build_object('error','incomplete');END IF;
  UPDATE public.rr_v_jobs SET status='completed',credit='charged',result=p_data,hold_micros=0,updated_at=now() WHERE id=j.id;
  RETURN jsonb_build_object('status','completed');
 ELSIF p_op='fail' THEN
  SELECT EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=j.id AND state='dispatched') INTO unknown;
  UPDATE public.rr_v_jobs SET status=CASE WHEN unknown THEN 'reconciliation' ELSE 'failed' END,credit='refunded',
   hold_micros=CASE WHEN unknown THEN hold_micros ELSE 0 END,
   error=CASE WHEN unknown THEN 'We could not confirm a provider response. Your scan credit is restored; this attempt needs review before another scan.'
    ELSE 'The scan could not be completed. Your credit was restored. You can try again.' END,updated_at=now() WHERE id=j.id;
  RETURN jsonb_build_object('status',CASE WHEN unknown THEN 'reconciliation' ELSE 'failed' END);
 END IF;
 RAISE EXCEPTION 'Unknown operation';
END $$;


COMMIT;
