import unittest
from types import SimpleNamespace
from flask import Flask
from middleware.verified_identity import install_access_guard
from visibility.routes import visibility_bp

class CurrentAppGuardTests(unittest.TestCase):
    def setUp(self):
        self.calls=[]
        self.app=Flask(__name__)
        def rpc(name,args):
            self.calls.append((name,args))
            return SimpleNamespace(execute=lambda:SimpleNamespace(data={"enabled":False,"remaining":1}))
        self.app.supabase=SimpleNamespace(auth=SimpleNamespace(get_user=lambda token:SimpleNamespace(user=SimpleNamespace(id="verified-owner",email="fixture@example.test"))),rpc=rpc)
        install_access_guard(self.app)
        self.app.register_blueprint(visibility_bp)
        self.client=self.app.test_client()
    def test_new_routes_require_auth_and_use_verified_owner(self):
        self.assertEqual(self.client.get('/api/visibility/access').status_code,401)
        result=self.client.get('/api/visibility/access?user_id=forged',headers={"Authorization":"Bearer fixture"})
        self.assertEqual(result.status_code,200)
        self.assertEqual(self.calls[0],('rr_v_access',{'p_user':'verified-owner'}))
        self.assertFalse(result.json['enabled'])
    def test_old_unsafe_routes_stay_closed(self):
        self.assertEqual(self.client.get('/api/ai-visibility/results',headers={"Authorization":"Bearer fixture"}).status_code,503)
        self.assertEqual(self.calls,[])
    def test_missing_database_fails_closed(self):
        self.app.supabase.rpc=lambda *a,**k: (_ for _ in ()).throw(RuntimeError('Unavailable'))
        self.assertEqual(self.client.get('/api/visibility/access',headers={"Authorization":"Bearer fixture"}).status_code,503)
