import dataclasses
import fcntl
import multiprocessing
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import threading
import time
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
from retention_billing.runtime import ConfigurationError, read_settings, build_dependencies, create_application
from retention_billing.worker_runtime import run, run_cycle


def synthetic_env():
    return {'RR_BILLING_'+k:v for k,v in dict(ENABLED='true',MODE='sandbox',
        ACCOUNT_ID='acct_synthetic',API_VERSION='2025-03-31.basil',PRICE_ID='price_synthetic',
        PRODUCT_ID='prod_synthetic',DATABASE_DSN='host=database.invalid port=5432 dbname=synthetic user=synthetic_writer password=synthetic-password sslmode=verify-full sslrootcert=/synthetic/ca.pem',
        READ_KEY='rk_test_synthetic_not_a_key',SIGNING_SECRET='whsec_synthetic_not_a_secret').items()}


class FakeWorker:
    def __init__(self, mode): self.mode = mode
    def run_once(self):
        if self.mode == 'exception': raise RuntimeError('secret-do-not-log')
        if self.mode == 'hang':
            signal.signal(signal.SIGTERM, signal.SIG_IGN)
            time.sleep(60)
        return self.mode


def fake_worker(mode): return FakeWorker(mode)


def signal_worker(marker):
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    Path(marker).write_text(str(os.getpid()))
    return FakeWorker('hang')


class RuntimeConfiguration(unittest.TestCase):
    def test_disabled_wrapper_never_builds_dependencies(self):
        module=SimpleNamespace(app=object(),create_retention_server=Mock())
        build=Mock(side_effect=AssertionError('must not initialize'))
        self.assertIs(create_application({},dependencies_factory=build,server_module=module),module.app)
        build.assert_not_called();module.create_retention_server.assert_not_called()

    def test_explicit_wrapper_injects_only_reviewed_dependencies(self):
        deps=dict(connect=object(),provider=object(),endpoint_secret='synthetic',policy=object())
        module=SimpleNamespace(create_retention_server=Mock(return_value='application'))
        build=Mock(return_value=deps)
        self.assertEqual(create_application(synthetic_env(),dependencies_factory=build,server_module=module),'application')
        module.create_retention_server.assert_called_once_with(**deps)
        self.assertFalse(build.call_args.args[0].scope.live)

    def test_missing_ambiguous_and_mismatched_settings_fail(self):
        changes=[{'RR_BILLING_ENABLED':'yes'},{'RR_BILLING_MODE':'other'},
                 {'RR_BILLING_API_VERSION':'other'},{'RR_BILLING_SIGNING_SECRET':''},
                 {'RR_BILLING_MODE':'live'},{'RR_BILLING_READ_KEY':'sk_test_general'}]
        for change in changes:
            with self.subTest(change=change),self.assertRaises(ConfigurationError):read_settings(synthetic_env()|change)

    def test_secret_fields_are_not_in_repr(self):
        settings=read_settings(synthetic_env())
        for value in (settings.database_dsn,settings.read_key,settings.signing_secret):
            self.assertNotIn(value,repr(settings))

    def test_database_boundary_rejects_implicit_or_privileged_connections(self):
        settings=read_settings(synthetic_env())
        invalid=['service=existing','host=/tmp user=synthetic_writer',
                 settings.database_dsn.replace('verify-full','require'),
                 settings.database_dsn.replace('synthetic_writer','postgres'),
                 settings.database_dsn+' options=bad',settings.database_dsn+' passfile=/private']
        for dsn in invalid:
            with self.subTest(dsn=dsn),self.assertRaises(ConfigurationError):
                build_dependencies(dataclasses.replace(settings,database_dsn=dsn))
        with patch.dict(os.environ,PGHOST='unapproved'),self.assertRaises(ConfigurationError):
            build_dependencies(settings)

    def test_connection_and_provider_have_fixed_runtime_limits(self):
        with patch('psycopg.connect') as connect,patch('stripe.StripeClient') as client,patch('stripe.RequestsClient') as http:
            deps=build_dependencies(read_settings(synthetic_env()))
            connect.assert_not_called()
            http.assert_called_once_with(timeout=10)
            self.assertEqual(client.call_args.kwargs['max_network_retries'],0)
            deps['connect']()
            self.assertEqual(connect.call_args.kwargs['connect_timeout'],5)
            self.assertEqual(connect.call_args.kwargs['sslmode'],'verify-full')
            self.assertFalse(connect.call_args.kwargs['autocommit'])
            self.assertEqual(connect.call_args.kwargs['options'],'-c lock_timeout=5000 -c statement_timeout=30000')

    def test_wrapper_invalid_settings_do_not_import_server(self):
        build=Mock()
        with self.assertRaises(ConfigurationError):
            create_application({'RR_BILLING_ENABLED':'true'},dependencies_factory=build)
        build.assert_not_called()

    def test_cli_disabled_and_invalid_startup_exit_cleanly(self):
        for env,code,output in [({},0,'disabled'),({'RR_BILLING_ENABLED':'true'},1,'startup_or_supervision_failed')]:
            result=subprocess.run([sys.executable,'-m','retention_billing.worker_runtime','--max-cycles','1'],
                cwd=Path(__file__).parents[1],env={'PATH':'/usr/bin:/bin','PYTHONDONTWRITEBYTECODE':'1',**env},
                capture_output=True,text=True,timeout=10)
            self.assertEqual(result.returncode,code,result.stderr)
            self.assertEqual(result.stdout.strip(),'retention_worker:'+output)


