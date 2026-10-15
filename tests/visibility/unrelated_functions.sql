-- Functions that the former broad LIKE pattern would wrongly change.
CREATE FUNCTION public.rr_v_unrelated() RETURNS integer LANGUAGE sql AS 'SELECT 11';
CREATE FUNCTION public.rrXvYunrelated() RETURNS integer LANGUAGE sql AS 'SELECT 12';
CREATE FUNCTION public.rr_v_access(text) RETURNS integer LANGUAGE sql AS 'SELECT 13';
CREATE SCHEMA unrelated;
GRANT USAGE ON SCHEMA unrelated TO anon,authenticated,service_role;
CREATE FUNCTION unrelated.rr_v_access(uuid) RETURNS integer LANGUAGE sql AS 'SELECT 14';
REVOKE ALL ON FUNCTION public.rr_v_unrelated(),public.rrXvYunrelated(),public.rr_v_access(text),unrelated.rr_v_access(uuid) FROM PUBLIC,service_role;
GRANT EXECUTE ON FUNCTION public.rr_v_unrelated(),public.rrXvYunrelated(),public.rr_v_access(text),unrelated.rr_v_access(uuid) TO anon,authenticated;
CREATE TABLE public.fixture_function_acl_before AS
 SELECT oid,proacl::text acl FROM pg_proc WHERE oid IN (
 'public.rr_v_unrelated()'::regprocedure,'public.rrXvYunrelated()'::regprocedure,
 'public.rr_v_access(text)'::regprocedure,'unrelated.rr_v_access(uuid)'::regprocedure);
