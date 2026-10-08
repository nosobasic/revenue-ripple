import unittest
from types import SimpleNamespace
from flask import Flask
from owner_pilot import owner_pilot
from middleware.verified_identity import install_access_guard

class OwnerPilotTests(unittest.TestCase):
    def setUp(self):
        self.email='wdonte97@gmail.com';self.confirmed='2026-01-01T00:00:00Z'
        def get_user(token):
            if token!='verified':raise ValueError('invalid')
            return SimpleNamespace(user=SimpleNamespace(id='owner-id',email=self.email,email_confirmed_at=self.confirmed))
        app=Flask(__name__);app.supabase=SimpleNamespace(auth=SimpleNamespace(get_user=get_user))
        install_access_guard(app);app.register_blueprint(owner_pilot);self.client=app.test_client()
        self.headers={'Authorization':'Bearer verified'}
    def test_anonymous_denied(self):
        self.assertEqual(self.client.get('/api/visibility-pilot/status').status_code,401)
    def test_invalid_token_denied(self):
        self.assertEqual(self.client.get('/api/visibility-pilot/status',headers={'Authorization':'Bearer bad'}).status_code,401)
    def test_other_account_cannot_claim_owner(self):
        self.email='other@example.test'
        self.assertEqual(self.client.get('/api/visibility-pilot/status?email=wdonte97@gmail.com',headers={**self.headers,'x-user-role':'admin','x-user-email':'wdonte97@gmail.com'}).status_code,403)
    def test_unconfirmed_owner_denied(self):
        self.confirmed=None
        self.assertEqual(self.client.get('/api/visibility-pilot/status',headers=self.headers).status_code,403)
    def test_verified_owner_preparation_only(self):
        r=self.client.get('/api/visibility-pilot/status',headers=self.headers)
        self.assertEqual(r.status_code,200);self.assertFalse(r.json['scans_enabled']);self.assertFalse(r.json['purchases_enabled'])
        self.assertEqual(r.headers['Cache-Control'],'private, no-store')
    def test_no_scan_or_write_endpoint(self):
        self.assertEqual(self.client.post('/api/visibility-pilot/status',headers=self.headers).status_code,405)
        self.assertEqual(self.client.post('/api/visibility-pilot/scan',headers=self.headers).status_code,404)
    def test_old_ai_stays_closed(self):
        self.assertEqual(self.client.get('/api/ai-visibility/profile',headers=self.headers).status_code,503)
    def test_release_reports_disabled_without_auth(self):
        r=self.client.get('/api/visibility-pilot/release')
        self.assertEqual(r.status_code,200);self.assertFalse(r.json['scans_enabled'])
