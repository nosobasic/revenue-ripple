import json,time
from urllib.parse import urlparse
from copy import deepcopy
import stripe
from retention_billing.types import LIVE_SCOPE,LIVE_CATALOG
from retention_billing.policy import month_after
from retention_billing.stripe_adapter import StripeReadAdapter
USER='00000000-0000-4000-8000-000000000005'
def documents(start=None):
 start=int(time.time())-3600 if start is None else start;end=month_after(start);price,product=LIVE_CATALOG
 sub=dict(id='sub_fixture',object='subscription',livemode=True,customer='cus_fixture',status='active',billing_cycle_anchor=start,items={'has_more':False,'data':[dict(id='si_fixture',quantity=1,price=dict(id=price,product=product,unit_amount=4700,currency='usd',billing_scheme='per_unit',recurring=dict(interval='month',interval_count=1,usage_type='licensed')))]})
 inv=dict(id='in_fixture',object='invoice',livemode=True,customer='cus_fixture',parent={'type':'subscription_details','subscription_details':{'subscription':'sub_fixture'}},status='paid',currency='usd',amount_due=4700,amount_paid=4700,amount_remaining=0,total=4700,starting_balance=0,ending_balance=0,collection_method='charge_automatically',billing_reason='subscription_cycle',total_discount_amounts=[],total_taxes=[],pre_payment_credit_notes_amount=0,post_payment_credit_notes_amount=0)
 lines={'object':'list','has_more':False,'data':[dict(id='il_fixture',amount=4700,currency='usd',quantity=1,parent={'type':'subscription_item_details','subscription_item_details':{'subscription':'sub_fixture','subscription_item':'si_fixture','proration':False}},pricing={'type':'price_details','price_details':{'price':price,'product':product}},period=dict(start=start,end=end))]}
 payments={'object':'list','has_more':False,'data':[dict(id='inpay_fixture',invoice='in_fixture',status='paid',amount_paid=4700,payment={'type':'payment_intent','payment_intent':'pi_fixture'})]}
 pi=dict(id='pi_fixture',object='payment_intent',livemode=True,customer='cus_fixture',status='succeeded',currency='usd',amount=4700,amount_received=4700,latest_charge='ch_fixture')
 ch=dict(id='ch_fixture',object='charge',livemode=True,customer='cus_fixture',payment_intent='pi_fixture',status='succeeded',paid=True,captured=True,amount_captured=4700,amount=4700,currency='usd',refunded=False,amount_refunded=0,disputed=False)
 return {'/v1/subscriptions/sub_fixture':sub,'/v1/invoices/in_fixture':inv,'/v1/invoices/in_fixture/lines':lines,'/v1/invoice_payments':payments,'/v1/payment_intents/pi_fixture':pi,'/v1/charges/ch_fixture':ch,'/v1/refunds':{'object':'list','has_more':False,'data':[]},'/v1/disputes':{'object':'list','has_more':False,'data':[]}}
class OfflineTransport(stripe.HTTPClient):
 name='offline-retention-only'
 def __init__(self,docs,scope=LIVE_SCOPE):super().__init__();self.docs=docs;self.calls=[];self.scope=scope
 def request(self,method,url,headers,post_data=None,**kw):
  assert method.lower()=='get';assert urlparse(url).hostname=='api.stripe.com';assert headers['Stripe-Account']==self.scope.account;assert headers['Stripe-Version']==self.scope.api_version
  self.calls.append(urlparse(url).path);return json.dumps(deepcopy(self.docs[urlparse(url).path])),200,{}
def provider(docs):return StripeReadAdapter(stripe.StripeClient('offline-not-a-key',http_client=OfflineTransport(docs),max_network_retries=0),LIVE_SCOPE)
