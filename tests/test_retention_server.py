"""Main-server bootstrap isolated from unrelated legacy credential discovery."""
import ast
import hashlib
import hmac
import json
from pathlib import Path
import time
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch
from flask import Flask
from retention_billing.policy import PaidPolicy
from retention_billing.types import Scope


def bootstrap():
    # Execute the actual server's app assignment, billing import/install and
    # factory, without importing legacy modules that discover runtime secrets.
    tree = ast.parse((Path(__file__).parents[1] / 'server.py').read_text())
    nodes = []
    for node in tree.body:
        if (isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'app' for t in node.targets)
            or isinstance(node, ast.ImportFrom) and node.module == 'retention_billing.server'
            or isinstance(node, ast.Expr) and isinstance(node.value, ast.Call)
               and isinstance(node.value.func, ast.Name) and node.value.func.id == 'install_retention_billing'
            or isinstance(node, ast.FunctionDef) and node.name == 'create_retention_server'):
            nodes.append(node)
    if len(nodes) != 4:
        raise AssertionError('Server billing bootstrap changed; review test boundary')
    namespace = {'Flask': Flask, '__name__': 'isolated_server_bootstrap'}
    exec(compile(ast.Module(body=nodes, type_ignores=[]), 'server.py', 'exec'), namespace)
    return namespace['app'], namespace['create_retention_server']


class ServerWiring(unittest.TestCase):
    def setUp(self):
        self.app, self.factory = bootstrap()
        self.app.add_url_rule('/webhook', 'legacy', lambda: ('legacy', 202), methods=['POST'])
        self.app.add_url_rule('/health', 'health', lambda: 'ok')
        self.connect = Mock(side_effect=RuntimeError('private-database-error'))
        self.scope = Scope('acct_offline_sandbox', False)
        self.args = dict(connect=self.connect, provider=SimpleNamespace(scope=self.scope),
                         endpoint_secret='offline-secret', policy=PaidPolicy(self.scope, ('p', 'q')))

    def signed(self, client, kind='invoice.paid', secret='offline-secret'):
        raw = json.dumps(dict(id='evt_wiring', livemode=False, api_version=self.scope.api_version,
                              type=kind, data={'object': {'id': 'in_fixture'}}), indent=2).encode()
        stamp = str(int(time.time()))
        sig = hmac.new(secret.encode(), stamp.encode()+b'.'+raw, hashlib.sha256).hexdigest()
        return client.post('/webhook/retention', data=raw, headers={'Stripe-Signature': f't={stamp},v1={sig}'})

    def test_default_disabled_without_optional_dependency_import(self):
        with patch.dict('sys.modules', {'retention_billing.durable': None}):
            app, _ = bootstrap()
        response = app.test_client().post('/webhook/retention')
        self.assertEqual((response.status_code, response.json), (503, {'status': 'billing_ingestion_disabled'}))
        self.assertEqual(response.headers['Cache-Control'], 'no-store')
        self.assertIsNone(app.extensions['retention_billing']['worker'])

    def test_enabled_factory_keeps_legacy_and_returns_unstarted_worker(self):
        self.assertIs(self.factory(**self.args), self.app)
        self.connect.assert_not_called()
        client = self.app.test_client()
        self.assertEqual(client.post('/webhook').status_code, 202)
        self.assertEqual(client.get('/health').data, b'ok')
        self.assertEqual(client.get('/webhook/retention').status_code, 405)
        self.assertIsNotNone(self.app.extensions['retention_billing']['worker'])
        self.connect.assert_not_called()

    def test_signature_rejection_and_database_failure_through_server(self):
        self.factory(**self.args)
        client = self.app.test_client()
        self.assertEqual(self.signed(client, secret='wrong').status_code, 400)
        self.connect.assert_not_called()
        response = self.signed(client)
        self.assertEqual((response.status_code, response.json), (503, {'status': 'retry_required'}))
        self.assertNotIn(b'private-database-error', response.data)

    def test_checkout_is_ignored_without_database(self):
        self.factory(**self.args)
        self.assertEqual(self.signed(self.app.test_client(), kind='checkout.session.completed').json, {'status': 'ignored'})
        self.connect.assert_not_called()

    def test_request_limit_preserved(self):
        self.factory(**self.args)
        response = self.app.test_client().post('/webhook/retention', data=b'x'*(1024*1024+1), headers={'Stripe-Signature':'invalid'})
        self.assertEqual(response.status_code, 413)
        self.connect.assert_not_called()

    def test_invalid_config_leaves_disabled_installation_intact(self):
        for change in ({'connect':None}, {'policy':None}, {'endpoint_secret':' '}, {'policy':PaidPolicy()}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.factory(**(self.args | change))
        self.assertIsNone(self.app.extensions['retention_billing']['worker'])
        self.connect.assert_not_called()

    def test_cannot_enable_after_first_disabled_request(self):
        self.app.test_client().post('/webhook/retention')
        with self.assertRaises(RuntimeError): self.factory(**self.args)

    def test_duplicate_configuration_rejected(self):
        self.factory(**self.args)
        with self.assertRaises(RuntimeError): self.factory(**self.args)
