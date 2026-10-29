-- INCIDENT APPROVAL: stop worker and disable the new provider endpoint FIRST.
-- Restore server:app with billing disabled; drain/restart its DB connections.
-- Preserve all receipts, evidence, bindings, holds, policies and schema.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
ALTER ROLE rr_billing_ingest_login NOLOGIN;
REVOKE rr_retention_writer FROM rr_billing_ingest_login;
COMMIT;
-- NOLOGIN does not terminate existing sessions. After stopping/draining services,
-- verify no remaining pg_stat_activity entries for this exact login.
-- If sessions remain, a separately reviewed targeted termination is required.
-- Do not DROP OWNED, DROP SCHEMA, delete data, clear holds or revoke global PUBLIC.
