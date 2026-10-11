-- LOCAL REVIEW CANDIDATE ONLY. No production application or grants authorized.
-- Prerequisites: installed delivery, opt-in, simulator-isolation contracts.
-- No caller-supplied actor/admin flag. Auth.uid() comes from the validated user JWT.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
CREATE FUNCTION public.email_reporting_snapshot(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
SET timezone = 'UTC'
AS $function$
DECLARE result jsonb;
BEGIN
 IF auth.role() IS DISTINCT FROM 'authenticated' OR auth.uid() IS NULL
 OR NOT EXISTS (SELECT 1 FROM public.users WHERE id=auth.uid() AND role='admin') THEN
  RAISE EXCEPTION 'Administrator access required' USING ERRCODE='42501';
 END IF;
 IF p_days IS NULL OR p_days NOT IN (7,30,90) THEN
  RAISE EXCEPTION 'Unsupported reporting window' USING ERRCODE='22023';
 END IF;
 WITH
 bounds AS MATERIALIZED (
  SELECT statement_timestamp() AS as_of,
   statement_timestamp()-make_interval(hours=>p_days*24) AS since
 ),
 -- All historical admissions, including expired/disabled runs. Never use the
 -- active simulator predicate: its expiry would reclassify old tests as human.
 humans AS MATERIALIZED (
  SELECT c.* FROM public.email_contacts c
  WHERE lower(btrim(c.email)) NOT LIKE '%@simulator.amazonses.com'
   AND coalesce(c.source,'') NOT LIKE 'ses-simulator:%'
   AND position('operator-test-not-human-consent' in coalesce(c.source,''))=0
   AND NOT EXISTS (SELECT 1 FROM public.email_simulator_admissions x WHERE x.contact_id=c.id)
   AND NOT EXISTS (SELECT 1 FROM public.email_delivery_attempts a JOIN public.email_enrollments e ON e.id=a.enrollment_id
    CROSS JOIN LATERAL jsonb_array_elements(coalesce(a.sequence_snapshot->'steps','[]'::jsonb)) step
    WHERE e.contact_id=c.id AND coalesce(step->>'template_key','') LIKE 'simulator/%')
   AND NOT EXISTS (SELECT 1 FROM public.email_optin_consents o WHERE o.contact_id=c.id
    AND (o.source LIKE 'ses-simulator:%' OR position('operator-test-not-human-consent' in o.source)>0))
 ),
 attempts AS MATERIALIZED (
  SELECT a.*, e.contact_id, e.sequence_id, lower(btrim(c.email)) AS recipient
  FROM public.email_delivery_attempts a
  JOIN public.email_enrollments e ON e.id=a.enrollment_id
  JOIN humans c ON c.id=e.contact_id
  WHERE a.provider='ses'
   AND NOT EXISTS (SELECT 1 FROM public.email_simulator_admissions x WHERE x.enrollment_id=e.id)
   -- Extra immutable-attempt defense, not a substitute for admission history.
   AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(a.sequence_snapshot->'steps','[]'::jsonb)) step
    WHERE coalesce(step->>'template_key','') LIKE 'simulator/%')
 ),
 cohort AS MATERIALIZED (
  SELECT DISTINCT ON (a.provider,a.provider_message_id,a.recipient)
   a.provider,a.provider_message_id,a.recipient,a.accepted_at,
   CASE WHEN a.sequence_id IN ('indoctrination','dmd_course_26','founders_annual','tripwire_buyer','paid_buyer','list_restart')
    THEN a.sequence_id ELSE 'other' END AS sequence,
   CASE WHEN a.step_index BETWEEN 0 AND 99 THEN a.step_index+1 ELSE 0 END AS step
  FROM attempts a CROSS JOIN bounds b
  WHERE a.state='accepted' AND nullif(btrim(a.provider_message_id),'') IS NOT NULL
   AND a.accepted_at>=b.since AND a.accepted_at<b.as_of
  ORDER BY a.provider,a.provider_message_id,a.recipient,a.accepted_at,a.id
 ),
 feedback AS MATERIALIZED (
  SELECT e.provider,e.message_id,lower(btrim(e.recipient)) AS recipient,
   bool_or(e.event_type='send') AS sent, bool_or(e.event_type='delivery') AS delivered,
   bool_or(e.event_type='bounced') AS hard_bounce, bool_or(e.event_type='transient_bounce') AS non_permanent_bounce,
   bool_or(e.event_type='complained') AS complaint, bool_or(e.event_type='reject') AS rejected,
   max(e.occurred_at) AS last_feedback
  FROM public.email_provider_events e JOIN cohort c
   ON e.provider=c.provider AND e.message_id=c.provider_message_id AND lower(btrim(e.recipient))=c.recipient
  CROSS JOIN bounds b WHERE e.occurred_at<b.as_of
   AND e.event_type IN ('send','delivery','bounced','transient_bounce','complained','reject')
  GROUP BY e.provider,e.message_id,lower(btrim(e.recipient))
 ),
 outcomes AS MATERIALIZED (
  SELECT c.*, coalesce(f.sent,false) AS sent, coalesce(f.delivered,false) AS delivered,
   coalesce(f.hard_bounce,false) AS hard_bounce, coalesce(f.non_permanent_bounce,false) AS non_permanent_bounce,
   coalesce(f.complaint,false) AS complaint, coalesce(f.rejected,false) AS rejected, f.last_feedback
  FROM cohort c LEFT JOIN feedback f
   ON f.provider=c.provider AND f.message_id=c.provider_message_id AND f.recipient=c.recipient
 ),
 integrity AS (
  SELECT NOT EXISTS(SELECT 1 FROM cohort c JOIN public.email_provider_events e
   ON e.provider=c.provider AND e.message_id=c.provider_message_id CROSS JOIN bounds b
   WHERE e.occurred_at<b.as_of AND lower(btrim(e.recipient))<>c.recipient) AS valid
 ),
 count_summary AS (
  SELECT jsonb_build_object('accepted',count(*),'send',count(*) FILTER(WHERE sent),
   'delivery',count(*) FILTER(WHERE delivered),'bounced',count(*) FILTER(WHERE hard_bounce),
   'transient_bounce',count(*) FILTER(WHERE non_permanent_bounce),'complained',count(*) FILTER(WHERE complaint),
   'reject',count(*) FILTER(WHERE rejected)) AS counts, max(last_feedback) AS latest FROM outcomes
 ),
 day_rows AS (
  SELECT day::date::text AS day, count(o.provider_message_id) AS accepted,
   count(o.provider_message_id) FILTER(WHERE o.delivered) AS delivered
  FROM bounds b CROSS JOIN LATERAL generate_series(b.since::date,b.as_of::date,interval '1 day') day
  LEFT JOIN outcomes o ON o.accepted_at::date=day::date GROUP BY day
 ),
 message_rows AS (
  SELECT sequence,step,count(*) AS accepted,count(*) FILTER(WHERE delivered) AS delivered,
   count(*) FILTER(WHERE hard_bounce) AS hard_bounces,count(*) FILTER(WHERE complaint) AS complaints
  FROM outcomes GROUP BY sequence,step
 ),
 operation_summary AS (
  SELECT jsonb_build_object('uncertain',count(*) FILTER(WHERE state='uncertain'),
   'retryable',count(*) FILTER(WHERE state='retryable'),'blocked',count(*) FILTER(WHERE state='blocked'),
   'sending',count(*) FILTER(WHERE state='sending'),'claimed',count(*) FILTER(WHERE state='claimed')) AS operations
  FROM attempts
 ),
 manifest AS (
  SELECT EXISTS(SELECT 1 FROM public.email_legacy_manifest m WHERE m.id AND m.ready
   AND m.expected_count=(SELECT count(*) FROM public.email_legacy_exclusions)) AS ready
 ),
 list_summary AS (
  SELECT count(*) AS total,
   CASE WHEN (SELECT ready FROM manifest) THEN count(*) FILTER(WHERE c.status='active'
    AND EXISTS(SELECT 1 FROM public.email_optin_consents o WHERE o.contact_id=c.id AND o.version='free-education-2026-10-06' AND o.captured_at<=b.as_of)
    AND EXISTS(SELECT 1 FROM public.email_launch_admissions a WHERE a.contact_id=c.id AND a.disposition='new_optin')
    AND NOT EXISTS(SELECT 1 FROM public.email_legacy_exclusions x
     WHERE x.email_sha256=encode(sha256(convert_to(lower(btrim(c.email)),'UTF8')),'hex'))
    AND NOT EXISTS(SELECT 1 FROM public.email_delivery_attempts a JOIN public.email_enrollments e ON e.id=a.enrollment_id
     WHERE e.contact_id=c.id AND a.state='uncertain')) ELSE NULL END AS eligible,
   count(*) FILTER(WHERE c.status IN ('unsubscribed','bounced','complained')) AS suppressed,
   count(*) FILTER(WHERE EXISTS(SELECT 1 FROM public.email_launch_admissions a WHERE a.contact_id=c.id
    AND a.disposition IN ('legacy_review','existing_review'))) AS review,
   count(*) FILTER(WHERE c.status='unsubscribed' AND c.unsubscribed_at>=b.since AND c.unsubscribed_at<b.as_of) AS unsubscribed_in_window
  FROM humans c CROSS JOIN bounds b
 )
 SELECT jsonb_build_object('integrity_ok',(SELECT valid FROM integrity),'contract_version',1,'days',p_days,'generated_at',b.as_of,'window_start',b.since,'window_end',b.as_of,
  'classification',jsonb_build_object('status','available'),
  'delivery',jsonb_build_object('status','available','counts',s.counts,'last_feedback_recorded_at',s.latest,
   'daily',(SELECT coalesce(jsonb_agg(to_jsonb(d) ORDER BY d.day),'[]'::jsonb) FROM day_rows d),
   'messages',(SELECT coalesce(jsonb_agg(to_jsonb(m) ORDER BY m.sequence,m.step),'[]'::jsonb) FROM message_rows m),
   'operations',ops.operations),
  'list',jsonb_build_object('status','available','total',l.total,'eligible',l.eligible,'suppressed',l.suppressed,
   'review',l.review,'unsubscribed_in_window',l.unsubscribed_in_window,'growth',NULL,
   'legacy_exclusion_addresses',(SELECT count(*) FROM public.email_legacy_exclusions),'manifest_ready',m.ready))
 INTO result FROM bounds b CROSS JOIN count_summary s CROSS JOIN operation_summary ops CROSS JOIN list_summary l CROSS JOIN manifest m;
 IF (result->>'integrity_ok')::boolean IS DISTINCT FROM true THEN
  RAISE EXCEPTION 'Recipient evidence requires reconciliation' USING ERRCODE='22000';
 END IF;
 RETURN result-'integrity_ok';
END;
$function$;
ALTER FUNCTION public.email_reporting_snapshot(integer) OWNER TO postgres;
-- Exact reviewed privilege delta: only authenticated may invoke, and the body
-- rejects every non-admin using auth.uid() + the current protected users row.
-- service_role is deliberately NOT a callable reporting principal.
REVOKE ALL ON FUNCTION public.email_reporting_snapshot(integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.email_reporting_snapshot(integer) TO authenticated;
COMMENT ON FUNCTION public.email_reporting_snapshot(integer) IS
 'Read-only bounded email aggregates. Verified JWT subject must have current users.role=admin. No PII or historical simulator activity.';
COMMIT;