class WorkerLifecycle(unittest.TestCase):
    def tearDown(self): self.assertEqual(multiprocessing.active_children(),[])

    def test_one_receipt_child_finishes_and_is_reaped(self):
        self.assertEqual(run_cycle('recorded',threading.Event(),worker_factory=fake_worker,lifetime=5),'recorded')

    def test_child_exception_is_sanitized(self):
        self.assertEqual(run_cycle('exception',threading.Event(),worker_factory=fake_worker,lifetime=5),'error')

    def test_hung_child_is_killed_before_lease_expiry(self):
        start=time.monotonic()
        self.assertEqual(run_cycle('hang',threading.Event(),worker_factory=fake_worker,lifetime=1),'timeout')
        self.assertLess(time.monotonic()-start,6)

    def test_shutdown_interrupts_inflight_child(self):
        stop=threading.Event();timer=threading.Timer(1,stop.set);timer.start()
        try:self.assertEqual(run_cycle('hang',stop,worker_factory=fake_worker,lifetime=10),'stopped')
        finally:timer.cancel();timer.join()

    def test_single_supervisor_lock_and_bounded_cycles(self):
        with tempfile.TemporaryDirectory(prefix='rr-worker-test-') as folder:
            lock=Path(folder)/'worker.lock';messages=[]
            with lock.open('w') as held:
                fcntl.flock(held,fcntl.LOCK_EX|fcntl.LOCK_NB)
                with self.assertRaisesRegex(RuntimeError,'worker_already_running'):
                    run('idle',threading.Event(),lock_path=lock,max_cycles=1,worker_factory=fake_worker)
            self.assertEqual(run('idle',threading.Event(),lock_path=lock,max_cycles=1,
                worker_factory=fake_worker,report=messages.append),1)
            self.assertEqual(messages,['retention_worker:idle'])

    def test_deadline_cannot_exceed_reviewed_limit(self):
        with self.assertRaises(ValueError):run_cycle('idle',threading.Event(),lifetime=91)
        stop=threading.Event();stop.set()
        self.assertEqual(run_cycle('idle',stop,worker_factory=fake_worker),'stopped')

    def test_cli_sigterm_reaps_active_child(self):
        script = '''import sys
from unittest.mock import patch
import retention_billing.worker_runtime as runtime
from test_retention_runtime import signal_worker
original = runtime.run
def synthetic_run(settings, stop, **kwargs):
    return original(sys.argv[2], stop, lock_path=sys.argv[1], worker_factory=signal_worker)
paths = sys.argv[:]
with patch.object(runtime, 'read_settings', return_value='synthetic'), patch.object(runtime, 'build_dependencies'), patch.object(runtime, 'run', side_effect=synthetic_run), patch.object(runtime.argparse.ArgumentParser, 'parse_args', return_value=type('Args', (), {'max_cycles':None})()):
    raise SystemExit(runtime.main())
'''
        with tempfile.TemporaryDirectory(prefix='rr-worker-signal-') as folder:
            marker=Path(folder)/'child.pid';lock=Path(folder)/'worker.lock'
            root=Path(__file__).parents[1]
            process=subprocess.Popen([sys.executable,'-c',script,str(lock),str(marker)],cwd=root,
                env={'PATH':'/usr/bin:/bin','PYTHONDONTWRITEBYTECODE':'1','PYTHONPATH':os.pathsep.join([str(root),str(root/'tests')])},
                stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
            try:
                deadline=time.monotonic()+10
                while not marker.exists() and process.poll() is None and time.monotonic()<deadline:time.sleep(.05)
                self.assertTrue(marker.exists(),'synthetic child did not start')
                child_pid=int(marker.read_text())
                process.terminate()
                stdout,stderr=process.communicate(timeout=6)
                self.assertEqual(process.returncode,0,stderr)
                self.assertIn('retention_worker:stopped',stdout)
                with self.assertRaises(ProcessLookupError):os.kill(child_pid,0)
            finally:
                if process.poll() is None:
                    os.killpg(process.pid,signal.SIGKILL)
                    process.communicate(timeout=5)
