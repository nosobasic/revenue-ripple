"""Real PostgreSQL restricted-role pipeline with offline canonical Stripe GETs."""
import hashlib,hmac,json,time,unittest
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
import test_retention_writer_boundary as boundary
import test_retention_integration as fixture
from retention_billing.durable import create_durable_app
from retention_billing.policy import PaidPolicy
from retention_billing.types import LIVE_SCOPE,RetryRequired

class DurableBilling(unittest.TestCase):
 @classmethod
 def setUpClass(cls):boundary.WriterBoundary.setUpClass()
 def setUp(self):
  boundary.WriterBoundary.setUp(self)
  def restricted():
   con=fixture.connect();con.execute('SET ROLE rr_retention_writer_test');con.commit();return con
  self.connect=restricted;self.secret='offline-only-signing-secret'
  self.app,self.worker=create_durable_app(connect=restricted,provider=self.provider,endpoint_secret=self.secret,policy=PaidPolicy())
  self.client=self.app.test_client();self.queue=self.worker.queue
 def send(self,event_id='evt_receipt',kind='invoice.paid',ident='in_fixture',live=True,account=None,secret=None,**extra):
  event=dict(id=event_id,type=kind,livemode=live,api_version=LIVE_SCOPE.api_version,
    data={'object':dict(id=ident,customer_email='must-not-be-stored@example.invalid',metadata={'private':'discard'},**extra)})
  if account is not None:event['account']=account
  raw=json.dumps(event,indent=2).encode();stamp=str(int(time.time()))
  digest=hmac.new((secret or self.secret).encode(),stamp.encode()+b'.'+raw,hashlib.sha256).hexdigest()
  return self.client.post('/webhook/retention',data=raw,headers={'Stripe-Signature':'t='+stamp+',v1='+digest})
 def due(self):
  with fixture.connect() as con:con.execute("UPDATE rr_billing_private.receipts SET next_attempt=now()-interval '1 second',lease_until=now()-interval '1 second'")
 def test_restricted_http_worker_to_entitlement_and_duplicate(self):
  self.assertEqual(self.send().json,{'status':'accepted'})
  self.assertEqual(self.send().status_code,200)
  with fixture.connect() as con:
   event=con.execute('SELECT event::text FROM rr_billing_private.receipts').fetchone()[0]
   self.assertNotIn('must-not-be-stored',event);self.assertNotIn('metadata',event)
  self.assertEqual(self.worker.run_once(),'recorded')
  self.assertEqual(fixture.Integration.api(self).status_code,200)
  self.assertEqual(self.worker.run_once(),'idle')
  self.send(event_id='evt_redelivery')
  self.assertEqual(self.worker.run_once(),'duplicate')
  with fixture.connect() as con:self.assertEqual(con.execute('SELECT count(*) FROM rr_retention_evidence').fetchone()[0],1)
 def test_untrusted_and_cross_mode_rejected_before_receipt(self):
  for args,status in [({'secret':'wrong'},400),({'live':False},409),({'account':'acct_wrong'},409)]:
   self.assertEqual(self.send(**args).status_code,status)
  self.assertEqual(self.queue.counts(),{})
 def test_same_event_id_conflict_is_not_overwritten(self):
  self.send();self.assertEqual(self.send(kind='invoice.payment_failed').status_code,409)
  self.assertEqual(self.worker.run_once(),'recorded')
 def test_provider_outage_is_durable_retry_then_recovers(self):
  self.send()
  with patch.object(self.provider,'invoice',side_effect=RetryRequired('private-error')):
   self.assertEqual(self.worker.run_once(),'retry')
  self.assertEqual(self.queue.counts(),{'pending':1});self.assertEqual(self.worker.run_once(),'idle')
  self.due();self.assertEqual(self.worker.run_once(),'recorded')
 def test_missing_binding_retries_then_dead_without_grant(self):
  with fixture.connect() as con:con.execute('DELETE FROM rr_retention_bindings')
  self.send()
  for _ in range(8):
   self.due();self.assertEqual(self.worker.run_once(),'retry')
  self.assertEqual(self.queue.counts(),{'dead':1})
  with fixture.connect() as con:self.assertEqual(con.execute('SELECT count(*) FROM rr_retention_evidence').fetchone()[0],0)
 def test_crash_after_evidence_commit_recovers_idempotently(self):
  self.send()
  with patch.object(self.queue,'finish',side_effect=RuntimeError('simulated process death')):
   with self.assertRaises(RuntimeError):self.worker.run_once()
  self.assertEqual(self.queue.counts(),{'running':1})
  self.due();self.assertEqual(self.worker.run_once(),'duplicate')
  self.assertEqual(self.queue.counts(),{'done':1})
 def test_concurrent_workers_claim_once_and_stale_lease_cannot_ack(self):
  self.send()
  with ThreadPoolExecutor(max_workers=2) as pool:
   results=list(pool.map(lambda _:self.worker.run_once(),range(2)))
  self.assertCountEqual(results,['recorded','idle'])
  self.send(event_id='evt_second');old=self.queue.claim();self.due();new=self.queue.claim()
  self.assertFalse(self.queue.finish(old,'recorded'))
  self.assertTrue(self.queue.finish(new,'duplicate'))
 def test_refund_and_old_paid_event_preserve_hold(self):
  self.send();self.worker.run_once()
  self.docs['/v1/charges/ch_fixture']['refunded']=True
  self.docs['/v1/charges/ch_fixture']['amount_refunded']=4700
  self.send(event_id='evt_refund',kind='charge.refunded',ident='ch_fixture')
  self.assertEqual(self.worker.run_once(),'review')
  self.docs['/v1/charges/ch_fixture']['refunded']=False
  self.docs['/v1/charges/ch_fixture']['amount_refunded']=0
  self.send(event_id='evt_old_paid');self.assertEqual(self.worker.run_once(),'duplicate')
  self.assertEqual(fixture.Integration.api(self).status_code,503)
 def test_unmatched_refund_can_arrive_before_paid_event(self):
  self.send(event_id='evt_early_review',kind='charge.dispute.created',ident='dp_fixture',charge='ch_fixture')
  self.assertEqual(self.worker.run_once(),'retry')
  self.send(event_id='evt_paid');self.assertEqual(self.worker.run_once(),'recorded')
  self.docs['/v1/charges/ch_fixture']['disputed']=True
  self.due();self.assertEqual(self.worker.run_once(),'review')
  self.assertEqual(fixture.Integration.api(self).status_code,503)
 def test_last_attempt_crash_becomes_dead(self):
  self.send()
  with fixture.connect() as con:con.execute("UPDATE rr_billing_private.receipts SET status='running',attempts=8,lease_until=now()-interval '1 second'")
  self.assertEqual(self.worker.run_once(),'idle');self.assertEqual(self.queue.counts(),{'dead':1})
 def test_enqueue_failure_is_never_acknowledged(self):
  with patch.object(self.queue,'enqueue',side_effect=RuntimeError('private-db')):
   response=self.send();self.assertEqual(response.status_code,503);self.assertNotIn(b'private-db',response.data)
 def test_canonical_customer_mismatch_cannot_grant(self):
  self.docs['/v1/invoices/in_fixture']['customer']='cus_wrong'
  self.send();self.assertEqual(self.worker.run_once(),'review')
  with fixture.connect() as con:self.assertEqual(con.execute('SELECT count(*) FROM rr_retention_evidence').fetchone()[0],0)
  self.assertEqual(fixture.Integration.api(self).status_code,503)
 def test_sandbox_durable_worker_uses_separate_account_and_catalog(self):
  import stripe
  from pathlib import Path
  from retention_billing.types import Scope,LIVE_CATALOG
  from retention_billing.stripe_adapter import StripeReadAdapter
  from retention_fixture import documents,OfflineTransport,USER
  scope=Scope('acct_offline_sandbox',False);catalog=('price_offline_sandbox','prod_offline_sandbox')
  def sandbox(value):
   if isinstance(value,list):return [sandbox(v) for v in value]
   if isinstance(value,dict):return {k:False if k=='livemode' else sandbox(v) for k,v in value.items()}
   if value==LIVE_CATALOG[0]:return catalog[0]
   if value==LIVE_CATALOG[1]:return catalog[1]
   return value
  with fixture.connect() as con:
   con.execute('DROP SCHEMA rr_billing_private CASCADE;SET ROLE postgres')
   for table,names in [('rr_retention_catalog',['writer_catalog']),('rr_retention_bindings',['writer_bindings']),('rr_retention_evidence',['writer_evidence_read','writer_evidence_insert']),('rr_retention_review_holds',['writer_holds_read','writer_holds_insert'])]:
    for name in names:con.execute('DROP POLICY '+name+' ON '+table)
   sql=(Path(__file__).parent/'retention/writer-boundary.sql').read_text().replace(LIVE_SCOPE.account,scope.account).replace("event->>'livemode'='true'","event->>'livemode'='false'")
   con.execute(sql)
   con.execute('DELETE FROM rr_retention_bindings;DELETE FROM rr_retention_catalog')
   con.execute("INSERT INTO rr_retention_catalog VALUES(%s,%s,%s,4700,'usd','month',1)",(scope.account,*catalog))
   con.execute("INSERT INTO rr_retention_bindings VALUES(%s,'sub_fixture',%s,'cus_fixture',%s,%s)",(scope.account,USER,*catalog))
  docs=sandbox(documents());provider=StripeReadAdapter(stripe.StripeClient('offline-not-a-key',http_client=OfflineTransport(docs,scope),max_network_retries=0),scope)
  app,worker=create_durable_app(connect=self.connect,provider=provider,endpoint_secret=self.secret,policy=PaidPolicy(scope,catalog))
  self.client=app.test_client()
  self.assertEqual(self.send(live=True).status_code,409)
  self.assertEqual(self.send(live=False,account=scope.account).status_code,200)
  self.assertEqual(worker.run_once(),'recorded')
  self.assertEqual(fixture.Integration.api(self).status_code,200)
