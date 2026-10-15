import unittest,subprocess
from pathlib import Path
from types import SimpleNamespace
from flask import Flask
from middleware.verified_identity import install_access_guard
from visibility.routes import visibility_bp
from retention_content import retention_bp
class Rollout(unittest.TestCase):
 def test_both_blueprints_preserve_auth(self):
  app=Flask(__name__);app.supabase=SimpleNamespace(auth=SimpleNamespace(get_user=lambda token:SimpleNamespace(user=SimpleNamespace(id='verified-owner'))),rpc=lambda name,args:SimpleNamespace(execute=lambda:SimpleNamespace(data={'enabled':False,'remaining':0})))
  install_access_guard(app);app.register_blueprint(visibility_bp);app.register_blueprint(retention_bp)
  c=app.test_client()
  for path in ['/api/vault/playbooks','/api/vault/briefings','/api/visibility/access']:
   self.assertEqual(c.get(path).status_code,401)
  self.assertEqual(c.get('/api/ai-visibility/results',headers={'Authorization':'Bearer fixture'}).status_code,503)
  self.assertEqual(c.get('/api/vault/playbooks',headers={'Authorization':'Bearer fixture'}).status_code,503)
 def test_navbar_and_profile_guard_unchanged(self):
  for p in ['src/components/Navbar.jsx','src/components/ProtectedRoute.jsx','middleware/legacy_membership.py','middleware/verified_identity.py']:
   old=subprocess.check_output(['git','show','6651a149:'+p]);self.assertEqual(Path(p).read_bytes(),old)
 def test_new_sql_never_replaces_existing_entitlements(self):
  sql=Path('docs/review-sql/paid-retention.sql').read_text()
  for name in ['rr_access','rr_v_access','rr_v_submit','email_reporting_snapshot']:
   self.assertNotIn('FUNCTION public.'+name+'(',sql)
  self.assertTrue(sql.rstrip().endswith('ROLLBACK;'))
 def test_reporting_membership_and_tracker_guards_preserved(self):
  server=Path('server.py').read_text();app=Path('src/App.jsx').read_text()
  for name in ['email_reporting_bp','owner_pilot','visibility_bp','retention_bp']:
   self.assertIn('app.register_blueprint('+name+')',server)
  self.assertIn('path="/membership" element={<MembershipReview />}',app)
  self.assertIn('path="/ai-visibility-tracker" element={<ProtectedRoute>',app)
