"""Disposable PostgreSQL permission contract; never connects to hosted Supabase."""
import unittest
from pathlib import Path
import psycopg
import test_retention_integration as fixture
connect = fixture.connect
from retention_fixture import USER

class WriterBoundary(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  fixture.Integration.setUpClass()
  with connect() as con:
   if not con.execute("SELECT 1 FROM pg_roles WHERE rolname='rr_retention_writer_test'").fetchone():
    con.execute('CREATE ROLE rr_retention_writer_test NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION')
 def setUp(self):
  fixture.Integration.setUp(self)
  with connect() as con:
   con.execute('DROP SCHEMA IF EXISTS rr_billing_private CASCADE; SET ROLE postgres')
   con.execute((Path(__file__).parent/'retention/writer-boundary.sql').read_text())
 def writer(self,sql,params=None):
  with connect() as con:
   con.execute('SET LOCAL ROLE rr_retention_writer_test')
   return con.execute(sql,params).fetchall() if sql.lstrip().upper().startswith('SELECT') else con.execute(sql,params).rowcount
 def test_append_hold_but_never_clear_or_edit_identity(self):
  self.assertEqual(str(self.writer('SELECT rr_billing_private.lock_bound_user(%s)',(USER,))[0][0]),USER)
  self.writer("INSERT INTO rr_retention_review_holds VALUES(%s,'fixture_review','in_fixture')",(USER,))
  for sql in ["DELETE FROM rr_retention_review_holds", "UPDATE rr_retention_review_holds SET reason='cleared'", "DELETE FROM rr_retention_evidence", "UPDATE rr_retention_bindings SET customer_id='forged'", "INSERT INTO rr_retention_catalog VALUES('x','p','q',4700,'usd','month',1)", "SELECT role FROM users", "UPDATE users SET role='admin'", "TRUNCATE rr_retention_evidence", "SELECT * FROM content_items"]:
   with self.subTest(sql=sql),self.assertRaises(psycopg.errors.InsufficientPrivilege):self.writer(sql)
 def test_unbound_identity_cannot_lock_or_hold(self):
  other='00000000-0000-4000-8000-000000000099'
  self.assertEqual(self.writer('SELECT rr_billing_private.lock_bound_user(%s)',(other,)),[(None,)])
  with self.assertRaises(psycopg.errors.InsufficientPrivilege):
   self.writer("INSERT INTO rr_retention_review_holds VALUES(%s,'fixture','in_fixture')",(other,))
 def test_no_client_or_service_helper_execution(self):
  with connect() as con:
   for role in ['anon','authenticated','service_role']:
    self.assertFalse(con.execute("SELECT has_function_privilege(%s,'rr_billing_private.lock_bound_user(uuid)','EXECUTE')",(role,)).fetchone()[0])
   self.assertEqual(con.execute("SELECT rolcanlogin,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname='rr_retention_writer_test'").fetchone(),(False,False,False,False,False))
 def test_evidence_append_and_cross_account_rejection(self):
  sql="""INSERT INTO rr_retention_evidence VALUES(%s,'sub_fixture',%s,'cus_fixture',%s,%s,'in_boundary','ch_boundary','pi_boundary',4700,'usd',now()-interval '1 day',now()+interval '29 days',now(),'active')"""
  from retention_billing.types import LIVE_SCOPE,LIVE_CATALOG
  self.writer(sql,(LIVE_SCOPE.account,USER,*LIVE_CATALOG))
  self.assertEqual(self.writer('SELECT count(*) FROM rr_retention_evidence'),[(1,)])
  with self.assertRaises(psycopg.errors.InsufficientPrivilege):self.writer(sql,('acct_wrong',USER,*LIVE_CATALOG))
  with self.assertRaises(psycopg.errors.InsufficientPrivilege):self.writer("UPDATE rr_retention_evidence SET period_end=now()+interval '10 years'")
