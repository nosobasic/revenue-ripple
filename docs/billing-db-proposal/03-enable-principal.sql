-- SEPARATE CREDENTIAL APPROVAL. Does NOT enable billing.
-- After unique password provision through a secure, nonlogging owner workflow,
-- TLS destination/CA verification, and 04-verify-owner.sql passes.
BEGIN;
SET LOCAL statement_timeout='30s';
DO $guard$ BEGIN
 IF current_user<>'postgres' OR current_database()<>'postgres' THEN
  RAISE EXCEPTION 'Wrong owner/database';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_billing_ingest_login'
  AND NOT rolcanlogin AND rolinherit AND NOT rolsuper AND NOT rolbypassrls
  AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolreplication) THEN
  RAISE EXCEPTION 'Unexpected staged principal';
 END IF;
 -- Do not query or print credential contents. Secure provisioning is an operator gate.
END $guard$;
ALTER ROLE rr_billing_ingest_login LOGIN;
COMMIT;
