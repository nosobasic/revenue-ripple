import unittest,re,time,json
from pathlib import Path
from unittest.mock import patch
from concurrent.futures import ThreadPoolExecutor
import psycopg
from psycopg.rows import dict_row
from flask import Flask
from retention_billing.types import LIVE_SCOPE,LIVE_CATALOG
from retention_billing.store import EvidenceStore
from retention_fixture import documents,provider,USER
from retention_content import retention_bp
ROOT=Path(__file__).resolve().parents[1]
def connect():return psycopg.connect(host='/tmp/rr-retention-final-socket',port=55439,dbname='postgres',user='donte',options='-c client_encoding=UTF8')
class Integration(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  with connect() as con:
   for role in ['anon','authenticated','service_role','postgres']:
    if not con.execute('SELECT 1 FROM pg_roles WHERE rolname=%s',(role,)).fetchone():con.execute('CREATE ROLE '+role+(' SUPERUSER' if role=='postgres' else ' BYPASSRLS' if role=='service_role' else ''))
 def setUp(self):
  with connect() as con:
   con.execute('DROP SCHEMA public CASCADE;CREATE SCHEMA public;DROP SCHEMA IF EXISTS auth CASCADE;SET ROLE postgres')
   con.execute((ROOT/'tests/retention/schema.sql').read_text())
   con.execute("INSERT INTO users VALUES(%s,'member','member',false)",(USER,))
   con.execute((ROOT/'docs/review-sql/paid-retention.sql').read_text().replace('BEGIN;','',1).replace('ROLLBACK;',''))
   con.execute("INSERT INTO rr_retention_catalog VALUES(%s,%s,%s,4700,'usd','month',1)",(LIVE_SCOPE.account,*LIVE_CATALOG))
   con.execute("INSERT INTO rr_retention_bindings VALUES(%s,'sub_fixture',%s,'cus_fixture',%s,%s)",(LIVE_SCOPE.account,USER,*LIVE_CATALOG))
  self.docs=documents();self.provider=provider(self.docs);self.store=EvidenceStore(connect,self.provider)
 def decision(self,user=USER):
  with connect() as con:
   con.execute('SET LOCAL ROLE authenticated');con.execute("SELECT set_config('request.jwt.claim.sub',%s,true)",(user,));return con.execute('SELECT rr_retention_access()').fetchone()[0]
 def api(self):
  app=Flask(__name__);app.register_blueprint(retention_bp)
  def gateway(token,path,params=None,body=None):
   with connect() as con:
    con.execute('SET LOCAL ROLE authenticated');con.execute("SELECT set_config('request.jwt.claim.sub',%s,true)",(USER,))
    if path.startswith('rpc/'):return con.execute('SELECT rr_retention_access()').fetchone()[0]
    with con.cursor(row_factory=dict_row) as cur:
     cur.execute('SELECT *,published_at::text AS published_at FROM content_items WHERE content_type=%s',(params['content_type'][3:],));return cur.fetchall()
  with patch('retention_content.verified_identity'),patch('retention_content._gateway',side_effect=gateway),patch.dict('os.environ',RETENTION_CONTENT_READY='true'):
   return app.test_client().get('/api/vault/playbooks',headers={'Authorization':'Bearer fixture'})
 def test_sdk_store_rls_api_and_sticky_hold(self):
  self.assertEqual(self.api().status_code,503);self.assertEqual(self.store.reconcile(USER,'sub_fixture','in_fixture'),'recorded')
  response=self.api();self.assertEqual(response.status_code,200);self.assertEqual([r['id'] for r in response.json['playbooks']],[1]);self.assertIn('no-store',response.headers['Cache-Control'])
  (ROOT/'tests/retention/api-allowed-fixture.json').write_text(json.dumps(response.json));
  self.docs['/v1/charges/ch_fixture']['disputed']=True;self.assertEqual(self.store.review_charge('ch_fixture'),'review');self.assertEqual(self.api().status_code,503)
  self.docs['/v1/charges/ch_fixture']['disputed']=False;self.store.review_charge('ch_fixture');self.assertEqual(self.decision()['state'],'review')
 def test_cancellation_failed_renewal_and_expiry(self):
  self.store.reconcile(USER,'sub_fixture','in_fixture');end=self.decision()['valid_until']
  self.docs['/v1/subscriptions/sub_fixture'].update(status='canceled',canceled_at=int(time.time()))
  self.assertEqual(self.store.reconcile(USER,'sub_fixture','in_fixture'),'duplicate');self.assertEqual(self.decision()['valid_until'],end)
  self.docs['/v1/subscriptions/sub_fixture']['status']='past_due'
  self.docs['/v1/invoices/in_failed']=dict(self.docs['/v1/invoices/in_fixture'],id='in_failed',status='open',amount_paid=0)
  self.docs['/v1/invoices/in_failed/lines']=self.docs['/v1/invoices/in_fixture/lines']
  self.assertEqual(self.store.reconcile(USER,'sub_fixture','in_failed'),'no_extension');self.assertEqual(self.decision()['valid_until'],end)
  with connect() as con:con.execute('UPDATE rr_retention_evidence SET period_end=now()')
  self.assertEqual(self.decision()['state'],'denied');self.assertEqual(self.api().status_code,403)
 def test_concurrent_duplicates_and_old_event_after_hold(self):
  with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(lambda _:self.store.reconcile(USER,'sub_fixture','in_fixture'),range(2)))
  self.assertCountEqual(results,['recorded','duplicate'])
  self.docs['/v1/refunds']['data']=[dict(id='re_fixture',charge='ch_fixture',livemode=True,status='pending')]
  self.assertEqual(self.store.reconcile(USER,'sub_fixture'),'review');self.docs['/v1/refunds']['data']=[]
  self.store.reconcile(USER,'sub_fixture','in_fixture');self.assertEqual(self.decision()['state'],'review')
 def test_mismatched_owner(self):
  self.docs['/v1/invoices/in_fixture']['customer']='other';self.assertEqual(self.store.reconcile(USER,'sub_fixture','in_fixture'),'review')
  with connect() as con:self.assertEqual(con.execute('SELECT count(*) FROM rr_retention_evidence').fetchone()[0],0)
 def test_changed_settlement(self):
  self.store.reconcile(USER,'sub_fixture','in_fixture');self.docs['/v1/invoices/in_fixture/lines']['data'][0]['period']['end']+=1
  self.assertEqual(self.store.reconcile(USER,'sub_fixture','in_fixture'),'review');self.assertEqual(self.decision()['state'],'review')
 def test_admin_lifetime_free_and_publication(self):
  with connect() as con:con.execute("INSERT INTO users VALUES('00000000-0000-4000-8000-000000000006','member','member',false)")
  self.assertEqual(self.decision('00000000-0000-4000-8000-000000000006')['state'],'denied')
  for role,plan in [('admin','member'),('member','lifetime')]:
   with connect() as con:con.execute('UPDATE users SET role=%s,plan=%s WHERE id=%s',(role,plan,USER))
   self.assertEqual(self.decision()['state'],'allowed');self.assertEqual(len(self.api().json['playbooks']),1)

 def test_signed_event_end_to_end(self):
  import hmac,hashlib
  from retention_billing.events import EventHandler
  secret='offline-fixture-secret';handler=EventHandler(connect,self.provider,secret)
  def send(kind,obj):
   raw=json.dumps(dict(id='evt_fixture',livemode=True,api_version=LIVE_SCOPE.api_version,type=kind,data={'object':obj})).encode()
   timestamp=str(int(time.time()));signature=hmac.new(secret.encode(),timestamp.encode()+b'.'+raw,hashlib.sha256).hexdigest()
   return handler.handle(raw,'t='+timestamp+',v1='+signature)
  self.assertEqual(send('invoice.paid',{'id':'in_fixture'}),'recorded')
  self.assertEqual(send('invoice.paid',{'id':'in_fixture'}),'duplicate')
  self.docs['/v1/charges/ch_fixture']['disputed']=True
  self.assertEqual(send('charge.dispute.created',{'id':'dp_fixture','charge':'ch_fixture'}),'review')
  self.assertEqual(self.api().status_code,503)
  with self.assertRaises(Exception):handler.handle(b'{}','invalid')

 def test_settled_invoice_loses_paid_status_requires_review(self):
  self.store.reconcile(USER,'sub_fixture','in_fixture')
  self.docs['/v1/invoices/in_fixture']['status']='void'
  self.assertEqual(self.store.reconcile(USER,'sub_fixture','in_fixture'),'review')
  self.assertEqual(self.decision()['state'],'review')

 def test_sandbox_http_to_evidence_rls_and_retry(self):
  import stripe,hmac,hashlib
  from retention_billing.http import create_app
  from retention_billing.policy import PaidPolicy
  from retention_billing.types import Scope, RetryRequired
  from retention_billing.stripe_adapter import StripeReadAdapter
  from retention_fixture import OfflineTransport
  scope=Scope('acct_offline_sandbox',False);catalog=('price_offline_sandbox','prod_offline_sandbox')
  def sandbox(value):
   if isinstance(value,list):return [sandbox(v) for v in value]
   if isinstance(value,dict):return {k:False if k=='livemode' else sandbox(v) for k,v in value.items()}
   if value==LIVE_CATALOG[0]:return catalog[0]
   if value==LIVE_CATALOG[1]:return catalog[1]
   return value
  docs=sandbox(documents())
  transport=OfflineTransport(docs,scope)
  provider=StripeReadAdapter(stripe.StripeClient('offline-not-a-key',http_client=transport,max_network_retries=0),scope)
  secret='offline-fixture-secret'
  client=create_app(connect=connect,provider=provider,endpoint_secret=secret,policy=PaidPolicy(scope,catalog)).test_client()
  def send(kind='invoice.paid',ident='in_fixture',**extra):
   raw=json.dumps(dict(id='evt_fixture',livemode=False,api_version=scope.api_version,type=kind,data={'object':dict(id=ident,**extra)})).encode()
   stamp=str(int(time.time()));digest=hmac.new(secret.encode(),stamp.encode()+b'.'+raw,hashlib.sha256).hexdigest()
   return client.post('/webhook/retention',data=raw,headers={'Stripe-Signature':'t='+stamp+',v1='+digest})
  self.assertEqual(send().status_code,503) # Missing binding must not be ACKed.
  with connect() as con:
   con.execute('DELETE FROM rr_retention_bindings;DELETE FROM rr_retention_catalog')
   con.execute("INSERT INTO rr_retention_catalog VALUES(%s,%s,%s,4700,'usd','month',1)",(scope.account,*catalog))
   con.execute("INSERT INTO rr_retention_bindings VALUES(%s,'sub_fixture',%s,'cus_fixture',%s,%s)",(scope.account,USER,*catalog))
  self.assertEqual(send().json,{'status':'recorded'})
  self.assertEqual(self.api().status_code,200)
  self.assertEqual(send().json,{'status':'duplicate'})
  with connect() as con:self.assertEqual(con.execute('SELECT count(*) FROM rr_retention_evidence').fetchone()[0],1)
  with patch.object(provider,'invoice',side_effect=RetryRequired('private')):
   self.assertEqual(send().status_code,503)
  docs['/v1/charges/ch_fixture']['disputed']=True
  response=send('charge.dispute.created','dp_fixture',charge='ch_fixture')
  self.assertEqual((response.status_code,response.json),(200,{'status':'review'}))
  self.assertEqual(self.api().status_code,503)
  self.assertEqual(send().json,{'status':'review'}) # Older paid event cannot clear hold.
