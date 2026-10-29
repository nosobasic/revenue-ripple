-- READ ONLY; run after approved 01/02 and again before enabling ingress.
BEGIN TRANSACTION READ ONLY;
SET LOCAL search_path=pg_catalog;
DO $verify$
DECLARE r text; obj record; privilege text; expected boolean;
BEGIN
 IF current_user<>'postgres' OR current_database()<>'postgres'
 OR current_setting('server_version_num')::int NOT BETWEEN 150000 AND 159999 THEN
  RAISE EXCEPTION 'Wrong verification context';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_billing_ingest_login'
  AND rolinherit AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcreatedb
  AND NOT rolcreaterole AND NOT rolreplication) THEN
  RAISE EXCEPTION 'Login attributes unsafe';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_retention_writer'
  AND NOT rolcanlogin AND NOT rolinherit AND NOT rolsuper AND NOT rolbypassrls
  AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolreplication) THEN
  RAISE EXCEPTION 'Capability attributes unsafe';
 END IF;
 IF (SELECT count(*) FROM pg_auth_members WHERE member='rr_billing_ingest_login'::regrole)<>1
 OR NOT EXISTS(SELECT 1 FROM pg_auth_members WHERE member='rr_billing_ingest_login'::regrole
  AND roleid='rr_retention_writer'::regrole AND NOT admin_option)
 OR EXISTS(SELECT 1 FROM pg_auth_members WHERE member='rr_retention_writer'::regrole)
 OR EXISTS(SELECT 1 FROM pg_auth_members WHERE roleid='rr_retention_writer'::regrole
  AND member<>'rr_billing_ingest_login'::regrole) THEN
  RAISE EXCEPTION 'Unexpected role memberships or admin option';
 END IF;
 IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE ((n.nspname='public' AND c.relname IN ('rr_retention_catalog','rr_retention_bindings','rr_retention_evidence','rr_retention_review_holds'))
    OR (n.nspname='rr_billing_private' AND c.relname='receipts'))
   AND c.relrowsecurity AND c.relowner='postgres'::regrole)<>5 THEN
  RAISE EXCEPTION 'Retention owner/RLS mismatch';
 END IF;
 IF (SELECT count(*) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE ((n.nspname='public' AND c.relname IN ('rr_retention_catalog','rr_retention_bindings','rr_retention_evidence','rr_retention_review_holds'))
    OR (n.nspname='rr_billing_private' AND c.relname='receipts'))
   AND p.polroles=ARRAY['rr_retention_writer'::regrole::oid])<>7 THEN
  RAISE EXCEPTION 'Expected seven billing-only policies';
 END IF;
 FOREACH r IN ARRAY ARRAY['rr_billing_ingest_login','rr_retention_writer'] LOOP
  IF NOT has_schema_privilege(r,'public','USAGE')
  OR NOT has_schema_privilege(r,'rr_billing_private','USAGE')
  OR has_schema_privilege(r,'public','CREATE')
  OR has_schema_privilege(r,'rr_billing_private','CREATE')
  OR has_database_privilege(r,'postgres','CREATE') THEN
   RAISE EXCEPTION 'Schema/database capability mismatch: %',r;
  END IF;
  -- Catch unrelated table/column grants, not only the three known trigger targets.
  FOR obj IN SELECT c.oid,n.nspname,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('public','rr_billing_private') AND c.relkind IN ('r','p','v','m','f') LOOP
   FOREACH privilege IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] LOOP
    expected := (obj.nspname='public' AND obj.relname IN ('rr_retention_catalog','rr_retention_bindings','rr_retention_evidence','rr_retention_review_holds') AND privilege='SELECT')
     OR (obj.nspname='public' AND obj.relname IN ('rr_retention_evidence','rr_retention_review_holds') AND privilege='INSERT')
     OR (obj.nspname='rr_billing_private' AND obj.relname='receipts' AND privilege IN ('SELECT','INSERT','UPDATE'));
    IF has_table_privilege(r,obj.oid,privilege) IS DISTINCT FROM expected THEN
     RAISE EXCEPTION 'Unexpected effective % on %.% for %',privilege,obj.nspname,obj.relname,r;
    END IF;
    IF privilege IN ('SELECT','INSERT','UPDATE','REFERENCES') AND NOT expected
     AND has_any_column_privilege(r,obj.oid,privilege) THEN
     RAISE EXCEPTION 'Unexpected column privilege on %.%',obj.nspname,obj.relname;
    END IF;
   END LOOP;
  END LOOP;
  FOR obj IN SELECT c.oid FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('public','rr_billing_private') AND c.relkind='S' LOOP
   IF has_sequence_privilege(r,obj.oid,'USAGE,SELECT,UPDATE') THEN
    RAISE EXCEPTION 'Unexpected sequence privilege';
   END IF;
  END LOOP;
  FOR obj IN SELECT p.oid,p.proname,n.nspname,p.prosecdef,p.prorettype FROM pg_proc p
   JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','rr_billing_private') AND p.prokind='f' LOOP
   expected := (obj.nspname='rr_billing_private' AND obj.oid='rr_billing_private.lock_bound_user(uuid)'::regprocedure)
    OR (obj.nspname='public' AND NOT obj.prosecdef AND obj.prorettype='trigger'::regtype
      AND obj.proname IN ('assign_founder_spot_number','update_agent_updated_at_column','update_post_upvotes',
                         'update_progress_timestamp','update_reply_upvotes','update_updated_at_column'));
   IF has_function_privilege(r,obj.oid,'EXECUTE') IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'Unexpected function privilege: %.%',obj.nspname,obj.proname;
   END IF;
  END LOOP;
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM pg_proc p WHERE p.oid='rr_billing_private.lock_bound_user(uuid)'::regprocedure
   AND p.prosecdef AND p.proowner='postgres'::regrole AND p.proconfig=ARRAY['search_path=""']) THEN
  RAISE EXCEPTION 'Private lock owner/search_path/definer mismatch';
 END IF;
 FOREACH r IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
  IF has_schema_privilege(r,'rr_billing_private','USAGE')
   OR has_table_privilege(r,'rr_billing_private.receipts','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
   OR has_function_privilege(r,'rr_billing_private.lock_bound_user(uuid)','EXECUTE') THEN
   RAISE EXCEPTION 'Private boundary accessible by %',r;
  END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl,acldefault('r',c.relowner))) a
   WHERE n.nspname='rr_billing_private' AND c.relname='receipts' AND a.grantee=0)
 OR EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl,acldefault('f',p.proowner))) a
   WHERE n.nspname='rr_billing_private' AND a.grantee=0) THEN
  RAISE EXCEPTION 'Unexpected PUBLIC private-object privilege';
 END IF;
END $verify$;
SELECT 'owner_effective_privileges_pass' AS result;
-- Explicitly disclose inherited PUBLIC rights rather than claiming CONNECT-only.
SELECT has_database_privilege('rr_billing_ingest_login','postgres','CONNECT') AS connect,
 has_database_privilege('rr_billing_ingest_login','postgres','TEMP') AS inherited_temp;
COMMIT;
