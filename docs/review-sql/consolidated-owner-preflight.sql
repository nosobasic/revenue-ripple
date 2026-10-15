-- Owner-executed read-only preflight. Do not create grants or credentials.
-- Expected Supabase project: gwiqvfvcxcznecbfzlns. Verify connection externally.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '15s';
SELECT current_database(), current_user, current_setting('server_version');
SELECT extname, extversion FROM pg_extension ORDER BY extname;
-- Original Advisor findings: metadata only; do not query these tables' records.
SELECT c.relname,c.relkind,pg_get_userbyid(c.relowner) AS owner,
 c.relrowsecurity,c.relforcerowsecurity,c.reloptions,c.relacl,
 has_table_privilege('anon',c.oid,'SELECT') AS anon_select,
 has_table_privilege('authenticated',c.oid,'SELECT') AS authenticated_select,
 has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') AS anon_any_write,
 has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') AS authenticated_any_write
FROM pg_class c WHERE c.relnamespace='public'::regnamespace
 AND c.relname IN ('point_transactions','user_achievements','learning_streaks',
 'learning_challenges','ai_recommendations','quiz_results','listing_watch','content_items');
SELECT tablename,policyname,roles,cmd,qual,with_check FROM pg_policies
WHERE schemaname='public' AND tablename IN ('point_transactions','user_achievements',
 'learning_streaks','learning_challenges','ai_recommendations','quiz_results','listing_watch');
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_userbyid(p.proowner) AS owner, p.prosecdef AS security_definer,
       ARRAY(SELECT c FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%') AS search_path,
       md5(pg_get_functiondef(p.oid)) AS definition_md5,
       CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       a.privilege_type, a.is_grantable
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
LEFT JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a ON true
WHERE n.nspname='public' AND p.proname LIKE 'email\_%' ESCAPE '\'
  AND p.prokind='f'
ORDER BY p.proname, arguments, grantee;
SELECT c.relname, pg_get_userbyid(c.relowner) AS owner,
       c.relrowsecurity, c.relforcerowsecurity,
       CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       a.privilege_type
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
LEFT JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a ON true
WHERE n.nspname='public' AND c.relkind IN ('r','p')
  AND c.relname IN ('email_human_pilot','email_delivery_policy','email_nurture_policy',
                   'email_nurture_bundles','email_nurture_admissions',
                   'email_legacy_exclusions','email_legacy_manifest')
ORDER BY c.relname, grantee, a.privilege_type;
SELECT enabled, daily_cap, min_interval_seconds FROM public.email_delivery_policy;
SELECT count(*) AS historical_exclusions FROM public.email_legacy_exclusions;
SELECT e.status, e.step_index
FROM public.email_enrollments e JOIN public.email_contacts c ON c.id=e.contact_id
WHERE c.email='nosobasic@duck.com' AND e.sequence_id='indoctrination';
-- Shared retention / visibility catalog; fixture SQL must NEVER replace these.
SELECT p.proname,pg_get_function_identity_arguments(p.oid) AS arguments,
 pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl,
 md5(p.prosrc) AS body_md5,md5(pg_get_functiondef(p.oid)) AS definition_md5,
 has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') AS service_execute
FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.prokind='f'
 AND (p.proname LIKE 'rr_v_%' OR p.proname IN ('rr_access','rr_retention_access','rr_can_read_retention_content','is_admin'))
ORDER BY p.proname,arguments;
SELECT pg_get_functiondef(p.oid) AS entitlement_definition FROM pg_proc p
 WHERE p.pronamespace='public'::regnamespace AND p.prokind='f'
 AND p.proname IN ('rr_access','rr_v_access','rr_retention_access','rr_can_read_retention_content','is_admin');
SELECT c.relname,c.relkind,pg_get_userbyid(c.relowner) AS owner,
 c.relrowsecurity,c.relforcerowsecurity,c.reloptions,c.relacl
FROM pg_class c WHERE c.relnamespace='public'::regnamespace
 AND (c.relname LIKE 'rr_retention_%' OR c.relname LIKE 'rr_v_%'
 OR c.relname IN ('users','rr_subscriptions','rr_plan_rules','founders_annual_members','content_items','ve_content_items'))
ORDER BY c.relname;
SELECT c.relname,a.attname,a.attacl FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
 WHERE c.relnamespace='public'::regnamespace AND c.relname IN ('users','content_items','ve_content_items')
 AND a.attnum>0 AND NOT a.attisdropped AND a.attacl IS NOT NULL;
SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check FROM pg_policies
 WHERE schemaname='public' AND (tablename IN ('users','ve_content_items','rr_subscriptions') OR tablename LIKE 'rr_retention_%')
 ORDER BY tablename,policyname;
SELECT tgname,pg_get_triggerdef(t.oid) FROM pg_trigger t WHERE t.tgrelid='public.users'::regclass AND NOT t.tgisinternal;
SELECT pg_get_viewdef('public.content_items'::regclass,true) AS content_view_definition;
SELECT count(*) AS subscription_rows,
 count(*) FILTER(WHERE plan='premium' AND paid_until>now()) AS future_premium,
 count(*) FILTER(WHERE plan='premium' AND paid_until>now() AND status<>'active') AS inconsistent_future
FROM public.rr_subscriptions;
SELECT count(*) AS unprotected_historical_flags FROM public.users
 WHERE role IS DISTINCT FROM 'admin' AND plan IS DISTINCT FROM 'lifetime' AND has_paid IS TRUE;
SELECT count(*) AS founder_rows FROM public.founders_annual_members;
SELECT content_type,level,count(*) AS item_count,
 count(*) FILTER(WHERE published_at IS NOT NULL AND published_at<=now()) AS published_count
FROM public.ve_content_items GROUP BY content_type,level ORDER BY content_type,level;
ROLLBACK;
