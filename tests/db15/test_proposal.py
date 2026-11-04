"""Only talks to the named disposable Docker container; accepts no DSN/host input."""
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[2]
PROPOSAL = ROOT / 'docs/billing-db-proposal'
CONTAINER = 'rr-db15-proposal-test'

def sql(text, user='postgres', success=True):
    result = subprocess.run(['docker','exec','-i',CONTAINER,'psql','-X','-qAt',
        '-v','ON_ERROR_STOP=1','-U',user,'-d','postgres'], input=text,
        text=True, capture_output=True, timeout=45)
    if success and result.returncode:
        raise AssertionError(result.stderr)
    if not success and result.returncode == 0:
        raise AssertionError('Expected rejected SQL succeeded')
    return result.stdout.strip() if success else result.stderr

def file(name): return (PROPOSAL/name).read_text()

def snapshot():
    query=file('catalog-fingerprints.sql')
    query=query[query.index('SELECT c.relname'):query.rindex('COMMIT;')].strip().rstrip(';')
    return sql("SET search_path=pg_catalog; SELECT jsonb_object_agg(relname,fingerprint) FROM ("+query+") s;")

def migrate(expected=None):
    expected = snapshot() if expected is None else expected
    return sql("SET rr.reviewed_retention_fingerprints='"+expected.replace("'","''")+"';\n"+file('01-boundary.sql'))

def stage():
    migrate()
    sql(file('02-principal.sql'))

def enable():
    stage()
    sql(file('03-enable-principal.sql'))  # Fixture trust auth only; never a real credential.

def seed():
    sql("""INSERT INTO public.users VALUES('00000000-0000-4000-8000-000000000001','member','member',false);
    INSERT INTO public.rr_retention_catalog VALUES('acct_1RHozW2Ku9STqdAd','price_synthetic','prod_synthetic',4700,'usd','month',1);
    INSERT INTO public.rr_retention_bindings VALUES('acct_1RHozW2Ku9STqdAd','sub_synthetic','00000000-0000-4000-8000-000000000001','cus_synthetic','price_synthetic','prod_synthetic');""")

def contents(include_receipts=False):
    tables=['public.rr_retention_'+n for n in ['catalog','bindings','evidence','review_holds']]
    if include_receipts: tables.append('rr_billing_private.receipts')
    return {t:sql("SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY to_jsonb(r)::text),'[]'::jsonb) FROM "+t+" r;") for t in tables}

def receipt(event=None):
    if event is None:
        event={'account':'acct_1RHozW2Ku9STqdAd','id':'evt_synthetic','livemode':True,'api_version':'2025-03-31.basil'}
    payload=json.dumps(event).replace("'","''")
    return "INSERT INTO rr_billing_private.receipts(account_id,event_id,event,fingerprint) VALUES('acct_1RHozW2Ku9STqdAd','evt_synthetic','"+payload+"',repeat('0',64));"

