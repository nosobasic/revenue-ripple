-- APPROVAL CANDIDATE ONLY: do not run until this exact artifact is approved.
-- Target: operator-verified database postgres, PostgreSQL 15.
-- Operator must independently verify the target connection before execution.
-- This file creates no LOGIN/password, catalog/binding row, service or activation.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
SET LOCAL search_path=pg_catalog;
DO $guard$
BEGIN
 IF current_user <> 'postgres' OR current_database() <> 'postgres'
 OR current_setting('server_version_num')::int NOT BETWEEN 150000 AND 159999 THEN
  RAISE EXCEPTION 'Wrong reviewed database/owner/PostgreSQL major';
 END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname IN ('rr_retention_writer','rr_billing_ingest_login'))
 OR EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='rr_billing_private')
 OR EXISTS(SELECT 1 FROM pg_proc WHERE proname='lock_bound_user') THEN
  RAISE EXCEPTION 'Billing boundary objects already exist: stop for drift review';
 END IF;
END $guard$;
LOCK TABLE public.rr_retention_catalog,public.rr_retention_bindings,
 public.rr_retention_evidence,public.rr_retention_review_holds IN SHARE ROW EXCLUSIVE MODE;
-- Reviewed fingerprints cover columns/defaults/ACLs/constraints/indexes/RLS/policies/triggers.
DO $snapshot$
DECLARE actual jsonb;
BEGIN
 SELECT jsonb_object_agg(relname,fingerprint) INTO actual FROM (SELECT c.relname,
md5(jsonb_build_object(
'owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,'acl',c.relacl::text,
'columns',(SELECT jsonb_agg(jsonb_build_array(a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,pg_get_expr(d.adbin,d.adrelid),a.attacl::text) ORDER BY a.attnum) FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped),
'constraints',(SELECT jsonb_agg(jsonb_build_array(k.conname,pg_get_constraintdef(k.oid,true),k.convalidated) ORDER BY k.conname) FROM pg_constraint k WHERE k.conrelid=c.oid),
'indexes',(SELECT jsonb_agg(jsonb_build_array(ic.relname,pg_get_indexdef(i.indexrelid),i.indisvalid) ORDER BY ic.relname) FROM pg_index i JOIN pg_class ic ON ic.oid=i.indexrelid WHERE i.indrelid=c.oid),
'policies',(SELECT jsonb_agg(jsonb_build_array(p.polname,p.polroles,p.polcmd,p.polpermissive,pg_get_expr(p.polqual,p.polrelid),pg_get_expr(p.polwithcheck,p.polrelid)) ORDER BY p.polname) FROM pg_policy p WHERE p.polrelid=c.oid),
-- Include internal FK constraint triggers and their enabled state. Names contain
-- catalog OIDs, so a restored database requires a fresh independently reviewed snapshot.
'triggers',(SELECT jsonb_agg(jsonb_build_array(pg_get_triggerdef(t.oid),t.tgenabled,t.tgisinternal,t.tgdeferrable,t.tginitdeferred) ORDER BY t.tgname) FROM pg_trigger t WHERE t.tgrelid=c.oid)
)::text) AS fingerprint
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('rr_retention_catalog','rr_retention_bindings','rr_retention_evidence','rr_retention_review_holds') ) snapshot;
 IF actual IS DISTINCT FROM current_setting('rr.reviewed_retention_fingerprints',true)::jsonb THEN
  RAISE EXCEPTION 'Reviewed retention metadata drifted; stop without mutation';
 END IF;
END $snapshot$;

CREATE ROLE rr_retention_writer NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS
 NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE SCHEMA rr_billing_private AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA rr_billing_private FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA rr_billing_private, public TO rr_retention_writer;
GRANT SELECT ON public.rr_retention_catalog, public.rr_retention_bindings,
 public.rr_retention_evidence, public.rr_retention_review_holds TO rr_retention_writer;
