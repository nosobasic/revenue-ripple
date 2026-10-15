"""Offline only: fake transport, no AWS/DB clients or credentials required."""
import sys, pathlib, unittest, hashlib, json
from dataclasses import replace
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock
from email_crm.delivery_runtime.providers import SESProvider, Message, DeliveryError
from email_crm.delivery_runtime.runtime import Delivery, render

class PilotTests(unittest.TestCase):
    def setUp(self):
        self.client=Mock();self.client.send_raw_email.return_value={'MessageId':'fake'}
        self.email='pilot@example.invalid';self.digest=hashlib.sha256(self.email.encode()).hexdigest()
        self.meta={'id':'11111111-1111-4111-8111-111111111111','expires_at':(datetime.now(timezone.utc)+timedelta(minutes=10)).isoformat(),
                   'recipient_sha256':self.digest,'attempt_id':'a','step_index':0,'subject':'Approved first lesson'}
        self.message=Message(self.email,'Approved first lesson','<p>Lesson</p>','https://example.invalid/unsubscribe?token=fake','a',pilot=self.meta)
        self.provider=SESProvider(self.client,'sender@example.invalid','existing',self.digest)
    def test_default_disabled_even_with_db_admission(self):
        with self.assertRaises(DeliveryError):SESProvider(self.client,'sender','cfg').send(self.message)
        self.client.send_raw_email.assert_not_called()
    def test_exact_admission_passes_and_headers_remain(self):
        self.assertEqual(self.provider.send(self.message),'fake')
        args=self.client.send_raw_email.call_args.kwargs
        self.assertEqual(args['Destinations'],[self.email])
        self.assertIn(b'List-Unsubscribe-Post: List-Unsubscribe=One-Click',args['RawMessage']['Data'])
        self.assertEqual(args['ConfigurationSetName'],'existing')
    def test_rebound_expired_or_changed_message_fails(self):
        variants=[replace(self.message,to='other@example.invalid'),replace(self.message,to=self.email.upper()),
                  replace(self.message,subject='Changed'),replace(self.message,attempt_id='b'),
                  replace(self.message,pilot=None),replace(self.message,simulator_run={'id':'bad'})]
        for field,value in [('id','bad'),('expires_at','2000-01-01T00:00:00Z'),('expires_at',(datetime.now(timezone.utc)+timedelta(hours=1)).isoformat()),
                            ('recipient_sha256','0'*64),('step_index',1),('attempt_id','other')]:
            variants.append(replace(self.message,pilot={**self.meta,field:value}))
        for m in variants:
            with self.subTest(message=m.to):
                with self.assertRaises(DeliveryError):self.provider.send(m)
        self.client.send_raw_email.assert_not_called()
    def test_simulator_unchanged_and_not_pilot_backdoor(self):
        run={'id':self.meta['id'],'expires_at':self.meta['expires_at']}
        simulator=Message('success@simulator.amazonses.com','s','h','https://example.invalid/unsubscribe?t=x','a',simulator_run=run)
        self.assertEqual(SESProvider(self.client,'sender','cfg').send(simulator),'fake')
        with self.assertRaises(DeliveryError):self.provider.send(replace(self.message,to=simulator.to))
    def service(self,template='<p>Hello {{first_name}}</p>'):
        pilot={**self.meta,'template_key':'pilot/first-message.html','template_sha256':hashlib.sha256(template.encode()).hexdigest()}
        claim={'status':'claimed','pilot':pilot,'contact':{'email':self.email,'name':'Test','unsubscribe_token':'fake'},
               'attempt':{'id':'a','claim_token':'claim','provider':'ses','step_index':0,'sequence_snapshot':{'steps':[{'subject':self.meta['subject'],'template_key':pilot['template_key']}]}}}
        db=Mock();db.rpc.side_effect=lambda name,**kw:claim if name=='email_claim' else ('sending' if name=='email_begin_send' else 'accepted')
        provider=Mock();provider.name='ses';provider.send.return_value='fake'
        return Delivery(db,provider,lambda _:template,{'EMAIL_PHYSICAL_ADDRESS':'123 Test Street'}),db,provider,claim
    def test_content_hash_is_checked_before_reservation_or_send(self):
        service,db,provider,claim=self.service();claim['pilot']['template_sha256']='0'*64
        self.assertEqual(service.deliver('e',0),'blocked');provider.send.assert_not_called()
        self.assertNotIn('email_begin_send',[call.args[0] for call in db.rpc.call_args_list])
    def test_pilot_metadata_is_carried_to_transport_after_db_gate(self):
        service,db,provider,claim=self.service();self.assertEqual(service.deliver('e',0),'accepted')
        self.assertEqual(provider.send.call_args.args[0].pilot,claim['pilot'])
        self.assertEqual([c.args[0] for c in db.rpc.call_args_list],['email_claim','email_begin_send','email_accept'])
    def test_disabled_predispatch_never_calls_transport(self):
        service,db,provider,claim=self.service();db.rpc.side_effect=lambda name,**kw:claim if name=='email_claim' else 'disabled'
        self.assertEqual(service.deliver('e',0),'disabled');provider.send.assert_not_called()

if __name__=='__main__':unittest.main()
