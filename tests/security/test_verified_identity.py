import ast
import importlib.util
from pathlib import Path
from types import SimpleNamespace
import unittest
from flask import Flask, jsonify

ROOT=Path(__file__).resolve().parents[2]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
identity=load('verified_identity',ROOT/'middleware/verified_identity.py')
projection=load('quiz_projection',ROOT/'server/quiz_projection.py')

class AuthTests(unittest.TestCase):
    def setUp(self):
        self.calls=[];self.role='member'
        def get_user(token):
            self.calls.append(token)
            if token!='valid': raise ValueError('expired')
            return SimpleNamespace(user=SimpleNamespace(id='user-a',email='a@example.test'))
        test=self
        class Query:
            def select(self,*args):return self
            def eq(self,key,value):test.assertEqual((key,value),('id','user-a'));return self
            def limit(self,n):return self
            def execute(self):return SimpleNamespace(data=[{'role':test.role}])
        self.app=Flask(__name__)
        self.app.supabase=SimpleNamespace(auth=SimpleNamespace(get_user=get_user),table=lambda _:Query())
        identity.install_access_guard(self.app)
        @self.app.route('/member',methods=['GET'])
        @identity.require_user
        def member(user_id):return jsonify(id=user_id)
        @self.app.route('/admin/delete-user',methods=['POST'])
        def admin():return jsonify(ok=True)
        @self.app.route('/api/community/posts',methods=['GET','POST','OPTIONS'])
        def community():return jsonify(ok=True)
        @self.app.route('/api/ai-visibility/profile')
        def inactive():return jsonify(ok=True)
        @self.app.route('/webhook',methods=['POST'])
        def webhook():return jsonify(signature_verification='handled by webhook')
        self.client=self.app.test_client()
    def test_spoofed_header_is_not_authentication(self):
        self.assertEqual(self.client.get('/member',headers={'x-user-id':'user-a'}).status_code,401)
        self.assertEqual(self.calls,[])
    def test_invalid_expired_token_denied(self):
        self.assertEqual(self.client.get('/member',headers={'Authorization':'Bearer expired'}).status_code,401)
    def test_verified_identity_used(self):
        r=self.client.get('/member',headers={'Authorization':'Bearer valid'})
        self.assertEqual(r.json,{'id':'user-a'});self.assertEqual(self.calls,['valid'])
    def test_conflicting_header_denied(self):
        self.assertEqual(self.client.get('/member',headers={'Authorization':'Bearer valid','x-user-id':'user-b'}).status_code,403)
    def test_admin_role_header_cannot_escalate(self):
        self.assertEqual(self.client.post('/admin/delete-user',headers={'Authorization':'Bearer valid','x-user-role':'admin'}).status_code,403)
    def test_verified_admin_allowed(self):
        self.role='admin'
        self.assertEqual(self.client.post('/admin/delete-user',headers={'Authorization':'Bearer valid'}).status_code,200)
    def test_cross_user_body_and_query_denied(self):
        h={'Authorization':'Bearer valid'}
        self.assertEqual(self.client.post('/api/community/posts',headers=h,json={'user_id':'user-b'}).status_code,403)
        self.assertEqual(self.client.get('/api/community/posts?user_id=user-b',headers=h).status_code,403)
        self.assertEqual(self.client.post('/api/community/posts',headers=h,json={'user_id':'user-a'}).status_code,200)
    def test_protected_read_requires_session(self):
        self.assertEqual(self.client.get('/api/community/posts').status_code,401)
    def test_preflight_has_no_auth_side_effect(self):
        self.assertEqual(self.client.options('/api/community/posts').status_code,200);self.assertEqual(self.calls,[])
    def test_inactive_unscoped_feature_fails_closed(self):
        self.assertEqual(self.client.get('/api/ai-visibility/profile',headers={'Authorization':'Bearer valid'}).status_code,503)
    def test_webhook_uses_its_own_signature_auth(self):
        self.assertEqual(self.client.post('/webhook').status_code,200);self.assertEqual(self.calls,[])
    def test_no_answer_key_in_pregrading_quiz(self):
        quiz={'id':1,'questions':[{'id':1,'question':'Q','correctAnswer':'a','explanation':'secret','options':[{'id':'a','text':'A','isCorrect':True}]}]}
        safe=projection.public_quiz(quiz)
        self.assertEqual(safe,{'id':1,'questions':[{'id':1,'question':'Q','options':[{'id':'a','text':'A'}]}]})
        self.assertIn('correctAnswer',quiz['questions'][0])

class PrivacyTests(unittest.TestCase):
    def test_shared_community_profiles_do_not_expose_email(self):
        tree=ast.parse((ROOT/'server.py').read_text())
        fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='attach_community_users')
        selected=[]
        class Query:
            def select(self,columns):selected.append(columns);return self
            def in_(self,*args):return self
            def execute(self):return SimpleNamespace(data=[{'id':'a','name':'Member A','email':'private@example.test'}])
        scope={'supabase':SimpleNamespace(table=lambda _:Query()),'print':lambda *_:None}
        exec(compile(ast.Module(body=[fn],type_ignores=[]),'<privacy-test>','exec'),scope)
        result=scope['attach_community_users']([{'user_id':'a','title':'A post'}])
        self.assertEqual(selected,['id, name'])
        self.assertEqual(result[0]['users'],{'id':'a','name':'Member A'})

if __name__=='__main__':unittest.main()
