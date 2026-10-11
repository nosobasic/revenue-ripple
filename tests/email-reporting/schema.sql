-- Disposable local fixture schema. No production connection or contact data.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'role'
$$;
GRANT USAGE ON SCHEMA auth, public TO anon,authenticated,service_role;
CREATE TABLE public.users(id uuid PRIMARY KEY,role text NOT NULL);
CREATE TABLE public.email_contacts(id uuid PRIMARY KEY,email text UNIQUE NOT NULL,source text,status text NOT NULL,unsubscribed_at timestamptz);
CREATE TABLE public.email_enrollments(id uuid PRIMARY KEY,contact_id uuid REFERENCES email_contacts(id),sequence_id text NOT NULL);
CREATE TABLE public.email_delivery_attempts(id uuid PRIMARY KEY,enrollment_id uuid REFERENCES email_enrollments(id),step_index integer NOT NULL,
 provider text NOT NULL,state text NOT NULL,provider_message_id text,accepted_at timestamptz,created_at timestamptz DEFAULT now(),sequence_snapshot jsonb NOT NULL,
 UNIQUE(enrollment_id,step_index));
CREATE TABLE public.email_provider_events(provider text,event_key text,recipient text,event_type text,message_id text,occurred_at timestamptz DEFAULT now(),PRIMARY KEY(provider,event_key,recipient));
CREATE TABLE public.email_optin_consents(contact_id uuid REFERENCES email_contacts(id),version text,source text NOT NULL,captured_at timestamptz DEFAULT now(),PRIMARY KEY(contact_id,version));
CREATE TABLE public.email_launch_admissions(contact_id uuid PRIMARY KEY REFERENCES email_contacts(id),disposition text,recorded_at timestamptz DEFAULT now());
CREATE TABLE public.email_legacy_manifest(id boolean PRIMARY KEY,ready boolean,expected_count integer);
CREATE TABLE public.email_legacy_exclusions(email_sha256 text PRIMARY KEY);
CREATE TABLE public.email_simulator_runs(id uuid PRIMARY KEY,enabled boolean,expires_at timestamptz);
CREATE TABLE public.email_simulator_admissions(enrollment_id uuid PRIMARY KEY REFERENCES email_enrollments(id),contact_id uuid REFERENCES email_contacts(id),run_id uuid REFERENCES email_simulator_runs(id));
-- All fixture tables owner-only. Function must work without widening table grants.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC,anon,authenticated,service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
