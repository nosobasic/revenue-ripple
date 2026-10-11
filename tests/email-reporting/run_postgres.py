"""Runs the exact proposed SQL in a disposable Unix-socket-only PostgreSQL.
Never reads .env, production DSNs, or production credentials. Use --pg-bin.
"""
import argparse
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import uuid
import psycopg
from psycopg.types.json import Jsonb

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from email_crm.reporting_rpc import sanitize_snapshot

ADMIN='00000000-0000-0000-0000-000000000001'
MEMBER='00000000-0000-0000-0000-000000000002'
DSN=None
PREVIEW=None

def ident(n): return str(uuid.UUID(int=100+n))

class ContractTests(unittest.TestCase):
    def setUp(self):
        self.db=psycopg.connect(DSN,autocommit=True)
        self.db.execute('TRUNCATE users,email_provider_events,email_simulator_admissions,email_simulator_runs,email_delivery_attempts,email_enrollments,email_optin_consents,email_launch_admissions,email_contacts,email_legacy_exclusions,email_legacy_manifest CASCADE')
        self.db.execute('INSERT INTO users VALUES(%s,%s),(%s,%s)',(ADMIN,'admin',MEMBER,'member'))
        self.db.execute('INSERT INTO email_legacy_manifest VALUES(true,true,1)')
        self.db.execute('INSERT INTO email_legacy_exclusions VALUES(%s)',(hashlib.sha256(b'legacy@example.test').hexdigest(),))
        self.clock=datetime.now(timezone.utc)-timedelta(hours=1)
    def tearDown(self): self.db.close()
    def contact(self,n,email=None,status='active',source='explicit-form',admission='new_optin',consent=True):
        cid=ident(n)
        self.db.execute('INSERT INTO email_contacts VALUES(%s,%s,%s,%s,%s)',(cid,email or f'fixture{n}@example.test',source,status,self.clock if status=='unsubscribed' else None))
        self.db.execute('INSERT INTO email_launch_admissions(contact_id,disposition) VALUES(%s,%s)',(cid,admission))
        if consent:self.db.execute('INSERT INTO email_optin_consents(contact_id,version,source) VALUES(%s,%s,%s)',(cid,'free-education-2026-10-06',source))
        return cid
    def attempt(self,n,cid,state='accepted',step=0,sequence='indoctrination',accepted=None,template='human/welcome.html',message=None):
        eid=ident(1000+n);aid=ident(2000+n);message=message or f'message{n}'
        self.db.execute('INSERT INTO email_enrollments VALUES(%s,%s,%s)',(eid,cid,sequence))
        self.db.execute('INSERT INTO email_delivery_attempts(id,enrollment_id,step_index,provider,state,provider_message_id,accepted_at,sequence_snapshot) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)',
                        (aid,eid,step,'ses',state,message,accepted or self.clock,Jsonb({'steps':[{'template_key':template}]})))
        return eid,message
    def event(self,message,recipient,kind='delivery',key=None,when=None,provider='ses'):
        self.db.execute('INSERT INTO email_provider_events VALUES(%s,%s,%s,%s,%s,%s)',(provider,key or uuid.uuid4().hex,recipient,kind,message,when or self.clock+timedelta(minutes=1)))
    def call(self,role='authenticated',subject=ADMIN,days=30,claims_extra=None):
        with psycopg.connect(DSN,autocommit=True) as connection:
            connection.execute(psycopg.sql.SQL('SET ROLE {}').format(psycopg.sql.Identifier(role)))
            claims={'role':role,'sub':subject,**(claims_extra or {})}
            connection.execute("SELECT set_config('request.jwt.claims',%s,false)",(json.dumps(claims),))
            return connection.execute('SELECT public.email_reporting_snapshot(%s)',(days,)).fetchone()[0]
    def test_identity_and_exact_privileges(self):
        for role,subject in [('anon',None),('authenticated',MEMBER),('authenticated',None),('service_role',ADMIN)]:
            with self.assertRaises(psycopg.errors.InsufficientPrivilege):self.call(role,subject,claims_extra={'admin':True,'user_metadata':{'role':'admin'}})
        self.assertEqual(self.call()['delivery']['counts']['accepted'],0)
        self.db.execute('UPDATE users SET role=%s WHERE id=%s',('member',ADMIN))
        with self.assertRaises(psycopg.errors.InsufficientPrivilege):self.call()
        for role in ['anon','authenticated','service_role']:
            for table in ['users','email_simulator_admissions','email_simulator_runs','email_contacts']:
                self.assertFalse(self.db.execute("SELECT has_table_privilege(%s,%s,'SELECT')",(role,table)).fetchone()[0])
        self.assertTrue(self.db.execute("SELECT has_function_privilege('authenticated','email_reporting_snapshot(integer)','EXECUTE')").fetchone()[0])
        self.assertFalse(self.db.execute("SELECT has_function_privilege('service_role','email_reporting_snapshot(integer)','EXECUTE')").fetchone()[0])
        self.assertFalse(self.db.execute("SELECT has_function_privilege('anon','email_reporting_snapshot(integer)','EXECUTE')").fetchone()[0])
    def test_no_actor_parameters_and_restricted_window(self):
        self.assertEqual(self.db.execute("SELECT pg_get_function_identity_arguments('email_reporting_snapshot(integer)'::regprocedure)").fetchone()[0],'p_days integer')
        for days in [None,0,-1,100,2147483647]:
            with self.assertRaises(psycopg.errors.InvalidParameterValue):self.call(days=days)
    def test_dedup_provider_feedback_accepted_and_multiple_messages_per_person(self):
        cid=self.contact(1)
        for n in [1,2]:
            self.attempt(n,cid,step=n-1)
            for _ in range(3):self.event(f'message{n}','fixture1@example.test')
            self.event(f'message{n}','fixture1@example.test','send')
        # Same provider message linked by a duplicate attempt must still count once.
        self.attempt(3,cid,message='message1')
        self.event('unrelated-message','fixture1@example.test')
        self.event('message2','fixture1@example.test',provider='other')
        report=self.call();counts=report['delivery']['counts']
        self.assertEqual((counts['accepted'],counts['delivery'],counts['send']),(2,2,2))
        self.assertEqual(sum(row['accepted'] for row in report['delivery']['messages']),2)
        self.assertEqual(sum(row['accepted'] for row in report['delivery']['daily']),2)
        self.assertNotIn('@',json.dumps(report));self.assertNotIn(cid,json.dumps(report))
    def test_recipient_mismatch_fails_closed_instead_of_false_zero_delivery(self):
        cid=self.contact(1);self.attempt(1,cid)
        self.event('message1','previous-address@example.test')
        with self.assertRaises(psycopg.errors.DataException):self.call()

    def test_expired_admission_and_mutated_fields_remain_excluded(self):
        cid=self.contact(1);eid,_=self.attempt(1,cid)
        run=ident(3000)
        self.db.execute('INSERT INTO email_simulator_runs VALUES(%s,false,%s)',(run,self.clock-timedelta(days=20)))
        self.db.execute('INSERT INTO email_simulator_admissions VALUES(%s,%s,%s)',(eid,cid,run))
        self.event('message1','fixture1@example.test')
        report=self.call();self.assertEqual(report['list']['total'],0);self.assertEqual(report['delivery']['counts']['accepted'],0)
        # Enrollment identity also wins if contact linkage changes later.
        human=self.contact(2);self.db.execute('UPDATE email_enrollments SET contact_id=%s WHERE id=%s',(human,eid))
        self.assertEqual(self.call()['delivery']['counts']['accepted'],0)
    def test_domain_source_consent_and_immutable_snapshot_defenses(self):
        self.attempt(1,self.contact(1,email='success@simulator.amazonses.com'))
        self.attempt(2,self.contact(2,source='ses-simulator:expired:operator-test-not-human-consent'))
        self.attempt(3,self.contact(3),template='simulator/isolated-delivery-test.html')
        self.attempt(4,self.contact(4))
        self.db.execute('UPDATE email_optin_consents SET source=%s WHERE contact_id=%s',('archived:operator-test-not-human-consent',ident(4)))
        self.assertEqual(self.call()['delivery']['counts']['accepted'],0)
        self.assertEqual(self.call()['list']['total'],0)
    def test_uncertain_no_acceptance_and_eligibility_exclusions(self):
        self.attempt(1,self.contact(1),state='uncertain');self.event('message1','fixture1@example.test')
        self.contact(2,email='legacy@example.test')
        self.contact(3,status='unsubscribed')
        self.contact(4,admission='existing_review')
        self.contact(5,consent=False)
        self.contact(6)
        report=self.call()
        self.assertEqual(report['delivery']['counts']['accepted'],0)
        self.assertEqual(report['delivery']['operations']['uncertain'],1)
        self.assertEqual(report['list']['eligible'],1)
        self.assertEqual(report['list']['unsubscribed_in_window'],1)
        self.assertIsNone(report['list']['growth'])
        self.db.execute('UPDATE email_legacy_manifest SET ready=false')
        self.assertIsNone(self.call()['list']['eligible'])
    def test_window_cohort_future_feedback_and_pre_acceptance_feedback(self):
        cid=self.contact(1)
        self.attempt(1,cid,accepted=self.clock-timedelta(days=100))
        self.event('message1','fixture1@example.test')
        self.attempt(2,cid);self.event('message2','fixture1@example.test',when=self.clock-timedelta(days=100))
        self.attempt(3,cid);self.event('message3','fixture1@example.test',when=self.clock+timedelta(days=100))
        report=self.call(days=7)
        self.assertEqual(report['delivery']['counts']['accepted'],2)
        self.assertEqual(report['delivery']['counts']['delivery'],1)
        self.assertEqual((datetime.fromisoformat(report['window_end'])-datetime.fromisoformat(report['window_start'])).total_seconds(),7*86400)
    def test_bounces_and_delays_do_not_invent_final_soft_or_delivery(self):
        cid=self.contact(1);self.attempt(1,cid)
        for kind in ['transient_bounce','deliverydelay','open','click']:
            self.event('message1','fixture1@example.test',kind)
        result=sanitize_snapshot(self.call(),30)
        self.assertEqual(result['delivery']['counts']['delivery'],0)
        self.assertEqual(result['delivery']['counts']['transient_bounce'],1)
        self.assertEqual(result['engagement']['status'],'unavailable')
        self.assertNotIn('open',result['delivery']['counts'])
    def test_read_only_and_bounded_groups(self):
        cid=self.contact(1)
        self.attempt(1,cid,sequence='private@do-not-return.test',step=9999)
        result=self.call();self.assertEqual(result['delivery']['messages'][0]['sequence'],'other')
        self.assertEqual(result['delivery']['messages'][0]['step'],0)
        meta=self.db.execute("SELECT provolatile,prosecdef,proconfig,pg_get_userbyid(proowner) FROM pg_proc WHERE oid='email_reporting_snapshot(integer)'::regprocedure").fetchone()
        self.assertEqual(meta[0],'s');self.assertTrue(meta[1]);self.assertIn('search_path=pg_catalog, public',meta[2]);self.assertEqual(meta[3],'postgres')
        # Actual read-only transaction succeeds; no operational RPC/write required.
        with psycopg.connect(DSN) as connection:
            connection.execute('SET TRANSACTION READ ONLY')
            connection.execute('SET LOCAL ROLE authenticated')
            connection.execute("SELECT set_config('request.jwt.claims',%s,true)",(json.dumps({'sub':ADMIN,'role':'authenticated'}),))
            self.assertEqual(connection.execute('SELECT email_reporting_snapshot(30)').fetchone()[0]['delivery']['counts']['accepted'],1)
    def test_populated_fixture_for_preview(self):
        # Fixture preview only: generated by the exact SQL and response sanitizer.
        cid=self.contact(1)
        for n in range(1,9):
            self.attempt(n,cid,step=n-1,accepted=self.clock-timedelta(days=n%5))
            self.event(f'message{n}','fixture1@example.test','send')
            if n<=6:self.event(f'message{n}','fixture1@example.test')
        self.event('message7','fixture1@example.test','bounced')
        self.event('message8','fixture1@example.test','transient_bounce')
        self.event('message6','fixture1@example.test','complained')
        self.contact(2,status='unsubscribed');self.contact(3,admission='legacy_review');self.contact(4)
        self.attempt(20,self.contact(5),state='uncertain')
        report=sanitize_snapshot(self.call(days=7),7)
        self.assertEqual(report['delivery']['counts']['accepted'],8)
        self.assertEqual(report['delivery']['counts']['delivery'],6)
        if PREVIEW:PREVIEW.write_text(json.dumps(report,indent=2)+'\n')