class Proposal(unittest.TestCase):
    def setUp(self):
        self.assertEqual(sql('SHOW server_version_num;'),'150008')
        self.assertEqual(sql('SHOW listen_addresses;'),'')
        self.assertEqual(sql('SHOW data_directory;'),'/var/lib/postgresql/data')
        sql("""DROP SCHEMA IF EXISTS rr_billing_private CASCADE; DROP SCHEMA public CASCADE;
        DO $$ BEGIN IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='rr_billing_ingest_login') THEN
        REVOKE CONNECT ON DATABASE postgres FROM rr_billing_ingest_login; END IF; END $$;
        DROP ROLE IF EXISTS rr_billing_ingest_login; DROP ROLE IF EXISTS rr_retention_writer;
        CREATE SCHEMA public AUTHORIZATION postgres;
        DO $$ BEGIN
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
        IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
        END $$;""")
        sql((ROOT/'tests/db15/setup.sql').read_text())

    def test_missing_snapshot_fails_without_partial_objects(self):
        error=sql(file('01-boundary.sql'),success=False)
        self.assertIn('drifted',error)
        self.assertEqual(sql("SELECT count(*) FROM pg_roles WHERE rolname='rr_retention_writer';"),'0')
        self.assertEqual(sql("SELECT count(*) FROM pg_namespace WHERE nspname='rr_billing_private';"),'0')

    def test_changed_column_fails_closed(self):
        expected=snapshot()
        sql('ALTER TABLE public.rr_retention_evidence ADD COLUMN unexpected text;')
        error=sql("SET rr.reviewed_retention_fingerprints='"+expected+"';"+file('01-boundary.sql'),success=False)
        self.assertIn('drifted',error)
        self.assertEqual(sql("SELECT count(*) FROM pg_roles WHERE rolname='rr_retention_writer';"),'0')

    def assert_drift(self, setup, mutation):
        if setup: sql(setup)
        expected=snapshot();sql(mutation)
        self.assertIn('drifted',sql("SET rr.reviewed_retention_fingerprints='"+expected+"';"+file('01-boundary.sql'),success=False))
        self.assertEqual(sql("SELECT count(*) FROM pg_roles WHERE rolname='rr_retention_writer';"),'0')

    def test_fingerprint_query_mirrors_migration(self):
        query=file('catalog-fingerprints.sql').split('SELECT c.relname,',1)[1].split(' ORDER BY c.relname;',1)[0]
        embedded=file('01-boundary.sql').split('SELECT c.relname,',1)[1].split(' ) snapshot;',1)[0]
        self.assertEqual(query.strip(),embedded.strip())

    def test_drift_policy_roles(self):
        self.assert_drift('CREATE POLICY probe ON public.rr_retention_catalog USING(true);','ALTER POLICY probe ON public.rr_retention_catalog TO anon;')

    def test_drift_policy_command(self):
        self.assert_drift('CREATE POLICY probe ON public.rr_retention_catalog FOR SELECT USING(true);','DROP POLICY probe ON public.rr_retention_catalog; CREATE POLICY probe ON public.rr_retention_catalog FOR UPDATE USING(true);')

    def test_drift_policy_permissiveness(self):
        self.assert_drift('CREATE POLICY probe ON public.rr_retention_catalog USING(true);','DROP POLICY probe ON public.rr_retention_catalog; CREATE POLICY probe ON public.rr_retention_catalog AS RESTRICTIVE USING(true);')

    def test_drift_policy_with_check(self):
        self.assert_drift('CREATE POLICY probe ON public.rr_retention_catalog USING(true) WITH CHECK(false);','ALTER POLICY probe ON public.rr_retention_catalog WITH CHECK(true);')

    def test_drift_user_trigger_enabled(self):
        self.assert_drift('CREATE TRIGGER probe BEFORE UPDATE ON public.rr_retention_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();','ALTER TABLE public.rr_retention_catalog DISABLE TRIGGER probe;')

    def test_drift_internal_fk_trigger_enabled(self):
        self.assertGreater(int(sql("SELECT count(*) FROM pg_trigger WHERE tgrelid='public.rr_retention_bindings'::regclass AND tgisinternal;")),0)
        self.assert_drift('', 'ALTER TABLE public.rr_retention_bindings DISABLE TRIGGER ALL;')

    def test_migration_preserves_existing_contents(self):
        seed()
        sql("INSERT INTO public.rr_retention_review_holds VALUES('00000000-0000-4000-8000-000000000001','synthetic','in_synthetic');")
        sql("""INSERT INTO public.rr_retention_evidence VALUES('acct_1RHozW2Ku9STqdAd','sub_synthetic','00000000-0000-4000-8000-000000000001','cus_synthetic','price_synthetic','prod_synthetic','in_synthetic','ch_synthetic','pi_synthetic',4700,'usd',now()-interval '1 day',now()+interval '29 days',now(),'active');
""")
        before=contents();migrate();self.assertEqual(contents(),before)

    def test_existing_role_fails_closed(self):
        expected=snapshot();sql('CREATE ROLE rr_retention_writer NOLOGIN;')
        self.assertIn('already exist',sql("SET rr.reviewed_retention_fingerprints='"+expected+"';"+file('01-boundary.sql'),success=False))
        self.assertEqual(sql("SELECT count(*) FROM pg_namespace WHERE nspname='rr_billing_private';"),'0')

    def test_existing_schema_fails_closed(self):
        expected=snapshot();sql('CREATE SCHEMA rr_billing_private;')
        self.assertIn('already exist',sql("SET rr.reviewed_retention_fingerprints='"+expected+"';"+file('01-boundary.sql'),success=False))
        self.assertEqual(sql("SELECT count(*) FROM pg_roles WHERE rolname='rr_retention_writer';"),'0')

    def test_effective_owner_verifier_and_no_admin_membership(self):
        stage();self.assertIn('owner_effective_privileges_pass',sql(file('04-verify-owner.sql')))
        self.assertEqual(sql("SELECT r.rolcanlogin,r.rolinherit,m.admin_option FROM pg_roles r JOIN pg_auth_members m ON m.member=r.oid WHERE r.rolname='rr_billing_ingest_login';"),'f|t|f')

    def test_staged_nologin_rejects_actual_connection(self):
        stage();self.assertIn('not permitted to log in',sql('SELECT 1;',user='rr_billing_ingest_login',success=False))

    def test_actual_login_inherits_without_set_role(self):
        enable()
        self.assertEqual(sql("SELECT current_user,session_user,pg_has_role(current_user,'rr_retention_writer','USAGE');",user='rr_billing_ingest_login'),'rr_billing_ingest_login|rr_billing_ingest_login|t')
        self.assertIn('permission denied',sql('SELECT * FROM public.users;',user='rr_billing_ingest_login',success=False))

    def test_inherited_temp_and_invoker_trigger_do_not_escalate(self):
        enable()
        self.assertEqual(sql("SELECT has_database_privilege(current_user,'postgres','TEMP'),has_function_privilege(current_user,'public.update_post_upvotes()','EXECUTE');",user='rr_billing_ingest_login'),'t|t')
        self.assertIn('permission denied',sql("CREATE TEMP TABLE probe(post_id int); CREATE TRIGGER probe_trigger AFTER INSERT ON probe FOR EACH ROW EXECUTE FUNCTION public.update_post_upvotes(); INSERT INTO probe VALUES(1);",user='rr_billing_ingest_login',success=False))

    def test_receipt_allow_cross_account_and_delete_denied(self):
        enable()
        insert="""INSERT INTO rr_billing_private.receipts(account_id,event_id,event,fingerprint) VALUES('acct_1RHozW2Ku9STqdAd','evt_synthetic','{"account":"acct_1RHozW2Ku9STqdAd","id":"evt_synthetic","livemode":true,"api_version":"2025-03-31.basil"}',repeat('0',64));"""
        sql(insert,user='rr_billing_ingest_login')
        sql("UPDATE rr_billing_private.receipts SET result='synthetic' WHERE event_id='evt_synthetic';",user='rr_billing_ingest_login')
        self.assertIn('row-level security',sql(insert.replace('acct_1RHozW2Ku9STqdAd','acct_synthetic_other').replace('evt_synthetic','evt_other'),user='rr_billing_ingest_login',success=False))
        self.assertIn('permission denied',sql('DELETE FROM rr_billing_private.receipts;',user='rr_billing_ingest_login',success=False))

    def test_unbound_hold_and_unrelated_writes_denied(self):
        enable();seed()
        self.assertEqual(sql("SELECT rr_billing_private.lock_bound_user('00000000-0000-4000-8000-000000000099') IS NULL;",user='rr_billing_ingest_login'),'t')
        self.assertIn('row-level security',sql("INSERT INTO public.rr_retention_review_holds VALUES('00000000-0000-4000-8000-000000000099','synthetic','in_synthetic');",user='rr_billing_ingest_login',success=False))
        for stmt in ['UPDATE public.users SET role=role WHERE false','UPDATE public.rr_retention_bindings SET customer_id=customer_id WHERE false','DELETE FROM public.rr_retention_evidence WHERE false','DELETE FROM public.rr_retention_review_holds WHERE false','CREATE TABLE public.bad(x int)','CREATE TABLE rr_billing_private.bad(x int)']:
            with self.subTest(stmt=stmt):self.assertIn('permission denied',sql(stmt,user='rr_billing_ingest_login',success=False))

    def test_verifier_detects_unrelated_privilege(self):
        stage();sql('GRANT SELECT ON public.users TO rr_retention_writer;')
        self.assertIn('Unexpected effective',sql(file('04-verify-owner.sql'),success=False))

    def test_verifier_rejects_policy_drift(self):
        mutations=[
            'ALTER POLICY receipt_scope ON rr_billing_private.receipts USING(true) WITH CHECK(true);',
            'CREATE POLICY extra ON rr_billing_private.receipts TO PUBLIC USING(true) WITH CHECK(true);',
            'ALTER POLICY receipt_scope ON rr_billing_private.receipts TO PUBLIC;',
            "DROP POLICY receipt_scope ON rr_billing_private.receipts; CREATE POLICY receipt_scope ON rr_billing_private.receipts AS RESTRICTIVE TO rr_retention_writer USING(account_id='acct_1RHozW2Ku9STqdAd') WITH CHECK(account_id='acct_1RHozW2Ku9STqdAd');",
            "DROP POLICY receipt_scope ON rr_billing_private.receipts; CREATE POLICY receipt_scope ON rr_billing_private.receipts FOR UPDATE TO rr_retention_writer USING(account_id='acct_1RHozW2Ku9STqdAd') WITH CHECK(account_id='acct_1RHozW2Ku9STqdAd');"]
        for mutation in mutations:
            with self.subTest(mutation=mutation):
                self.setUp();stage();sql(mutation)
                self.assertIn('Policy definition/set mismatch',sql(file('04-verify-owner.sql'),success=False))

    def test_verifier_rejects_lock_body_drift(self):
        stage()
        sql("CREATE OR REPLACE FUNCTION rr_billing_private.lock_bound_user(p_user uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN RETURN p_user; END $$;")
        self.assertIn('Private lock body',sql(file('04-verify-owner.sql'),success=False))

    def test_receipt_missing_null_and_wrong_types_rejected(self):
        enable()
        valid={'account':'acct_1RHozW2Ku9STqdAd','id':'evt_synthetic','livemode':True,'api_version':'2025-03-31.basil'}
        invalid=[{},[],True,'true',42]
        for key in valid:
            missing=dict(valid);del missing[key];invalid.append(missing)
            for value in [None,[],{},42]: invalid.append(dict(valid,**{key:value}))
        invalid.extend([dict(valid,livemode='true'),dict(valid,livemode=False),dict(valid,api_version='wrong')])
        for event in invalid:
            with self.subTest(event=event):
                self.assertIn('receipt_event_integrity',sql(receipt(event),user='rr_billing_ingest_login',success=False))
        self.assertIn('receipt_event_integrity',sql(receipt().replace('\"livemode\": true','\"livemode\": null'),user='rr_billing_ingest_login',success=False))
        sql(receipt(),user='rr_billing_ingest_login')

    def test_rollback_preserves_evidence_and_disables_login(self):
        enable();seed()
        sql("""INSERT INTO public.rr_retention_evidence VALUES('acct_1RHozW2Ku9STqdAd','sub_synthetic','00000000-0000-4000-8000-000000000001','cus_synthetic','price_synthetic','prod_synthetic','in_synthetic','ch_synthetic','pi_synthetic',4700,'usd',now()-interval '1 day',now()+interval '29 days',now(),'active');
        INSERT INTO public.rr_retention_review_holds VALUES('00000000-0000-4000-8000-000000000001','synthetic','in_synthetic');""",user='rr_billing_ingest_login')
        sql(receipt(),user='rr_billing_ingest_login')
        before=contents(include_receipts=True)
        sql(file('rollback-disable-principal.sql'))
        self.assertEqual(contents(include_receipts=True),before)
        self.assertEqual(sql('SELECT (SELECT count(*) FROM public.rr_retention_evidence),(SELECT count(*) FROM public.rr_retention_review_holds),(SELECT count(*) FROM public.rr_retention_bindings);'),'1|1|1')
        self.assertEqual(sql("SELECT count(*) FROM pg_auth_members WHERE member='rr_billing_ingest_login'::regrole;"),'0')
        self.assertIn('not permitted to log in',sql('SELECT 1;',user='rr_billing_ingest_login',success=False))

if __name__=='__main__':
    state=json.loads(subprocess.check_output(['docker','inspect',CONTAINER],text=True))[0]
    assert state['HostConfig']['NetworkMode']=='none'
    assert not state['HostConfig']['PortBindings']
    unittest.main(verbosity=2)
