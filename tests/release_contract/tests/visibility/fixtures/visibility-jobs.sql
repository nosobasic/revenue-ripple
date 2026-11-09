-- UNAPPLIED REVIEW DRAFT. Prerequisite: access.sql. Never run automatically.
-- Evidence credits are independent of the earlier readiness rr_scans table.
BEGIN;
CREATE TABLE public.rr_v_config (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), enabled boolean NOT NULL DEFAULT false,
 provider text NOT NULL DEFAULT 'disabled' CHECK(provider IN ('disabled','fixture','openai')),
 model text NOT NULL DEFAULT 'gpt-4.1-mini', budget_micros bigint NOT NULL DEFAULT 0 CHECK(budget_micros>=0),
 reserve_micros bigint NOT NULL DEFAULT 100000 CHECK(reserve_micros>=100000),
 max_running int NOT NULL DEFAULT 2 CHECK(max_running BETWEEN 1 AND 10),
 max_pending int NOT NULL DEFAULT 50 CHECK(max_pending BETWEEN 1 AND 1000),
 attempts_per_day int NOT NULL DEFAULT 3 CHECK(attempts_per_day BETWEEN 1 AND 10)
);
INSERT INTO public.rr_v_config(id) VALUES(true);
CREATE TABLE public.rr_v_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id),
 request_key uuid NOT NULL, input_hash text NOT NULL, input jsonb NOT NULL,
 prompts jsonb NOT NULL CHECK(jsonb_array_length(prompts)=3),
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','completed','failed','reconciliation')),
 credit_plan text NOT NULL REFERENCES public.rr_plan_rules(plan),
 credit text NOT NULL DEFAULT 'reserved' CHECK(credit IN ('reserved','charged','refunded')),
 provider text NOT NULL, model text NOT NULL,
 hold_micros bigint NOT NULL CHECK(hold_micros>=0), reserve_micros bigint NOT NULL,
 token uuid, lease_until timestamptz, result jsonb, error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,request_key)
);
CREATE INDEX ON public.rr_v_jobs(user_id,created_at);
CREATE TABLE public.rr_v_questions (
 job_id uuid NOT NULL REFERENCES public.rr_v_jobs(id), idx int NOT NULL CHECK(idx BETWEEN 0 AND 2),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','dispatched','returned','complete')),
 attempt_id uuid, raw jsonb, evidence jsonb,
 cost_micros bigint NOT NULL DEFAULT 0 CHECK(cost_micros>=0),
 cost_kind text NOT NULL DEFAULT 'none' CHECK(cost_kind IN ('none','estimated','confirmed','unknown')),
 PRIMARY KEY(job_id,idx)
);
CREATE TABLE public.rr_v_outbox (
 job_id uuid PRIMARY KEY REFERENCES public.rr_v_jobs(id), token uuid, lease_until timestamptz,
 next_send_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, attempts int NOT NULL DEFAULT 0
);
CREATE TABLE public.rr_v_reconciliations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),job_id uuid NOT NULL REFERENCES public.rr_v_jobs(id),
 note text NOT NULL,actual_micros bigint NOT NULL CHECK(actual_micros>=0),created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION public.rr_v_access(p_user uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.rr_plan_rules; used int; reserved int; config public.rr_v_config;
BEGIN
 SELECT * INTO config FROM public.rr_v_config WHERE id;
 SELECT pr.* INTO r FROM public.rr_subscriptions s JOIN public.rr_plan_rules pr ON pr.plan=s.plan
 WHERE s.user_id=p_user AND s.status='active' AND s.paid_until>now() AND pr.enabled ORDER BY pr.completed_scan_limit DESC LIMIT 1;
 IF NOT FOUND THEN SELECT * INTO STRICT r FROM public.rr_plan_rules WHERE plan='free' AND enabled; END IF;
 SELECT count(*) FILTER(WHERE credit='charged'),count(*) FILTER(WHERE credit='reserved') INTO used,reserved
 FROM public.rr_v_jobs WHERE user_id=p_user AND credit_plan=r.plan AND
 (r.period='lifetime' OR created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' OR credit='reserved');
 RETURN jsonb_build_object('plan',r.plan,'limit',r.completed_scan_limit,'used',used,'reserved',reserved,
 'remaining',greatest(0,r.completed_scan_limit-used-reserved),'period',r.period,
 'attempts_per_24h',config.attempts_per_day,'reset_timezone','UTC','resets_at',CASE WHEN r.period='month' THEN
  to_char(date_trunc('month',now() AT TIME ZONE 'UTC')+interval '1 month','YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END,
 'approved_offer',jsonb_build_object('monthly_price_cents',4700,'currency','USD','monthly_scans',10,'free_lifetime_scans',1,'status','approved_not_live'),
 'provider',config.provider,'enabled',config.enabled,'is_fixture',config.provider='fixture');
END $$;

CREATE FUNCTION public.rr_v_submit(p_user uuid,p_key uuid,p_hash text,p_input jsonb,p_prompts jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.rr_v_config;j public.rr_v_jobs;a jsonb;spent bigint;held bigint;
BEGIN
 SELECT * INTO c FROM public.rr_v_config WHERE id FOR UPDATE; -- shared admission/budget mutex
 SELECT * INTO j FROM public.rr_v_jobs WHERE user_id=p_user AND request_key=p_key;
 IF FOUND THEN
  IF j.input_hash<>p_hash THEN RETURN jsonb_build_object('error','key_conflict');END IF;
  RETURN jsonb_build_object('id',j.id,'status',j.status,'replayed',true);
 END IF;
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
 INSERT INTO public.rr_v_jobs(user_id,request_key,input_hash,input,prompts,provider,model,hold_micros,reserve_micros,credit_plan)
 VALUES(p_user,p_key,p_hash,p_input,p_prompts,c.provider,c.model,c.reserve_micros,c.reserve_micros,a->>'plan') RETURNING * INTO j;
 INSERT INTO public.rr_v_questions(job_id,idx) SELECT j.id,n FROM generate_series(0,2) n;
 INSERT INTO public.rr_v_outbox(job_id) VALUES(j.id); -- same transaction as reservation
 RETURN jsonb_build_object('id',j.id,'status',j.status,'replayed',false);
END $$;

CREATE FUNCTION public.rr_v_get(p_user uuid,p_job uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j public.rr_v_jobs;
BEGIN
 SELECT * INTO j FROM public.rr_v_jobs WHERE user_id=p_user AND (p_job IS NULL OR id=p_job) ORDER BY created_at DESC LIMIT 1;
 IF NOT FOUND THEN RETURN NULL;END IF;
 RETURN jsonb_build_object('id',j.id,'status',j.status,'credit',j.credit,'input',j.input,'prompts',j.prompts,
 'created_at',j.created_at,'result',j.result,'error',j.error,'is_fixture',j.provider='fixture',
 'completed_questions',(SELECT count(*) FROM public.rr_v_questions WHERE job_id=j.id AND state='complete'));
END $$;

CREATE FUNCTION public.rr_v_outbox_claim() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE ids jsonb;
BEGIN
 WITH picked AS (SELECT o.job_id FROM public.rr_v_outbox o JOIN public.rr_v_jobs j ON j.id=o.job_id
 WHERE j.status='queued' AND o.next_send_at<=now() AND (o.lease_until IS NULL OR o.lease_until<now())
 ORDER BY o.next_send_at LIMIT 20 FOR UPDATE OF o SKIP LOCKED),
 claimed AS (UPDATE public.rr_v_outbox o SET token=gen_random_uuid(),lease_until=now()+interval '90 seconds',attempts=o.attempts+1
 FROM picked p WHERE o.job_id=p.job_id RETURNING o.job_id,o.token)
 SELECT coalesce(jsonb_agg(to_jsonb(claimed)),'[]') INTO ids FROM claimed;
 RETURN ids;
END $$;
CREATE FUNCTION public.rr_v_outbox_ack(p_job uuid,p_token uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE public.rr_v_outbox SET sent_at=now(),next_send_at=now()+interval '5 minutes',lease_until=NULL
 WHERE job_id=p_job AND token=p_token;RETURN FOUND;
END $$;

CREATE FUNCTION public.rr_v_worker(p_op text,p_job uuid,p_token uuid DEFAULT NULL,p_idx int DEFAULT NULL,p_data jsonb DEFAULT '{}') RETURNS jsonb
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
END $$;

CREATE FUNCTION public.rr_v_sweep() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j public.rr_v_jobs;unknown boolean;n int:=0;
BEGIN
 PERFORM 1 FROM public.rr_v_config WHERE id FOR UPDATE;
 FOR j IN SELECT * FROM public.rr_v_jobs WHERE
   (status='running' AND lease_until<now()) OR (status='queued' AND created_at<now()-interval '30 minutes') FOR UPDATE LOOP
  SELECT EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=j.id AND state='dispatched') INTO unknown;
  IF j.status='running' AND NOT unknown THEN
   UPDATE public.rr_v_jobs SET status='queued',token=NULL,lease_until=NULL,updated_at=now() WHERE id=j.id;
   UPDATE public.rr_v_outbox SET next_send_at=now(),lease_until=NULL,token=NULL WHERE job_id=j.id;
  ELSE
   UPDATE public.rr_v_jobs SET status=CASE WHEN unknown THEN 'reconciliation' ELSE 'failed' END,credit='refunded',token=NULL,
    hold_micros=CASE WHEN unknown THEN hold_micros ELSE 0 END,
    error=CASE WHEN unknown THEN 'Provider outcome needs review. Your credit is restored; retry is paused to prevent duplicate costs.'
      ELSE 'The scan queue was unavailable. Your credit is restored; please try again.' END,updated_at=now() WHERE id=j.id;
  END IF;n:=n+1;
 END LOOP;
 RETURN jsonb_build_object('recovered',n,'needs_review',(SELECT count(*) FROM public.rr_v_jobs WHERE status='reconciliation'));
END $$;
-- Backend operator-only: never retry an unknown external call automatically.
-- Actual cost must come from provider records; retain an auditable note.
CREATE FUNCTION public.rr_v_reconcile(p_job uuid,p_idx int,p_actual_micros bigint,p_note text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM 1 FROM public.rr_v_config WHERE id FOR UPDATE;
 IF p_actual_micros<0 OR length(trim(p_note))<10 THEN RAISE EXCEPTION 'Reconciliation evidence required';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.rr_v_jobs WHERE id=p_job AND status='reconciliation' FOR UPDATE) THEN RETURN false;END IF;
 IF NOT EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=p_job AND idx=p_idx AND state='dispatched') THEN RETURN false;END IF;
 UPDATE public.rr_v_questions SET cost_micros=p_actual_micros,cost_kind='confirmed',state='returned'
  WHERE job_id=p_job AND idx=p_idx;
 INSERT INTO public.rr_v_reconciliations(job_id,note,actual_micros) VALUES(p_job,p_note,p_actual_micros);
 UPDATE public.rr_v_jobs SET status='failed',hold_micros=0,updated_at=now(),error='Provider cost was reconciled. Your credit is available for a new scan.' WHERE id=p_job;
 IF (SELECT coalesce(sum(cost_micros),0) FROM public.rr_v_questions)+(SELECT coalesce(sum(hold_micros),0) FROM public.rr_v_jobs)>(SELECT budget_micros FROM public.rr_v_config WHERE id) THEN
  UPDATE public.rr_v_config SET enabled=false WHERE id;END IF;
 RETURN true;
END $$;

CREATE FUNCTION public.rr_v_metrics() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object(
 'queued',(SELECT count(*) FROM public.rr_v_jobs WHERE status='queued'),
 'running',(SELECT count(*) FROM public.rr_v_jobs WHERE status='running'),
 'completed',(SELECT count(*) FROM public.rr_v_jobs WHERE status='completed'),
 'failed',(SELECT count(*) FROM public.rr_v_jobs WHERE status='failed'),
 'reconciliation',(SELECT count(*) FROM public.rr_v_jobs WHERE status='reconciliation'),
 'oldest_queued_seconds',(SELECT coalesce(max(extract(epoch FROM now()-created_at)),0) FROM public.rr_v_jobs WHERE status='queued'),
 'held_micros',(SELECT coalesce(sum(hold_micros),0) FROM public.rr_v_jobs),
 'accounted_cost_micros',(SELECT coalesce(sum(cost_micros),0) FROM public.rr_v_questions),
 'unknown_calls',(SELECT count(*) FROM public.rr_v_questions WHERE cost_kind='unknown'),
 'estimated_cost_records',(SELECT count(*) FROM public.rr_v_questions WHERE cost_kind='estimated'),
 'budget_micros',(SELECT budget_micros FROM public.rr_v_config WHERE id),
 'cost_per_completed_scan_micros',(SELECT coalesce(sum(q.cost_micros)::numeric/nullif(count(DISTINCT j.id),0),0)
 FROM public.rr_v_jobs j JOIN public.rr_v_questions q ON q.job_id=j.id WHERE j.status='completed'));
$$;

DO $$DECLARE t text;sig text;BEGIN
 FOREACH t IN ARRAY ARRAY['rr_v_config','rr_v_jobs','rr_v_questions','rr_v_outbox','rr_v_reconciliations'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
 -- Exact signatures only: never change similarly named functions or overloads.
 FOREACH sig IN ARRAY ARRAY[
  'public.rr_v_access(uuid)',
  'public.rr_v_submit(uuid,uuid,text,jsonb,jsonb)',
  'public.rr_v_get(uuid,uuid)',
  'public.rr_v_outbox_claim()',
  'public.rr_v_outbox_ack(uuid,uuid)',
  'public.rr_v_worker(text,uuid,uuid,integer,jsonb)',
  'public.rr_v_sweep()',
  'public.rr_v_reconcile(uuid,integer,bigint,text)',
  'public.rr_v_metrics()'
 ] LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',sig);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',sig);
 END LOOP;
END $$;
-- Deployment review: grant only outbox/sweep functions to a dedicated dispatcher
-- PostgREST role, and only rr_v_worker to a dedicated worker role. Do not put a
-- Supabase service-role credential in the browser or SQS messages.
DO $$BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_visibility_worker') THEN CREATE ROLE rr_visibility_worker NOLOGIN;END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_visibility_dispatcher') THEN CREATE ROLE rr_visibility_dispatcher NOLOGIN;END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticator') THEN
  GRANT rr_visibility_worker,rr_visibility_dispatcher TO authenticator;
 END IF;
END $$;
GRANT USAGE ON SCHEMA public TO rr_visibility_worker,rr_visibility_dispatcher;
GRANT EXECUTE ON FUNCTION public.rr_v_worker(text,uuid,uuid,int,jsonb) TO rr_visibility_worker;
GRANT EXECUTE ON FUNCTION public.rr_v_outbox_claim(),public.rr_v_outbox_ack(uuid,uuid),public.rr_v_sweep(),public.rr_v_metrics() TO rr_visibility_dispatcher;
COMMIT;
