-- REVIEW ONLY. Apply after integrated-owner-pilot then beta-admission, never automatically.
-- 300000 micros is a planning allocation/incident threshold, NOT a provider hard cap.
-- 1000000 reserves the whole proposed owner-pilot allowance; no spending is enabled here.
BEGIN;
LOCK TABLE public.rr_v_config IN ACCESS EXCLUSIVE MODE;
DO $guard$ BEGIN
 IF md5((SELECT prosrc FROM pg_proc WHERE oid='public.rr_v_worker(text,uuid,uuid,integer,jsonb)'::regprocedure)) <> '3399893eaf3f4c7b41f50c70df79f06a'
 OR md5((SELECT prosrc FROM pg_proc WHERE oid='public.rr_v_access(uuid)'::regprocedure)) <> 'd5caeac7ae8a844ae2fc9c282e869c2b'
 OR md5((SELECT prosrc FROM pg_proc WHERE oid='public.rr_v_submit(uuid,uuid,text,jsonb,jsonb)'::regprocedure)) <> '58300fa10b4215c221837a329f474f28' THEN RAISE EXCEPTION 'Luna accounting predecessor drift'; END IF;
 IF (SELECT count(*) FROM public.rr_v_config)<>1 OR EXISTS(SELECT 1 FROM public.rr_v_config WHERE enabled OR provider<>'disabled' OR budget_micros<>0 OR model<>'gpt-4.1-mini' OR reserve_micros<>100000 OR admission_mode<>'owner' OR pilot_job_id IS NOT NULL)
 OR EXISTS(SELECT 1 FROM public.rr_v_jobs) OR EXISTS(SELECT 1 FROM public.rr_v_outbox) THEN RAISE EXCEPTION 'Luna proposal requires pristine closed owner gates'; END IF;
END $guard$;
UPDATE public.rr_v_config SET model='gpt-6-luna',reserve_micros=1000000 WHERE id;
-- CREATE OR REPLACE preserves ACLs/ownership; independently verify those before release.
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
  IF j.hold_micros<300000 THEN RETURN jsonb_build_object('error','budget_unavailable');END IF;
  UPDATE public.rr_v_questions SET state='dispatched',attempt_id=gen_random_uuid(),cost_kind='unknown'
   WHERE job_id=j.id AND idx=p_idx RETURNING * INTO q;
  RETURN jsonb_build_object('attempt_id',q.attempt_id);
 ELSIF p_op='returned' THEN
  -- A retry of this persistence RPC never calls the provider again or charges twice.
  IF q.state IN ('returned','complete') AND q.attempt_id::text=p_data->>'attempt_id' THEN RETURN jsonb_build_object('status','saved');END IF;
  IF q.state IS DISTINCT FROM 'dispatched' OR q.attempt_id::text IS DISTINCT FROM p_data->>'attempt_id' THEN
   RETURN jsonb_build_object('error','attempt_mismatch');END IF;
  cost:=(p_data->>'cost_micros')::bigint;
  IF cost IS NULL OR cost<0 OR jsonb_typeof(p_data->'cost_micros') IS DISTINCT FROM 'number' OR (p_data->>'cost_micros') !~ '^[0-9]+$' OR jsonb_typeof(p_data->'cost_kind') IS DISTINCT FROM 'string' OR coalesce(p_data->>'cost_kind','') NOT IN ('estimated','confirmed') OR NOT(p_data ? 'raw') THEN RAISE EXCEPTION 'Invalid cost/response';END IF;
  UPDATE public.rr_v_questions SET state='returned',raw=p_data->'raw',cost_micros=cost,cost_kind=p_data->>'cost_kind'
   WHERE job_id=j.id AND idx=p_idx;
  UPDATE public.rr_v_jobs SET hold_micros=greatest(0,hold_micros-cost),updated_at=now() WHERE id=j.id;
  IF cost>300000 THEN UPDATE public.rr_v_config SET enabled=false WHERE id;END IF; -- incident, never hide overspend
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
