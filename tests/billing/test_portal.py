"""Synthetic identities, mappings, and mocked Stripe only; no network or real IDs."""
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch, Mock
from flask import Flask
import billing_portal as module


class Query:
    def __init__(self, db, table): self.db, self.name = db, table
    def select(self, fields): return self
    def eq(self, key, value):
        assert key == 'user_id'
        self.owner = value
        return self
    def limit(self, number):
        assert number == 21
        return self
    def execute(self):
        self.db.lookups.append((self.name, self.owner))
        if self.db.fail: raise RuntimeError('synthetic database error')
        return SimpleNamespace(data=self.db.rows.get((self.name, self.owner), []))


class PortalTests(unittest.TestCase):
    def setUp(self):
        self.db = SimpleNamespace(rows={}, fail=False, lookups=[])
        self.db.table = lambda table: Query(self.db, table)
        self.db.auth = SimpleNamespace(get_user=lambda token: SimpleNamespace(user=SimpleNamespace(id='user-a' if token == 'a' else 'user-b', email='fixture@example.test')))
        self.app = Flask(__name__)
        self.app.supabase = self.db
        self.app.register_blueprint(module.billing_portal)
        self.client = self.app.test_client()
        self.stripe = Mock()
        self.stripe.customers.retrieve.return_value = {'id': 'cus_fixture', 'livemode': True}
        self.stripe.subscriptions.retrieve.return_value = {'id': 'sub_fixture', 'customer': 'cus_fixture', 'livemode': True, 'metadata': {'rr_user_id': 'user-a'}}
        self.configuration = {'id': 'bpc_fixture', 'active': True, 'livemode': True, 'login_page': {'enabled': False}, 'features': {name: {'enabled': name == 'invoice_history'} for name in ('invoice_history', 'customer_update', 'payment_method_update', 'subscription_cancel', 'subscription_update')}}
        self.stripe.billing_portal.configurations.retrieve.return_value = self.configuration
        self.stripe.billing_portal.sessions.create.side_effect = lambda params, options: {**params, 'id': 'bps_fixture', 'livemode': True, 'url': 'https://billing.stripe.com/p/session_fixture'}
        self.addCleanup(patch.stopall)
        self.app.extensions['rr_portal'] = (self.stripe, 'bpc_fixture')

    def linked(self, owner='user-a'):
        self.db.rows[('rr_subscriptions', owner)] = [{'subscription_id': 'sub_fixture'}]

    def request(self, method='GET', token='a', origin='https://www.revenueripple.org', **kwargs):
        headers = {'Origin': origin}
        if token: headers['Authorization'] = 'Bearer ' + token
        headers.update(kwargs.pop('headers', {}))
        path = '/api/billing/status' if method == 'GET' else '/api/billing/portal'
        response = self.client.open(path, method=method, headers=headers, **kwargs)
        self.assertEqual(response.headers['Cache-Control'], 'private, no-store')
        return response

    def test_signed_out_and_conflicting_identity(self):
        self.assertEqual(self.request(token=None).status_code, 401)
        self.assertEqual(self.request(headers={'x-user-id': 'victim'}).status_code, 403)
        self.assertEqual(self.db.lookups, [])
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_authentication_error(self):
        self.db.auth.get_user = Mock(side_effect=RuntimeError())
        self.assertEqual(self.request().status_code, 401)
        self.assertEqual(self.db.lookups, [])

    def test_no_mapping_is_not_missing_membership(self):
        response = self.request(headers={'x-user-role': 'admin'})
        self.assertEqual(response.json, {'state': 'not_linked'})
        self.assertEqual(self.request('POST').status_code, 409)
        self.stripe.customers.retrieve.assert_not_called()
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_exact_user_lookup_and_no_status_side_effect(self):
        self.linked()
        self.assertEqual(self.request().json, {'state': 'linked'})
        self.assertTrue(all(owner == 'user-a' for _, owner in self.db.lookups))
        self.assertEqual(self.request(token='b').json, {'state': 'not_linked'})
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_founder_mapping_cannot_authorize_portal(self):
        self.db.rows[('founders_annual_members', 'user-a')] = [{'stripe_customer_id': 'cus_fixture'}]
        self.assertEqual(self.request().json, {'state': 'not_linked'})
        self.assertEqual(self.request('POST').status_code, 409)
        self.stripe.subscriptions.retrieve.assert_not_called()
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_create_uses_only_trusted_mapping_and_server_return(self):
        self.linked()
        for origin in module.ORIGINS:
            with self.subTest(origin=origin):
                response = self.request('POST', origin=origin)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(self.stripe.billing_portal.sessions.create.call_args.kwargs['params'], dict(customer='cus_fixture', configuration='bpc_fixture', return_url=origin + '/profile?billing=returned'))

    def test_forged_input_and_origin(self):
        self.linked()
        for key in ['customer_id', 'user_id', 'email', 'return_url', 'configuration']:
            with self.subTest(key=key):
                self.assertEqual(self.request('POST', json={key: 'evil'}).status_code, 400)
                self.assertEqual(self.request(query_string={key: 'evil'}).status_code, 400)
        for origin in ['null', '', 'https://revenueripple.org.evil.test', 'https://evil.test', 'http://revenueripple.org']:
            self.assertEqual(self.request('POST', origin=origin).status_code, 403)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_lookup_failure_does_not_claim_not_linked(self):
        self.db.fail = True
        self.assertEqual(self.request().json, {'state': 'unavailable'})
        self.assertEqual(self.request('POST').status_code, 503)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_ambiguous_or_deleted_customer(self):
        self.linked()
        self.db.rows[('rr_subscriptions', 'user-a')].append({'subscription_id': 'sub_other'})
        self.stripe.subscriptions.retrieve.side_effect = lambda sid: {'id': sid, 'customer': 'cus_fixture' if sid == 'sub_fixture' else 'cus_other', 'livemode': True, 'metadata': {'rr_user_id': 'user-a'}}
        self.assertEqual(self.request('POST').status_code, 503)
        self.db.rows.clear(); self.linked()
        self.stripe.subscriptions.retrieve.side_effect = None
        self.stripe.customers.retrieve.return_value = {'id': 'cus_fixture', 'deleted': True}
        self.assertEqual(self.request('POST').status_code, 503)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_missing_disabled_or_wrong_mode_configuration(self):
        self.linked()
        with patch.dict(self.app.extensions, {'rr_portal': (self.stripe, '')}):
            self.assertEqual(self.request().status_code, 503)
            self.assertEqual(self.request('POST').status_code, 503)
        for configuration in [{'active': False, 'livemode': True}, {'active': True, 'livemode': True}]:
            self.stripe.billing_portal.configurations.retrieve.return_value = configuration
            self.assertEqual(self.request('POST').status_code, 503)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_provider_errors_and_malicious_response(self):
        self.linked()
        self.stripe.billing_portal.sessions.create.side_effect = RuntimeError('secret fixture not exposed')
        response = self.request('POST')
        self.assertEqual(response.json, {'state': 'unavailable'})
        self.stripe.billing_portal.sessions.create.side_effect = None
        for url in ['https://evil.test', 'http://billing.stripe.com/x', 'https://billing.stripe.com@evil.test/x']:
            self.stripe.billing_portal.sessions.create.return_value = {'url': url}
            self.assertEqual(self.request('POST').status_code, 503)

    def test_missing_or_forged_provenance_and_mode(self):
        self.linked()
        base = {'id': 'sub_fixture', 'customer': 'cus_fixture', 'livemode': True, 'metadata': {'rr_user_id': 'user-a'}}
        for change in [{'metadata': {}}, {'metadata': {'rr_user_id': 'user-b'}}, {'id': 'sub_other'}, {'livemode': False}, {'livemode': None}]:
            with self.subTest(change=change):
                self.stripe.subscriptions.retrieve.return_value = {**base, **change}
                self.assertEqual(self.request('POST').status_code, 503)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_bound_lookup(self):
        self.db.rows[('rr_subscriptions', 'user-a')] = [{'subscription_id': 'sub_fixture'}] * 21
        self.assertEqual(self.request('POST').status_code, 503)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_default_disabled_never_reads_credentials_or_calls_provider(self):
        module.configure_portal(self.app, {})
        self.assertEqual(self.request().status_code, 503)
        self.assertEqual(self.db.lookups, [])
        self.stripe.subscriptions.retrieve.assert_not_called()

    def test_live_configuration_and_permissions_fail_closed(self):
        self.linked()
        for name in ('customer_update', 'payment_method_update', 'subscription_cancel', 'subscription_update'):
            self.configuration['features'][name]['enabled'] = True
            self.assertEqual(self.request('POST').status_code, 503)
            self.configuration['features'][name]['enabled'] = False
        self.configuration['login_page']['enabled'] = True
        self.assertEqual(self.request('POST').status_code, 503)
        self.stripe.billing_portal.sessions.create.assert_not_called()

    def test_dedicated_client_scope_and_bounded_transport(self):
        env = dict(RR_PORTAL_ENABLED='true', RR_PORTAL_KEY='rk_live_synthetic',
                   RR_PORTAL_CONFIGURATION_ID='bpc_fixture', RR_PORTAL_ACCOUNT_ID='acct_1RHozW2Ku9STqdAd')
        with patch.object(module.stripe, 'StripeClient') as client:
            module.configure_portal(self.app, env)
            self.assertEqual(client.call_args.kwargs['max_network_retries'], 0)
            self.assertEqual(client.call_args.kwargs['stripe_account'], env['RR_PORTAL_ACCOUNT_ID'])
        for change in ({'RR_PORTAL_KEY':'sk_live_synthetic'}, {'RR_PORTAL_KEY':'rk_test_synthetic'},
                       {'RR_PORTAL_ACCOUNT_ID':'acct_other'}, {'RR_PORTAL_ENABLED':'yes'}):
            with self.assertRaises(ValueError):
                module.configure_portal(self.app, {**env, **change})

    def test_session_identity_mismatch_is_unavailable(self):
        self.linked()
        for change in ({'customer':'cus_other'}, {'configuration':'bpc_other'},
                       {'return_url':'https://evil.test'}, {'livemode':False}, {'id':'other'}):
            self.stripe.billing_portal.sessions.create.side_effect = lambda params, options: {
                **params, 'id':'bps_fixture', 'livemode':True,
                'url':'https://billing.stripe.com/p/fixture', **change}
            self.assertEqual(self.request('POST').status_code, 503)


if __name__ == '__main__': unittest.main()
