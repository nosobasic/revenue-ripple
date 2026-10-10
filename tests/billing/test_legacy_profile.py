"""Actual legacy function bodies and Stripe signature verification; no network/DB."""
import ast
import copy
import hashlib
import hmac
import json
from pathlib import Path
import sys
import time
from types import SimpleNamespace
import unittest
from flask import Flask, abort, jsonify, request
import stripe

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from middleware.legacy_membership import require_paid_checkout, legacy_profile_update, preserve_legacy_identity

EMAIL = 'synthetic@example.test'
SECRET = 'whsec_synthetic_local_only'

def event(product='membership_subscription', paid='paid', event_type='checkout.session.completed'):
    return {'id': 'evt_fixture', 'type': event_type, 'data': {'object': {
        'metadata': {'product': product, 'referrer_username': 'none'},
        'payment_status': paid, 'customer_details': {'email': EMAIL}, 'amount_total': 4700,
    }}}

class LegacyProfileTests(unittest.TestCase):
    def setUp(self):
        self.row = {'id': 'fixture-id', 'role': 'member', 'plan': '', 'has_paid': False, 'payment_status': 'pending'}
        self.writes = []
        self.create_calls = []
        self.before_write = None
        test = self
        class Query:
            def __init__(self): self.filters = []; self.payload = None
            def select(self, *_): return self
            def eq(self, field, value): self.filters.append((field, value)); return self
            def is_(self, field, _): self.filters.append((field, None)); return self
            def update(self, values): self.payload = values; return self
            def insert(self, _): raise AssertionError('Unexpected account provisioning')
            def execute(self):
                if self.payload is None: return SimpleNamespace(data=[copy.deepcopy(test.row)])
                if test.before_write: test.before_write(test.row)
                if all(test.row.get(k) == v for k, v in self.filters):
                    test.writes.append(dict(self.payload)); test.row.update(self.payload)
                return SimpleNamespace(data=[])
        self.app = Flask(__name__)
        def unexpected_create(**_): self.create_calls.append(True); raise AssertionError('Unexpected auth provisioning')
        supabase = SimpleNamespace(table=lambda _: Query(), auth=SimpleNamespace(admin=SimpleNamespace(create_user=unexpected_create)))
        noop = lambda *args, **kwargs: None
        self.scope = dict(app=self.app, request=request, jsonify=jsonify, abort=abort,
            stripe=stripe, json=json, endpoint_secret=SECRET, supabase=supabase, print=noop,
            require_paid_checkout=require_paid_checkout, legacy_profile_update=legacy_profile_update,
            preserve_legacy_identity=preserve_legacy_identity)
        for name in ['record_acquisition_checkout','log_subscription_to_supabase','add_contact_to_getresponse','log_commission',
                     'send_conversion_event','log_founders_annual_purchase','send_founders_welcome_emails','log_tripwire_purchase_to_supabase']:
            self.scope[name] = noop
        tree = ast.parse((ROOT/'server.py').read_text())
        names = {'stripe_webhook', 'set_user_role', 'set_user_as_founder', 'process_subscription_purchase'}
        bodies = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
        exec(compile(ast.Module(body=bodies, type_ignores=[]), '<actual-server-functions>', 'exec'), self.scope)
        self.client = self.app.test_client()
    def post(self, payload, valid=True):
        raw = json.dumps(payload, separators=(',', ':')).encode()
        timestamp = int(time.time())
        digest = hmac.new(SECRET.encode(), f'{timestamp}.'.encode()+raw, hashlib.sha256).hexdigest()
        signature = f't={timestamp},v1={digest if valid else "invalid"}'
        return self.client.post('/webhook', data=raw, headers={'stripe-signature': signature, 'Content-Type': 'application/json'})
    def test_owner_admin_lifetime_preserved_for_all_supported_products(self):
        for product in ['membership_subscription','quarterly_growth_subscription','reseller_subscription','pro_reseller_subscription','reseller_trial_subscription','pro_reseller_trial_subscription','founders_annual_subscription']:
            with self.subTest(product=product):
                self.row.update(role='admin', plan='lifetime', has_paid=True, payment_status='admin_access')
                self.assertEqual(self.post(event(product)).status_code, 200)
                self.assertEqual((self.row['role'],self.row['plan'],self.row['payment_status']), ('admin','lifetime','admin_access'))
    def test_existing_paid_program_transitions_remain_supported(self):
        for existing in ['member','affiliate','reseller','pro_reseller']:
            for plan in ['', 'free', 'premium', 'reseller', 'pro_reseller']:
                for product,target in [('membership_subscription','member'),('quarterly_growth_subscription','member'),('reseller_subscription','reseller'),('pro_reseller_subscription','pro_reseller')]:
                    with self.subTest(existing=existing,plan=plan,product=product):
                        self.row.update(role=existing,plan=plan,has_paid=False,payment_status='pending')
                        self.assertEqual(self.post(event(product)).status_code,200)
                        self.assertEqual((self.row['role'],self.row['plan'],self.row['has_paid']), (target,target,True))
    def test_lifetime_plan_survives_legitimate_reseller_purchase(self):
        self.row['plan']='lifetime'
        self.post(event('reseller_subscription'))
        self.assertEqual((self.row['role'],self.row['plan']), ('reseller','lifetime'))
    def test_duplicate_event_does_not_repeat_profile_write(self):
        self.post(event('pro_reseller_subscription')); first = copy.deepcopy(self.row)
        self.post(event('pro_reseller_subscription'))
        self.assertEqual(self.row,first);self.assertEqual(len(self.writes),1)
    def test_invalid_signature_unpaid_and_noncompletion_cannot_grant(self):
        original=copy.deepcopy(self.row)
        self.assertEqual(self.post(event(),valid=False).status_code,400)
        for value in [event(paid='unpaid'),event(paid='no_payment_required'),event(event_type='customer.subscription.deleted'),event(event_type='invoice.payment_failed')]:
            self.assertEqual(self.post(value).status_code,200)
        self.assertEqual(self.row,original);self.assertEqual(self.writes,[])
    def test_missing_signing_secret_fails_closed(self):
        self.scope['endpoint_secret']=None
        self.assertEqual(self.post(event()).status_code,503);self.assertEqual(self.writes,[])
    def test_unverified_internal_call_fails_closed(self):
        with self.assertRaises(ValueError): self.scope['set_user_role'](EMAIL,'admin')
        with self.assertRaises(ValueError): self.scope['process_subscription_purchase'](EMAIL,47,None,'membership_subscription')
        with self.assertRaises(ValueError): self.scope['process_subscription_purchase'](EMAIL,47,None,'unknown',verified_event=event('unknown'))
        self.assertEqual(self.writes,[])
    def test_recipient_or_product_mismatch_fails_closed(self):
        with self.assertRaises(ValueError): self.scope['set_user_role']('other@example.test','member',verified_event=event())
        with self.assertRaises(ValueError): self.scope['set_user_role'](EMAIL,'pro_reseller',verified_event=event())
        self.assertEqual(self.writes,[])
    def test_concurrent_admin_promotion_is_not_overwritten(self):
        self.before_write=lambda row: row.update(role='admin',plan='lifetime')
        self.post(event('reseller_subscription'))
        self.assertEqual((self.row['role'],self.row['plan']),('admin','lifetime'));self.assertEqual(self.writes,[])
    def test_cancellation_does_not_revoke_historical_admin_access(self):
        self.row.update(role='admin',plan='lifetime',has_paid=True,payment_status='admin_access')
        original=copy.deepcopy(self.row)
        self.post(event(event_type='customer.subscription.deleted'))
        self.assertEqual(self.row,original);self.assertEqual(self.writes,[])
    def test_founder_purchase_preserves_lifetime_identity(self):
        self.row['plan']='lifetime';self.post(event('founders_annual_subscription'))
        self.assertEqual(self.row['plan'],'lifetime');self.assertTrue(self.row['is_founder'])

if __name__ == '__main__': unittest.main()
