import sys,unittest,uuid,hashlib,json
from pathlib import Path
from datetime import datetime,timezone,timedelta
from unittest.mock import Mock
from email_crm.delivery_runtime.providers import SESProvider,Message,DeliveryError
from email_crm.delivery_runtime.runtime import Delivery,render
BUNDLE='11111111-1111-4111-8111-111111111111'
class Nurture(unittest.TestCase):
 def setUp(self):
  self.client=Mock();self.client.send_raw_email.return_value={'MessageId':'offline-id'}
  self.a=str(uuid.uuid4());self.token=str(uuid.uuid4());self.template='<p>Hello {{first_name}}</p>'
  self.n={'bundle_id':BUNDLE,'attempt_id':self.a,'claim_token':self.token,'recipient_sha256':hashlib.sha256(b'fresh@example.invalid').hexdigest(),'expires_at':(datetime.now(timezone.utc)+timedelta(minutes=4)).isoformat(),'step_index':0,'subject':'Test','template_key':'nurture/offline/01.html','template_sha256':hashlib.sha256(self.template.encode()).hexdigest()}
 def message(self,n=None,**kw):
  return Message('fresh@example.invalid','Test','<p>Offline</p>','https://example.invalid/unsubscribe?token=synthetic',self.a,nurture=self.n if n is None else n,claim_token=self.token,**kw)
 def test_transport_default_closed_and_bound(self):
  with self.assertRaises(DeliveryError):SESProvider(self.client,'source','cfg').send(self.message())
  self.client.send_raw_email.assert_not_called()
  provider=SESProvider(self.client,'source','cfg',nurture_bundle_id=BUNDLE)
  for key,value in [('bundle_id',str(uuid.uuid4())),('attempt_id',str(uuid.uuid4())),('claim_token',str(uuid.uuid4())),('subject','Changed'),('recipient_sha256','0'*64),('expires_at',(datetime.now(timezone.utc)-timedelta(seconds=1)).isoformat()),('step_index',True)]:
   with self.subTest(key=key),self.assertRaises(DeliveryError):provider.send(self.message({**self.n,key:value}))
  with self.assertRaises(DeliveryError):provider.send(self.message(pilot={}))
  self.client.send_raw_email.assert_not_called()
  self.assertEqual(provider.send(self.message()),'offline-id')
  self.assertEqual(self.client.send_raw_email.call_count,1)
 def claim(self):
  step={'subject':'Test','template_key':self.n['template_key'],'template_sha256':self.n['template_sha256']}
  return {'nurture':self.n,'attempt':{'id':self.a,'claim_token':self.token,'provider':'ses','step_index':0,'sequence_snapshot':{'_nurture_bundle':BUNDLE,'steps':[step]}},'contact':{'email':'fresh@example.invalid','name':'Alex','unsubscribe_token':'synthetic'}}
 def test_content_and_environment_block_before_reservation(self):
  for template,bundle in [(self.template,''),('changed',BUNDLE)]:
   db=Mock();db.rpc.return_value=self.claim();provider=Mock(name='provider');provider.name='ses'
   self.assertEqual(Delivery(db,provider,lambda _:template,{'EMAIL_NURTURE_BUNDLE_ID':bundle,'EMAIL_PHYSICAL_ADDRESS':'Offline example address'}).deliver('offline'),'blocked')
   self.assertNotIn('email_begin_send',[c.args[0] for c in db.rpc.call_args_list]);provider.send.assert_not_called()
 def test_dispatch_has_no_retry_on_uncertainty(self):
  db=Mock();db.rpc.side_effect=[self.claim(),'sending',None];provider=Mock();provider.name='ses';provider.send.side_effect=TimeoutError()
  self.assertEqual(Delivery(db,provider,lambda _:self.template,{'EMAIL_NURTURE_BUNDLE_ID':BUNDLE,'EMAIL_PHYSICAL_ADDRESS':'Offline example address'}).deliver('offline'),'uncertain')
  self.assertEqual(provider.send.call_count,1);self.assertEqual(db.rpc.call_args.kwargs['p_state'],'uncertain')

if __name__=='__main__':unittest.main()
