-- UNAPPLIED OPERATOR-ONLY REVIEW PROPOSAL. After owner -> beta -> Luna accounting.
-- Manual request-specific USD evidence verification required before any call.
BEGIN;
LOCK TABLE public.rr_v_config IN ACCESS EXCLUSIVE MODE;
DO $guard$ BEGIN
 IF md5((SELECT prosrc FROM pg_proc WHERE oid='public.rr_v_worker(text,uuid,uuid,integer,jsonb)'::regprocedure)) <> 'cd602321886776f45ec1e56bef4da501'
 OR md5((SELECT prosrc FROM pg_proc WHERE oid='public.rr_v_reconcile(uuid,integer,bigint,text)'::regprocedure)) <> 'f10b74a1cfa2d4a37aefdbc514b71f74' THEN RAISE EXCEPTION 'Invoice correction predecessor drift'; END IF;
 IF (SELECT count(*) FROM public.rr_v_config)<>1 OR EXISTS(SELECT 1 FROM public.rr_v_config WHERE enabled OR provider<>'disabled' OR model<>'gpt-6-luna' OR reserve_micros<>1000000)
 OR EXISTS(SELECT 1 FROM public.rr_v_jobs WHERE status IN ('queued','running')) THEN RAISE EXCEPTION 'Correction install requires closed Luna gates and no active jobs'; END IF;
END $guard$;

CREATE TABLE rr_visibility_internal.cost_corrections (
 event_id uuid PRIMARY KEY, job_id uuid NOT NULL, idx integer NOT NULL,
 attempt_id uuid NOT NULL, request jsonb NOT NULL, prior_kind text NOT NULL,
 prior_micros bigint NOT NULL, actual_micros bigint NOT NULL CHECK(actual_micros BETWEEN 0 AND 1000000000),
 delta_micros bigint NOT NULL, source_reference text NOT NULL, source_sha256 text NOT NULL,
 reason text NOT NULL, operator_label text NOT NULL, database_session_user text NOT NULL,
 database_current_user text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 result jsonb NOT NULL
);
ALTER TABLE rr_visibility_internal.cost_corrections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rr_visibility_internal.cost_corrections FROM PUBLIC,anon,authenticated,service_role,rr_visibility_worker,rr_visibility_dispatcher;
CREATE FUNCTION rr_visibility_internal.cost_audit_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'Cost audit is append-only'; END $$;
REVOKE ALL ON FUNCTION rr_visibility_internal.cost_audit_immutable() FROM PUBLIC,anon,authenticated,service_role,rr_visibility_worker,rr_visibility_dispatcher;
CREATE TRIGGER cost_audit_immutable BEFORE UPDATE OR DELETE ON rr_visibility_internal.cost_corrections FOR EACH ROW EXECUTE FUNCTION rr_visibility_internal.cost_audit_immutable();
CREATE TRIGGER cost_audit_no_truncate BEFORE TRUNCATE ON rr_visibility_internal.cost_corrections FOR EACH STATEMENT EXECUTE FUNCTION rr_visibility_internal.cost_audit_immutable();

