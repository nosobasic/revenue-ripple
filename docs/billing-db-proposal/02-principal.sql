-- SEPARATE APPROVAL: staged principal, intentionally NOLOGIN, no password.
-- PostgreSQL 15 role-level INHERIT; GRANT without WITH ADMIN OPTION.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
SET LOCAL search_path=pg_catalog;
DO $guard$ BEGIN
 IF current_user<>'postgres' OR current_database()<>'postgres'
 OR current_setting('server_version_num')::int NOT BETWEEN 150000 AND 159999
 OR EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_billing_ingest_login')
 OR NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_retention_writer'
  AND NOT rolcanlogin AND NOT rolinherit AND NOT rolsuper AND NOT rolbypassrls
  AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolreplication)
 OR to_regclass('rr_billing_private.receipts') IS NULL THEN
  RAISE EXCEPTION 'Principal prerequisites differ; stop';
 END IF;
END $guard$;
CREATE ROLE rr_billing_ingest_login NOLOGIN INHERIT NOSUPERUSER NOBYPASSRLS
 NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD NULL;
GRANT CONNECT ON DATABASE postgres TO rr_billing_ingest_login;
GRANT rr_retention_writer TO rr_billing_ingest_login;
ALTER ROLE rr_billing_ingest_login SET search_path=pg_catalog,public,pg_temp;
ALTER ROLE rr_billing_ingest_login SET statement_timeout='30s';
ALTER ROLE rr_billing_ingest_login SET lock_timeout='5s';
-- PUBLIC CONNECT/TEMP/public USAGE/trigger EXECUTE remain effective (documented).
COMMIT;
