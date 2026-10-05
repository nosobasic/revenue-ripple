-- Read-only. Returns definitions/privileges, NEVER application rows.
-- Save output locally before any approved production execution.
WITH targets AS (
 SELECT c.* FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN ('users','payments','subscriptions','commissions','tripwire_purchases','webhook_logs','user_engagement')
)
SELECT jsonb_build_object(
 'captured_at',current_timestamp,
 'tables',(SELECT jsonb_agg(jsonb_build_object('name',relname,'owner',pg_get_userbyid(relowner),
   'rls',relrowsecurity,'force_rls',relforcerowsecurity,'acl',relacl::text)) FROM targets),
 'columns',(SELECT jsonb_agg(to_jsonb(a)) FROM (
   SELECT c.relname,a.attname,format_type(a.atttypid,a.atttypmod) AS type,a.attnotnull,
     a.attacl::text,pg_get_expr(d.adbin,d.adrelid) AS default_expression
   FROM targets c JOIN pg_attribute a ON a.attrelid=c.oid
   LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum
   WHERE a.attnum>0 AND NOT a.attisdropped ORDER BY c.relname,a.attnum
 ) a),
 'policies',(SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE schemaname='public'
   AND tablename IN ('users','payments','subscriptions','commissions','tripwire_purchases','webhook_logs','user_engagement')),
 'triggers',(SELECT jsonb_agg(jsonb_build_object('table',c.relname,'definition',pg_get_triggerdef(t.oid),
   'function',pg_get_functiondef(t.tgfoid))) FROM targets c JOIN pg_trigger t ON t.tgrelid=c.oid WHERE NOT t.tgisinternal),
 'is_admin',(SELECT jsonb_agg(jsonb_build_object('definition',pg_get_functiondef(p.oid),'acl',p.proacl::text,
   'owner',pg_get_userbyid(p.proowner))) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='is_admin'),
 'memberships',(SELECT jsonb_agg(jsonb_build_object('member',m.rolname,'role',r.rolname))
   FROM pg_auth_members a JOIN pg_roles m ON m.oid=a.member JOIN pg_roles r ON r.oid=a.roleid
   WHERE m.rolname IN ('anon','authenticated','service_role'))
) AS metadata_backup;
