import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch, Mock
from datetime import datetime, timedelta, timezone
from flask import Flask
from retention_content import retention_bp
from middleware.verified_identity import install_access_guard


class RetentionRoutes(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'RETENTION_CONTENT_READY':'true',
            'SUPABASE_URL':'https://database.example.invalid', 'SUPABASE_SERVICE_ROLE_KEY':'fixture-key'})
        self.env.start(); self.addCleanup(self.env.stop)
        self.app = Flask(__name__)
        self.app.supabase = SimpleNamespace(auth=SimpleNamespace(get_user=lambda token:
            SimpleNamespace(user=SimpleNamespace(id='fixture-user',email=None))))
        install_access_guard(self.app); self.app.register_blueprint(retention_bp)
        self.client=self.app.test_client();self.headers={'Authorization':'Bearer fixture-user-token'}
        self.network=patch('retention_content.requests.request');self.http=self.network.start();self.addCleanup(self.network.stop)
        self.expiry=(datetime.now(timezone.utc)+timedelta(days=1)).isoformat()
        self.allow={'state':'allowed','valid_until':self.expiry}
        self.item={'id':'00000000-0000-4000-8000-000000000001','content_type':'playbook',
                   'level':'member','published_at':'2020-01-01T00:00:00Z','full_body':'Fixture body'}
    def response(self,body,status=200):
        r=Mock(status_code=status);r.json.return_value=body
        if status>=400:r.raise_for_status.side_effect=RuntimeError('fixture failure')
        return r
    def request(self,path='/api/vault/playbooks'):
        return self.client.get(path,headers=self.headers)
    def test_anonymous_rejected_before_network(self):
        self.assertEqual(self.client.get('/api/vault/playbooks').status_code,401);self.http.assert_not_called()
    def test_feature_disabled_before_content_read(self):
        with patch.dict(os.environ,{'RETENTION_CONTENT_READY':'false'}):self.assertEqual(self.request().status_code,503)
        self.http.assert_not_called()
    def test_free_and_inconsistent_legacy_do_not_fetch_content(self):
        for decision,status,code in [('denied',403,'membership_required'),('review',503,'access_review')]:
            with self.subTest(decision=decision):
                self.http.reset_mock();self.http.return_value=self.response({'state':decision})
                result=self.request();self.assertEqual(result.status_code,status);self.assertEqual(result.json['code'],code)
                self.assertEqual(self.http.call_count,1);self.assertNotIn('full_body',str(result.json))
    def test_valid_paid_and_admin_lifetime_have_scoped_no_store_reads(self):
        for expiry in [self.expiry,None]:
            with self.subTest(expiry=expiry):
                decision={'state':'allowed','valid_until':expiry}
                self.http.side_effect=[self.response(decision),self.response([self.item]),self.response(decision)]
                result=self.request();self.assertEqual(result.status_code,200)
                self.assertIn('no-store',result.headers['Cache-Control']);self.assertEqual(result.headers['Vary'],'Authorization')
                for call in self.http.call_args_list:
                    self.assertEqual(call.kwargs['headers']['Authorization'],'Bearer fixture-user-token')
                    self.assertFalse(call.kwargs['allow_redirects'])
                self.assertEqual(result.json['playbooks'][0]['full_body'],'Fixture body');self.http.reset_mock()
    def test_expired_coverage_denied_without_fetch(self):
        self.http.return_value=self.response({'state':'allowed','valid_until':'2020-01-01T00:00:00Z'})
        self.assertEqual(self.request().status_code,403);self.assertEqual(self.http.call_count,1)
    def test_invalid_detail_id_never_reaches_database(self):
        self.assertEqual(self.request('/api/vault/playbooks/not-a-uuid').status_code,404);self.http.assert_not_called()
    def test_valid_detail_filters_id_and_kind(self):
        self.http.side_effect=[self.response(self.allow),self.response([self.item]),self.response(self.allow)]
        result=self.request('/api/vault/playbooks/'+self.item['id']);self.assertEqual(result.status_code,200)
        params=self.http.call_args_list[1].kwargs['params'];self.assertEqual(params['id'],'eq.'+self.item['id'])
        self.assertEqual(params['content_type'],'eq.playbook');self.assertTrue(params['published_at'].startswith('lte.'))
    def test_entitlement_revoked_during_read_discards_body(self):
        self.http.side_effect=[self.response(self.allow),self.response([self.item]),self.response({'state':'denied'})]
        result=self.request();self.assertEqual(result.status_code,403);self.assertNotIn('Fixture body',result.text)
    def test_unpublished_wrong_type_and_future_fail_closed(self):
        for change in [{'published_at':None},{'published_at':'2999-01-01T00:00:00Z'},{'content_type':'course'}]:
            self.http.side_effect=[self.response(self.allow),self.response([dict(self.item,**change)])]
            self.assertEqual(self.request().status_code,503)
    def test_missing_rpc_and_transport_error_never_fallback(self):
        self.http.return_value=self.response({},404);self.assertEqual(self.request().status_code,503)
        self.assertEqual(self.http.call_count,1)
    def test_malformed_allowed_decision_fails_closed(self):
        self.http.return_value=self.response({'state':'allowed'})
        self.assertEqual(self.request().status_code,503);self.assertEqual(self.http.call_count,1)
    def test_briefings_use_same_authorization(self):
        self.http.side_effect=[self.response(self.allow),self.response([dict(self.item,content_type='premium_briefing')]),self.response(self.allow)]
        self.assertEqual(self.request('/api/vault/briefings').status_code,200)
    def test_forged_identity_rejected(self):
        self.headers['x-user-id']='other-user';self.assertEqual(self.request().status_code,403);self.http.assert_not_called()

if __name__=='__main__':unittest.main()
