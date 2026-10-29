"""Offline HTTP contract tests: real SDK signatures, no Stripe/DB requests."""
import hashlib
import hmac
import json
import time
import unittest
from types import SimpleNamespace
from unittest.mock import Mock
from retention_billing.http import create_app
from retention_billing.policy import PaidPolicy
from retention_billing.types import Scope

SCOPE = Scope('acct_offline_sandbox', False)
SECRET = 'offline-signing-fixture'

class RetentionHTTP(unittest.TestCase):
    def setUp(self):
        self.connect = Mock(side_effect=RuntimeError('private-db-detail'))
        self.provider = SimpleNamespace(scope=SCOPE)
        self.app = create_app(connect=self.connect, provider=self.provider,
            endpoint_secret=SECRET, policy=PaidPolicy(SCOPE, ('price_offline','prod_offline')))
        self.client = self.app.test_client()

    def send(self, kind='checkout.session.completed', live=False, account=None, timestamp=None, secret=SECRET):
        event = dict(id='evt_offline', api_version=SCOPE.api_version, livemode=live,
                     type=kind, data={'object': {'id':'sub_offline'}})
        if account is not None: event['account'] = account
        raw = json.dumps(event, indent=2).encode()
        stamp = str(int(time.time()) if timestamp is None else timestamp)
        digest = hmac.new(secret.encode(), stamp.encode()+b'.'+raw, hashlib.sha256).hexdigest()
        return self.client.post('/webhook/retention', data=raw,
            headers={'Stripe-Signature': 't='+stamp+',v1='+digest}, content_type='application/json')

    def test_signed_checkout_does_not_grant_or_open_database(self):
        response = self.send()
        self.assertEqual((response.status_code,response.json),(200,{'status':'ignored'}))
        self.assertEqual(response.headers['Cache-Control'],'no-store')
        self.connect.assert_not_called()

    def test_invalid_secret_and_stale_signature(self):
        self.assertEqual(self.send(secret='wrong').status_code,400)
        self.assertEqual(self.send(timestamp=int(time.time())-600).status_code,400)
        self.connect.assert_not_called()

    def test_scope_rejection_precedes_database(self):
        self.assertEqual(self.send(live=True).status_code,409)
        self.assertEqual(self.send(account='acct_wrong').status_code,409)
        self.connect.assert_not_called()

    def test_missing_signature(self):
        self.assertEqual(self.client.post('/webhook/retention',data=b'{}').status_code,400)
        self.connect.assert_not_called()

    def test_database_failure_retries_without_leaking(self):
        response=self.send(kind='customer.subscription.updated')
        self.assertEqual((response.status_code,response.json),(503,{'status':'retry_required'}))
        self.assertNotIn(b'private-db-detail',response.data)

    def test_incomplete_configuration_fails_before_startup(self):
        for secret, policy in [('',PaidPolicy(SCOPE,('p','q'))),(SECRET,PaidPolicy())]:
            with self.assertRaises(ValueError):
                create_app(connect=self.connect,provider=self.provider,endpoint_secret=secret,policy=policy)

    def test_no_legacy_or_checkout_routes(self):
        self.assertEqual(self.client.post('/webhook').status_code,404)
        self.assertEqual(self.client.post('/create-checkout-session').status_code,404)
        self.assertEqual(self.client.get('/webhook/retention').status_code,405)

    def test_request_limit(self):
        response=self.client.post('/webhook/retention',data=b'x'*(1024*1024+1),headers={'Stripe-Signature':'invalid'})
        self.assertEqual(response.status_code,413)
        self.connect.assert_not_called()
