-- PROPOSED ONLY. Not approved for production execution. Ends ROLLBACK.
-- Requires fresh owner review of existing ACLs/functions and dedicated worker credentials.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $guard$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_retention_writer')
 OR EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='rr_billing_private') THEN
  RAISE EXCEPTION 'Writer boundary exists; stop for drift review';
 END IF;
 IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN ('rr_retention_catalog','rr_retention_bindings',
   'rr_retention_evidence','rr_retention_review_holds') AND c.relkind='r'
   AND c.relrowsecurity AND pg_get_userbyid(c.relowner)='postgres')<>4 THEN
  RAISE EXCEPTION 'Retention table prerequisite mismatch';
 END IF;
END $guard$;
CREATE ROLE rr_retention_writer NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS
 NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE SCHEMA rr_billing_private;
REVOKE ALL ON SCHEMA rr_billing_private FROM PUBLIC;
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
 CHECK(event->>'account'=account_id AND event->>'id'=event_id),
 CHECK(event->>'livemode'='true'),
 CHECK(event->>'api_version'='2025-03-31.basil')
);
CREATE INDEX receipt_due ON rr_billing_private.receipts(status,next_attempt);
ALTER TABLE rr_billing_private.receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rr_billing_private.receipts FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON rr_billing_private.receipts TO rr_retention_writer;
CREATE POLICY receipt_scope ON rr_billing_private.receipts TO rr_retention_writer
 USING(account_id='acct_1RHozW2Ku9STqdAd') WITH CHECK(account_id='acct_1RHozW2Ku9STqdAd');

ROLLBACK;
