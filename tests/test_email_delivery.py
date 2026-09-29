"""Regression checks for AWS-only capture, queue handoff and admin controls."""
import os
import unittest
from unittest.mock import MagicMock, patch
from flask import Flask
from email_crm.deliver import deliver_lead
from email_crm.enroll import enqueue_founders_step, enroll_new
from email_crm.provider import email_mode
from email_crm.routes import email_bp
from email_crm.send import send_ses


class DeliveryTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'EMAIL_MODE': 'aws', 'EMAIL_WRITE_CRM': 'true'})
        self.env.start()
        self.addCleanup(self.env.stop)

    def deliver(self, **kw):
        return deliver_lead(email='test@example.com', name='Test', funnel='dmd-variation-1', **kw)

    def test_aws_failure_propagates_without_legacy_send(self):
        legacy = MagicMock()
        with patch('email_crm.deliver.upsert_contact', side_effect=RuntimeError('db down')):
            with self.assertRaises(RuntimeError):
                self.deliver(supabase=MagicMock(), send_getresponse=legacy)
        legacy.assert_not_called()

    def test_missing_database_or_disabled_crm_is_not_success(self):
        with self.assertRaises(RuntimeError):
            self.deliver(supabase=None)
        with patch.dict(os.environ, {'EMAIL_WRITE_CRM': 'false'}):
            with self.assertRaises(RuntimeError):
                self.deliver(supabase=MagicMock())

    def test_empty_enrollment_is_not_success(self):
        with patch('email_crm.deliver.upsert_contact', return_value={'id':'c'}), patch('email_crm.deliver.enroll_new', return_value=None):
            with self.assertRaises(RuntimeError):
                self.deliver(supabase=MagicMock())

    def test_success_is_persisted_and_aws_only(self):
        legacy = MagicMock()
        with patch('email_crm.deliver.upsert_contact', return_value={'id':'c'}), patch('email_crm.deliver.enroll_new', return_value={'id':'e'}):
            result = self.deliver(supabase=MagicMock(), send_getresponse=legacy)
        self.assertTrue(result['aws'])
        legacy.assert_not_called()

    def test_default_aws_and_invalid_mode_fails(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(email_mode(), 'aws')
        with patch.dict(os.environ, {'EMAIL_MODE':'typo'}):
            with self.assertRaises(ValueError):
                email_mode()

    def test_fifo_message_has_no_delay_parameter(self):
        with patch.dict(os.environ, {'EMAIL_FOUNDERS_QUEUE_URL':'https://sqs.example/test.fifo'}), patch('boto3.client') as client:
            enqueue_founders_step({'id':'c','email':'test@example.com'}, {'id':'e'})
            args = client.return_value.send_message.call_args.kwargs
            self.assertNotIn('DelaySeconds', args)
            self.assertEqual(args['MessageDeduplicationId'], 'e:0')

    def test_missing_queue_fails(self):
        with patch.dict(os.environ, {'EMAIL_FOUNDERS_QUEUE_URL':''}):
            with self.assertRaises(RuntimeError):
                enqueue_founders_step({'id':'c'}, {'id':'e'})

    def test_existing_founder_retries_queue_handoff(self):
        sb = MagicMock()
        row = {'id':'e','status':'active','step_index':0,'next_send_at':None}
        sb.table.return_value.select.return_value.eq.return_value.eq.return_value.in_.return_value.execute.return_value.data = [row]
        with patch.dict(os.environ, {'EMAIL_SEND_ENABLED':'true'}), patch('email_crm.enroll.enqueue_founders_step') as queue:
            self.assertEqual(enroll_new(sb, contact={'id':'c'}, source='founders_annual', funnel='founders_annual'), row)
            queue.assert_called_once()

    def test_one_click_header_uses_backend(self):
        with patch('boto3.client') as client:
            send_ses(to_email='test@example.com', subject='Test', html='<p>Test</p>', unsubscribe_url='https://revenueripple.org/unsubscribe?token=test')
            raw = client.return_value.send_raw_email.call_args.kwargs['RawMessage']['Data'].decode()
            self.assertIn('/api/email/unsubscribe?token=test', raw)
            self.assertIn('List-Unsubscribe-Post: List-Unsubscribe=One-Click', raw)


class RouteTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.supabase = MagicMock()
        self.app.register_blueprint(email_bp)
        self.client = self.app.test_client()

    def test_admin_requires_authentication(self):
        self.assertEqual(self.client.get('/api/admin/email/enrollments').status_code, 401)
        self.assertEqual(self.client.post('/api/admin/email/enrollments/00000000-0000-4000-8000-000000000001/pause').status_code, 401)

    def test_nonadmin_cannot_pause(self):
        self.app.supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [{'role':'member'}]
        response = self.client.post('/api/admin/email/enrollments/00000000-0000-4000-8000-000000000001/pause', headers={'Authorization':'Bearer token'})
        self.assertEqual(response.status_code, 403)

    def test_admin_can_pause_active_enrollment(self):
        sb = self.app.supabase
        sb.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [{'role':'admin'}]
        sb.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value.data = [{'status':'paused'}]
        response = self.client.post('/api/admin/email/enrollments/00000000-0000-4000-8000-000000000001/pause', headers={'Authorization':'Bearer token'})
        self.assertEqual(response.status_code, 200)
        sb.table.return_value.update.assert_called_once_with({'status':'paused'})

    def test_unsigned_sns_endpoint_is_retired(self):
        response = self.client.post('/api/email/ses-events', json={'Type':'SubscriptionConfirmation','SubscribeURL':'http://localhost/private'})
        self.assertEqual(response.status_code, 410)
        self.app.supabase.table.assert_not_called()

    def test_unsubscribe_cannot_report_success_without_database(self):
        with patch('email_crm.routes._supabase', return_value=None):
            response = self.client.post('/api/email/unsubscribe?token=test')
        self.assertEqual(response.status_code, 503)

class RestartImportTests(unittest.TestCase):
    def setUp(self):
        import importlib.util
        from pathlib import Path
        spec = importlib.util.spec_from_file_location('restart_import', Path(__file__).resolve().parents[1] / 'scripts/email/import_csv_restart.py')
        self.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.mod)
        self.sb = MagicMock()

    def existing(self, rows):
        self.sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = rows

    def test_activate_existing_paused_import(self):
        self.existing([{'id':'e','status':'paused','origin':'csv_restart'}])
        self.mod.enroll_restart(self.sb, {'id':'c','status':'active'}, activate=True)
        self.assertEqual(self.sb.table.return_value.update.call_args.args[0]['status'], 'active')

    def test_completed_import_never_restarts(self):
        self.existing([{'id':'e','status':'completed','origin':'csv_restart'}])
        with patch.object(self.mod, 'enroll_new') as enroll:
            self.mod.enroll_restart(self.sb, {'id':'c','status':'active'}, activate=True)
        enroll.assert_not_called()
        self.sb.table.return_value.update.assert_not_called()

    def test_suppressed_contact_never_enrolls(self):
        self.assertEqual(self.mod.enroll_restart(self.sb, {'id':'c','status':'bounced'}, activate=True), 'suppressed')
        self.sb.table.assert_not_called()
