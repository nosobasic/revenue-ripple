import unittest
from copy import deepcopy
from retention_fixture import documents,provider,USER
from retention_billing.policy import PaidPolicy
from retention_billing.types import Binding,LIVE_SCOPE,LIVE_CATALOG,ReviewRequired,RetryRequired
class CanonicalProvider(unittest.TestCase):
 def evaluate(self,docs):
  p=provider(docs);b=Binding(LIVE_SCOPE,'sub_fixture','cus_fixture',USER,*LIVE_CATALOG)
  return PaidPolicy().decide(b,p.subscription(b.subscription),p.invoice('in_fixture'),p)
 def test_verified_catalog_and_settlement(self):
  d=self.evaluate(documents());self.assertEqual(d.invoice_id,'in_fixture');self.assertEqual(d.charge,'ch_fixture')
 def test_forged_stale_mismatched_evidence(self):
  changes=[('/v1/subscriptions/sub_fixture',['customer'],'other'),('/v1/subscriptions/sub_fixture',['livemode'],False),
   ('/v1/subscriptions/sub_fixture',['items','has_more'],True),('/v1/subscriptions/sub_fixture',['items','data',0,'quantity'],2),
   ('/v1/subscriptions/sub_fixture',['items','data',0,'price','id'],'wrong'),
   ('/v1/invoices/in_fixture',['customer'],'other'),('/v1/invoices/in_fixture',['total'],1),
   ('/v1/invoices/in_fixture',['post_payment_credit_notes_amount'],1),
   ('/v1/invoices/in_fixture/lines',['data',0,'parent','subscription_item_details','subscription'],'other'),
   ('/v1/invoices/in_fixture/lines',['data',0,'parent','subscription_item_details','proration'],True),
   ('/v1/invoices/in_fixture/lines',['data',0,'period','end'],1),
   ('/v1/invoice_payments',['data',0,'invoice'],'wrong'),('/v1/invoice_payments',['data',0,'amount_paid'],1),
   ('/v1/payment_intents/pi_fixture',['customer'],'other'),('/v1/payment_intents/pi_fixture',['status'],'processing'),
   ('/v1/charges/ch_fixture',['captured'],False),('/v1/charges/ch_fixture',['refunded'],True),
   ('/v1/charges/ch_fixture',['disputed'],True),('/v1/charges/ch_fixture',['amount_captured'],1)]
  for resource,path,value in changes:
   with self.subTest(resource=resource,path=path):
    docs=documents();obj=docs[resource]
    for key in path[:-1]:obj=obj[key]
    obj[path[-1]]=value
    with self.assertRaises((ReviewRequired,RetryRequired)):self.evaluate(docs)
 def test_missing_payment_proof(self):
  docs=documents();docs['/v1/invoice_payments']['data']=[]
  with self.assertRaises(ReviewRequired):self.evaluate(docs)
 def test_paginated_duplicate_denied(self):
  docs=documents();docs['/v1/invoices/in_fixture/lines']['has_more']=True
  with self.assertRaisesRegex(ReviewRequired,'duplicate'):self.evaluate(docs)
 def test_pending_refund_and_dispute(self):
  for path in ['/v1/refunds','/v1/disputes']:
   docs=documents();docs[path]['data']=[dict(id='review_fixture',charge='ch_fixture',livemode=True)]
   with self.assertRaises(ReviewRequired):self.evaluate(docs)
 def test_unpaid_invoice_no_extension(self):
  docs=documents();docs['/v1/invoices/in_fixture']['status']='open';self.assertIsNone(self.evaluate(docs).end)