def main():
    global DSN,PREVIEW
    parser=argparse.ArgumentParser();parser.add_argument('--pg-bin',required=True);parser.add_argument('--preview-json',type=Path);args=parser.parse_args()
    pg=Path(args.pg_bin).resolve();PREVIEW=args.preview_json
    base=Path(tempfile.mkdtemp(prefix='rr-reporting-pg-'));data=base/'data';started=False
    try:
        subprocess.run([str(pg/'initdb'),'-D',str(data),'-U','postgres','--auth=trust','--no-locale','--encoding=UTF8'],check=True,stdout=subprocess.DEVNULL)
        with (data/'postgresql.conf').open('a') as f:f.write(f"\nlisten_addresses=''\nunix_socket_directories='{base}'\nport=55437\n")
        subprocess.run([str(pg/'pg_ctl'),'-D',str(data),'-l',str(base/'postgres.log'),'-w','start'],check=True,stdout=subprocess.DEVNULL);started=True
        DSN=f'host={base} port=55437 user=postgres dbname=postgres'
        with psycopg.connect(DSN,autocommit=True) as conn:
            conn.execute((ROOT/'tests/email-reporting/schema.sql').read_text())
            conn.execute((ROOT/'docs/review-sql/email-reporting-snapshot.sql').read_text())
        result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(ContractTests))
        return 0 if result.wasSuccessful() else 1
    finally:
        if started:subprocess.run([str(pg/'pg_ctl'),'-D',str(data),'-m','fast','-w','stop'],check=True,stdout=subprocess.DEVNULL)
        shutil.rmtree(base)
        print('Disposable PostgreSQL stopped and removed; no production connection used.')
if __name__=='__main__':raise SystemExit(main())