GRANT INSERT ON public.rr_retention_evidence, public.rr_retention_review_holds TO rr_retention_writer;
CREATE POLICY writer_catalog ON public.rr_retention_catalog FOR SELECT TO rr_retention_writer
 USING (account_id='acct_1RHozW2Ku9STqdAd');
CREATE POLICY writer_bindings ON public.rr_retention_bindings FOR SELECT TO rr_retention_writer
 USING (account_id='acct_1RHozW2Ku9STqdAd');
CREATE POLICY writer_evidence_read ON public.rr_retention_evidence FOR SELECT TO rr_retention_writer
 USING (account_id='acct_1RHozW2Ku9STqdAd');
CREATE POLICY writer_evidence_insert ON public.rr_retention_evidence FOR INSERT TO rr_retention_writer
 WITH CHECK (account_id='acct_1RHozW2Ku9STqdAd');
CREATE POLICY writer_holds_read ON public.rr_retention_review_holds FOR SELECT TO rr_retention_writer
 USING (EXISTS (SELECT 1 FROM public.rr_retention_bindings b WHERE b.user_id=rr_retention_review_holds.user_id));
CREATE POLICY writer_holds_insert ON public.rr_retention_review_holds FOR INSERT TO rr_retention_writer
 WITH CHECK (EXISTS (SELECT 1 FROM public.rr_retention_bindings b WHERE b.user_id=rr_retention_review_holds.user_id));
-- This single capability takes the same user row lock as EvidenceStore without
-- granting the worker SELECT/UPDATE on profiles. It returns no profile fields.
CREATE FUNCTION rr_billing_private.lock_bound_user(p_user uuid) RETURNS uuid
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
 DECLARE found_user uuid;
 BEGIN
  SELECT u.id INTO found_user FROM public.users u
  WHERE u.id=p_user AND EXISTS (SELECT 1 FROM public.rr_retention_bindings b
   WHERE b.user_id=u.id AND b.account_id='acct_1RHozW2Ku9STqdAd') FOR UPDATE OF u;
  RETURN found_user;
 END $$;
ALTER FUNCTION rr_billing_private.lock_bound_user(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION rr_billing_private.lock_bound_user(uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION rr_billing_private.lock_bound_user(uuid) TO rr_retention_writer;
-- Durable queue stores only minimal event references, not raw Stripe payloads.
CREATE TABLE rr_billing_private.receipts (
 account_id text NOT NULL, event_id text NOT NULL, event jsonb NOT NULL,
 fingerprint text NOT NULL, status text NOT NULL DEFAULT 'pending'
 CHECK(status IN ('pending','running','done','dead')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 next_attempt timestamptz NOT NULL DEFAULT clock_timestamp(),
 lease_token uuid,lease_until timestamptz,result text,
 PRIMARY KEY(account_id,event_id),
 CONSTRAINT receipt_event_integrity CHECK ((
  jsonb_typeof(event)='object'
  AND event ?& ARRAY['account','id','livemode','api_version']
  AND jsonb_typeof(event->'account')='string' AND event->>'account'=account_id
  AND jsonb_typeof(event->'id')='string' AND event->>'id'=event_id
  AND jsonb_typeof(event->'livemode')='boolean' AND event->'livemode'='true'::jsonb
  AND jsonb_typeof(event->'api_version')='string'
  AND event->>'api_version'='2025-03-31.basil'
 ) IS TRUE)
);
CREATE INDEX receipt_due ON rr_billing_private.receipts(status,next_attempt);
ALTER TABLE rr_billing_private.receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rr_billing_private.receipts FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON rr_billing_private.receipts TO rr_retention_writer;
CREATE POLICY receipt_scope ON rr_billing_private.receipts TO rr_retention_writer
 USING(account_id='acct_1RHozW2Ku9STqdAd') WITH CHECK(account_id='acct_1RHozW2Ku9STqdAd');

COMMIT;
