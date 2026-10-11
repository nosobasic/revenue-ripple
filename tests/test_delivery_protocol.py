import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from pathlib import Path
from email_crm.delivery_runtime.providers import Message, SESProvider, FakeProvider, DeliveryError, configured_provider
from email_crm.delivery_runtime.runtime import Delivery, process_ses_event, render, ContentError

class ProtocolTests(unittest.TestCase):
    def setUp(self):
        self.db = MagicMock()
        self.provider = FakeProvider()
        self.claim = {"status":"claimed","contact":{"email":"one@example.com","name":"A","unsubscribe_token":"token"},
          "attempt":{"id":"attempt","claim_token":"token","provider":"fake","step_index":0,
          "sequence_snapshot":{"steps":[{"subject":"Lesson","template_key":"lesson.html"}]}}}
        self.env = {"EMAIL_PHYSICAL_ADDRESS":"123 Test Street, Test City"}
        self.delivery = Delivery(self.db,self.provider,lambda key:'<p>Hello {{first_name}}</p>',self.env)

    def test_send_accepts_one_recipient_and_saves_provider_id(self):
        self.db.rpc.side_effect=[self.claim,'sending','accepted']
        self.assertEqual(self.delivery.deliver('e',0),'accepted')
        self.assertEqual(len(self.provider.messages),1)
        self.assertEqual(self.db.rpc.call_args.kwargs['p_message_id'],'fake-attempt')

    def test_no_claim_duplicate_dlq_replay_never_sends(self):
        for state in ('busy','accepted','uncertain','ineligible','sending'):
            self.db.rpc.side_effect=None
            self.db.rpc.return_value={'status':state}
            self.assertEqual(self.delivery.deliver('e',0),state)
        self.assertEqual(self.provider.messages,[])

    def test_unsubscribe_between_claim_and_dispatch(self):
        self.db.rpc.side_effect=[self.claim,'cancelled']
        self.assertEqual(self.delivery.deliver('e'),'cancelled')
        self.assertEqual(self.provider.messages,[])

    def test_missing_content_blocks_without_provider_call(self):
        self.db.rpc.side_effect=[self.claim,None]
        self.delivery.loader=lambda key: ''
        self.assertEqual(self.delivery.deliver('e'),'blocked')
        self.assertEqual(self.provider.messages,[])
        self.assertEqual(self.db.rpc.call_args.kwargs['p_code'],'content_unavailable')

    def test_acceptance_then_database_failure_does_not_retry_transport(self):
        self.db.rpc.side_effect=[self.claim,'sending',TimeoutError()]
        with self.assertRaises(TimeoutError): self.delivery.deliver('e')
        self.db.rpc.side_effect=[{'status':'sending'}]
        self.assertEqual(self.delivery.deliver('e'),'sending')
        self.assertEqual(len(self.provider.messages),1)

    def test_partial_acceptance_or_timeout_is_quarantined(self):
        self.provider.error=TimeoutError('response lost after acceptance')
        self.db.rpc.side_effect=[self.claim,'sending',None]
        self.assertEqual(self.delivery.deliver('e'),'uncertain')
        self.assertEqual(self.db.rpc.call_args.kwargs['p_state'],'uncertain')

    def test_ses_no_false_success_and_explicit_error_classification(self):
        client=MagicMock(); provider=SESProvider(client,'hello@example.com','config')
        message=Message('success@simulator.amazonses.com','Subject','<p>Body</p>','https://x/unsubscribe?token=t','id', {'id':'12345678-1234-4234-8234-123456789012','expires_at':(datetime.now(timezone.utc)+timedelta(minutes=5)).isoformat()})
        client.send_raw_email.return_value={}
        with self.assertRaises(DeliveryError): provider.send(message)
        client.send_raw_email.return_value={'MessageId':'provider-id'}
        self.assertEqual(provider.send(message),'provider-id')
        args=client.send_raw_email.call_args.kwargs
        self.assertEqual(args['Destinations'],['success@simulator.amazonses.com'])
        self.assertIn(b'/api/email/unsubscribe?',args['RawMessage']['Data'])
        self.assertEqual(args['Tags'],[{'Name':'rr_attempt','Value':'id'}])
        for code,outcome in [('Throttling','retryable'),('MessageRejected','blocked'),('InternalFailure','uncertain')]:
            exc=RuntimeError();exc.response={'Error':{'Code':code}}
            client.send_raw_email.side_effect=exc
            with self.assertRaises(DeliveryError) as caught: provider.send(message)
            self.assertEqual(caught.exception.outcome,outcome)

    def test_fake_or_unknown_provider_not_enableable_by_env(self):
        for name in ('fake','brevo','unknown'):
            with self.assertRaises(ValueError): configured_provider({'EMAIL_DELIVERY_PROVIDER':name})

    def test_events_use_all_affected_recipients_not_destination_zero(self):
        event={'eventType':'Bounce','mail':{'messageId':'m','destination':['wrong@example.com']},
          'bounce':{'bounceType':'Permanent','bouncedRecipients':[{'emailAddress':'a@example.com'},{'emailAddress':'b@example.com'}]}}
        process_ses_event(self.db,event)
        calls=self.db.rpc.call_args_list
        self.assertEqual({c.kwargs['p_email'] for c in calls},{'a@example.com','b@example.com'})
        self.assertEqual({c.kwargs['p_type'] for c in calls},{'bounced'})
        key=calls[0].kwargs['p_key'];self.db.reset_mock();process_ses_event(self.db,event)
        self.assertEqual(self.db.rpc.call_args.kwargs['p_key'],key)
        event['bounce']['bounceType']='Transient';self.db.reset_mock();process_ses_event(self.db,event)
        self.assertEqual(self.db.rpc.call_args.kwargs['p_type'],'transient_bounce')

    def test_received_event_reconciles_tagged_acceptance(self):
        process_ses_event(self.db,{'eventType':'Delivery','mail':{'messageId':'m','tags':{'rr_attempt':['id']},'destination':['a@example.com']}})
        self.assertEqual(self.db.rpc.call_args.args[0],'email_accept')

    def test_all_local_intro_and_lesson_content_renders(self):
        from email_crm.sequences import get_sequence
        root=Path(__file__).resolve().parents[1]/'email_crm/templates'
        for seq in ('indoctrination','dmd_course_26'):
            for step in get_sequence(seq)['steps']:
                render((root/step['template_key']).read_text(),self.claim['contact'],step,self.env)

    def test_render_name_fallback_and_html_escaping(self):
        for name in (None, '', '   \t\n'):
            body, _ = render('<p>Hello {{first_name}}</p>',
                {**self.claim['contact'], 'name': name}, {'subject': 'Hello'}, self.env)
            self.assertIn('Hello there', body)
        body, _ = render('<p>Hello {{first_name}}</p>',
            {**self.claim['contact'], 'name': '<script>alert(1)</script>'}, {'subject': 'Hello'}, self.env)
        self.assertNotIn('<script>', body)
        self.assertIn('&lt;script&gt;', body)

    def test_render_encodes_token_and_preserves_footer_text(self):
        from urllib.parse import urlparse, parse_qs
        token = 'a+b&c?d/#'
        address = r'123 Test Road \1 Unit A'
        body, url = render('<HTML><BODY><p>Body</p></BODY></HTML>',
            {**self.claim['contact'], 'unsubscribe_token': token}, {'subject': 'Hi'},
            {**self.env, 'EMAIL_PHYSICAL_ADDRESS': address})
        self.assertEqual(parse_qs(urlparse(url).query)['token'], [token])
        self.assertIn(address, body)
        self.assertLess(body.index('Unsubscribe'), body.index('</BODY>'))

    def test_render_requires_footer_fields_and_retains_teaching_placeholders(self):
        body, _ = render('<p>Hello {{first_name}}. Example: [Your name] | [Your business]</p>',
            self.claim['contact'], {'subject': 'Hi'}, self.env)
        self.assertIn('[Your name] | [Your business]', body)
        for address in ('', 'Revenue Ripple, Attn: Donte Willis'):
            with self.assertRaises(ContentError):
                render('<p>Body</p>', self.claim['contact'], {'subject': 'Hi'},
                    {'EMAIL_PHYSICAL_ADDRESS': address})
        with self.assertRaises(ContentError):
            render('<p>Body</p>', {**self.claim['contact'], 'unsubscribe_token': ''},
                {'subject': 'Hi'}, self.env)


if __name__ == '__main__': unittest.main()
