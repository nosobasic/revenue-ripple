-- READ ONLY via actual dedicated login, after separately approved secure provisioning.
-- Client connection MUST explicitly use sslmode=verify-full with approved CA/hostname.
-- Server ssl=true alone cannot prove client certificate/hostname verification.
BEGIN TRANSACTION READ ONLY;
DO $probe$ BEGIN
 IF session_user<>'rr_billing_ingest_login' OR current_user<>session_user THEN
  RAISE EXCEPTION 'Not the actual dedicated login without SET ROLE';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_stat_ssl WHERE pid=pg_backend_pid() AND ssl) THEN
  RAISE EXCEPTION 'TLS not in use';
 END IF;
 IF NOT pg_has_role(current_user,'rr_retention_writer','USAGE')
 OR NOT has_table_privilege(current_user,'rr_billing_private.receipts','INSERT')
 OR has_table_privilege(current_user,'public.users','SELECT,UPDATE')
 OR has_table_privilege(current_user,'public.rr_retention_bindings','INSERT,UPDATE,DELETE')
 OR has_table_privilege(current_user,'public.rr_retention_evidence','UPDATE,DELETE')
 OR has_table_privilege(current_user,'public.rr_retention_review_holds','UPDATE,DELETE') THEN
  RAISE EXCEPTION 'Dedicated principal effective boundary mismatch';
 END IF;
END $probe$;
SELECT current_user, session_user, ssl, version, cipher FROM pg_stat_ssl WHERE pid=pg_backend_pid();
COMMIT;
