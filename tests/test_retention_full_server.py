"""Full legacy import through Gunicorn's loader, with no runtime credentials.

Each case runs in a fresh interpreter. Only dotenv discovery and network access
are blocked; all server modules and declared Python dependencies are real.
No listener is opened and no worker process is started.
"""
from pathlib import Path
import os
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]


def smoke(mode):
    from unittest.mock import Mock, patch
    import dotenv
    attempts = []
    def audit(event, args):
        if event in {'socket.connect', 'socket.getaddrinfo', 'socket.bind'}:
            attempts.append(event)
            raise RuntimeError('Network forbidden in full server smoke test')
    sys.addaudithook(audit)
    # urllib3 probes IPv6 support by binding loopback at import. Disable only
    # that capability probe in this process; every real bind remains forbidden.
    with patch.object(dotenv, 'load_dotenv', return_value=False), patch('socket.has_ipv6', False):
        from gunicorn.util import import_app
        app = import_app('server:app')
        import server
        assert app is server.app
        assert app.supabase is None
        assert app.extensions['retention_billing']['worker'] is None
        assert '/webhook' in {rule.rule for rule in app.url_map.iter_rules()}
        assert 'retention_billing.durable' not in sys.modules
        if mode == 'disabled':
            client = app.test_client()
            response = client.post('/webhook/retention')
            assert response.status_code == 503
            assert response.json == {'status':'billing_ingestion_disabled'}
            assert response.headers['Cache-Control'] == 'no-store'
            assert client.post('/webhook').json == {'error':'Payment verification unavailable'}
            assert client.get('/api/vault/playbooks').status_code == 401
            assert client.get('/admin/email-reports').status_code == 401
        else:
            from types import SimpleNamespace
            from retention_billing.types import Scope
            from retention_billing.policy import PaidPolicy
            scope = Scope('acct_offline_sandbox', False)
            connect = Mock(side_effect=RuntimeError('private-smoke-db'))
            args = dict(connect=connect, provider=SimpleNamespace(scope=scope),
                        policy=PaidPolicy(scope, ('price_offline','prod_offline')),
                        endpoint_secret='offline-full-server-secret')
            assert callable(server.create_retention_server)
            if mode == 'invalid_config':
                try:
                    server.create_retention_server(**(args | {'endpoint_secret':''}))
                except ValueError:
                    pass
                else:
                    raise AssertionError('Invalid configuration accepted')
                assert app.extensions['retention_billing']['worker'] is None
                assert app.test_client().post('/webhook/retention').status_code == 503
                connect.assert_not_called()
            else:
                if mode == 'runtime_wrapper':
                    from retention_billing.runtime import create_application
                    from test_retention_runtime import synthetic_env
                    assert import_app('retention_billing.runtime:create_application()') is app
                    assert create_application(synthetic_env(),dependencies_factory=lambda _:args) is app
                else:
                    assert server.create_retention_server(**args) is app
                connect.assert_not_called()
                client = app.test_client()
                if mode == 'enabled':
                    import hashlib, hmac, json, time
                    def send(kind):
                        raw = json.dumps(dict(id='evt_full_smoke',type=kind,livemode=False,
                            api_version=scope.api_version,data={'object':{'id':'in_offline'}})).encode()
                        stamp = str(int(time.time()))
                        sig = hmac.new(args['endpoint_secret'].encode(),stamp.encode()+b'.'+raw,hashlib.sha256).hexdigest()
                        return client.post('/webhook/retention',data=raw,
                            headers={'Stripe-Signature':f't={stamp},v1={sig}'})
                    assert send('checkout.session.completed').json == {'status':'ignored'}
                    connect.assert_not_called()
                    response = send('invoice.paid')
                    assert response.status_code == 503
                    assert response.json == {'status':'retry_required'}
                    assert b'private-smoke-db' not in response.data
                    assert client.post('/webhook').json == {'error':'Payment verification unavailable'}
                    assert client.get('/api/vault/playbooks').status_code == 401
                elif mode in {'limits','runtime_wrapper'}:
                    assert client.post('/webhook/retention',data=b'{}').status_code == 400
                    assert client.get('/webhook/retention').status_code == 405
                    assert client.post('/webhook/retention',data=b'x'*(1024*1024+1),
                        headers={'Stripe-Signature':'invalid'}).status_code == 413
                    connect.assert_not_called()
                    try:
                        server.create_retention_server(**args)
                    except RuntimeError:
                        pass
                    else:
                        raise AssertionError('Runtime reconfiguration accepted')
    assert not attempts, attempts
    print('FULL_SERVER_SMOKE_PASS', mode)


class FullServerSmoke(unittest.TestCase):
    def run_case(self, mode):
        result = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--child', mode],
            cwd=ROOT, env={'PATH':'/usr/bin:/bin','PYTHONDONTWRITEBYTECODE':'1',
                          'PYTHONPATH':os.pathsep.join([str(ROOT),str(ROOT/'tests')])}, capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('FULL_SERVER_SMOKE_PASS '+mode, result.stdout)

    def test_disabled_default_full_import(self): self.run_case('disabled')
    def test_enabled_explicit_factory_full_import(self): self.run_case('enabled')
    def test_invalid_configuration_full_import(self): self.run_case('invalid_config')
    def test_signature_body_limit_and_restart_boundary(self): self.run_case('limits')
    def test_runtime_wsgi_wrapper_full_import(self): self.run_case('runtime_wrapper')


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--child': smoke(sys.argv[2])
    else: unittest.main()