CREATE FUNCTION rr_visibility_internal.correct_cost(
 p_event uuid,p_job uuid,p_idx integer,p_attempt uuid,p_expected_kind text,p_expected_micros bigint,
 p_actual_micros bigint,p_source text,p_source_sha256 text,p_reason text,p_operator_label text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE c public.rr_v_config;j public.rr_v_jobs;q public.rr_v_questions;
 prior rr_visibility_internal.cost_corrections; req jsonb; answer jsonb; unknown_left boolean;
 job_spend bigint; global_spend bigint; held bigint; incident boolean;
BEGIN
 -- Same serialization order as worker/admission: config, job, question.
 SELECT * INTO STRICT c FROM public.rr_v_config WHERE id FOR UPDATE;
 req:=jsonb_build_object('job',p_job,'idx',p_idx,'attempt',p_attempt,'expected_kind',p_expected_kind,
 'expected_micros',p_expected_micros,'actual_micros',p_actual_micros,'source',p_source,
 'sha256',p_source_sha256,'reason',p_reason,'operator_label',p_operator_label,
 'session_user',session_user,'current_user',current_user);
 SELECT * INTO prior FROM rr_visibility_internal.cost_corrections WHERE event_id=p_event;
 IF FOUND THEN
  IF prior.request IS DISTINCT FROM req THEN RAISE EXCEPTION 'Correction event conflict'; END IF;
  RETURN prior.result;
 END IF;
 IF p_event IS NULL OR p_job IS NULL OR p_attempt IS NULL OR p_idx IS NULL OR p_idx NOT BETWEEN 0 AND 2
 OR p_expected_kind IS NULL OR p_expected_kind NOT IN ('estimated','confirmed','unknown')
 OR p_expected_micros IS NULL OR p_expected_micros<0 OR p_actual_micros IS NULL OR p_actual_micros NOT BETWEEN 0 AND 1000000000
 OR p_source IS NULL OR length(trim(p_source)) NOT BETWEEN 10 AND 500
 OR p_source_sha256 IS NULL OR p_source_sha256 !~ '^[0-9a-f]{64}$'
 OR p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 10 AND 1000
 OR p_operator_label IS NULL OR length(trim(p_operator_label)) NOT BETWEEN 3 AND 120 THEN RAISE EXCEPTION 'Explicit bounded correction evidence required'; END IF;
 SELECT * INTO STRICT j FROM public.rr_v_jobs WHERE id=p_job FOR UPDATE;
 SELECT * INTO STRICT q FROM public.rr_v_questions WHERE job_id=p_job AND idx=p_idx FOR UPDATE;
 IF j.status NOT IN ('completed','failed','reconciliation') THEN RAISE EXCEPTION 'Active job cannot be corrected'; END IF;
 IF q.attempt_id IS DISTINCT FROM p_attempt OR q.cost_kind IS DISTINCT FROM p_expected_kind OR q.cost_micros IS DISTINCT FROM p_expected_micros THEN RAISE EXCEPTION 'Correction compare-and-swap conflict'; END IF;
 IF q.cost_kind='unknown' THEN
  IF j.status<>'reconciliation' OR q.state<>'dispatched' THEN RAISE EXCEPTION 'Unknown outcome must remain in reconciliation'; END IF;
 ELSE
  IF q.state NOT IN ('returned','complete') THEN RAISE EXCEPTION 'No accepted cost to correct'; END IF;
 END IF;
 UPDATE public.rr_v_questions SET cost_micros=p_actual_micros,cost_kind='confirmed',
 state=CASE WHEN q.cost_kind='unknown' THEN 'returned' ELSE state END
 WHERE job_id=p_job AND idx=p_idx;
 SELECT EXISTS(SELECT 1 FROM public.rr_v_questions WHERE job_id=p_job AND (state='dispatched' OR cost_kind='unknown')) INTO unknown_left;
 -- Never release another unresolved request's hold. Never change credits/results/admissions.
 IF j.status='reconciliation' AND NOT unknown_left THEN
  UPDATE public.rr_v_jobs SET status='failed',hold_micros=0,updated_at=now(),
  error='Provider cost reviewed. Your restored credit remains subject to pilot access and attempt limits.' WHERE id=p_job;
 END IF;
 SELECT coalesce(sum(cost_micros),0) INTO job_spend FROM public.rr_v_questions WHERE job_id=p_job;
 SELECT coalesce(sum(cost_micros),0) INTO global_spend FROM public.rr_v_questions;
 SELECT coalesce(sum(hold_micros),0) INTO held FROM public.rr_v_jobs;
 incident:=p_actual_micros>300000 OR job_spend>j.reserve_micros OR global_spend+held>c.budget_micros;
 IF incident THEN UPDATE public.rr_v_config SET enabled=false WHERE id; END IF;
 answer:=jsonb_build_object('event',p_event,'job',p_job,'idx',p_idx,'actual_micros',p_actual_micros,
 'delta_micros',p_actual_micros-q.cost_micros,'unresolved_calls',unknown_left,'incident',incident);
 INSERT INTO rr_visibility_internal.cost_corrections(event_id,job_id,idx,attempt_id,request,prior_kind,prior_micros,actual_micros,delta_micros,source_reference,source_sha256,reason,operator_label,database_session_user,database_current_user,result)
 VALUES(p_event,p_job,p_idx,p_attempt,req,q.cost_kind,q.cost_micros,p_actual_micros,p_actual_micros-q.cost_micros,p_source,p_source_sha256,p_reason,p_operator_label,session_user,current_user,answer);
 RETURN answer;
END $$;
REVOKE ALL ON FUNCTION rr_visibility_internal.correct_cost(uuid,uuid,integer,uuid,text,bigint,bigint,text,text,text,text) FROM PUBLIC,anon,authenticated,service_role,rr_visibility_worker,rr_visibility_dispatcher;
-- Retire legacy unaudited settlement entrypoint; preserve signature but no usable API grant.
CREATE OR REPLACE FUNCTION public.rr_v_reconcile(p_job uuid,p_idx integer,p_actual_micros bigint,p_note text) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'Use reviewed operator-only audited cost correction'; END $$;
REVOKE ALL ON FUNCTION public.rr_v_reconcile(uuid,integer,bigint,text) FROM PUBLIC,anon,authenticated,service_role,rr_visibility_worker,rr_visibility_dispatcher;
-- Fail closed on unexpected ALTER DEFAULT PRIVILEGES grants to other roles.
DO $acl_guard$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
 WHERE p.oid IN ('rr_visibility_internal.correct_cost(uuid,uuid,integer,uuid,text,bigint,bigint,text,text,text,text)'::regprocedure,'rr_visibility_internal.cost_audit_immutable()'::regprocedure,'public.rr_v_reconcile(uuid,integer,bigint,text)'::regprocedure) AND a.grantee<>p.proowner)
 OR EXISTS(SELECT 1 FROM pg_class c CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid='rr_visibility_internal.cost_corrections'::regclass AND a.grantee<>c.relowner) THEN
 RAISE EXCEPTION 'Unexpected non-owner correction ACL; review default privileges'; END IF;
END $acl_guard$;
COMMIT;
