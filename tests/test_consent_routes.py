"""Execute real signup handlers with Flask; external services are entirely mocked.

AST isolation deliberately avoids server module startup and any live credentials.
This covers handler integration, not deployed middleware or database networking.
"""
import ast
import contextlib
import io
from pathlib import Path
import time
import unittest
from unittest.mock import MagicMock, patch
from flask import Flask, request, jsonify
from email_crm.consent import CONSENT_VERSION, consent_from_payload
from email_crm.deliver import deliver_lead

NAMES = ('book_giveaway_submission', 'survival_playbook_submission',
         'membership_mastery_submission', 'digital_marketing_domination_submission')

class ConsentRouteTests(unittest.TestCase):
    def test_actual_handlers(self):
        tree = ast.parse(Path('server.py').read_text())
        for name in NAMES:
            for payload, expected, captures in [
                ({}, 200, 0),
                ({'email_consent': False}, 200, 0),
                ({'email_consent': True, 'email_consent_version': CONSENT_VERSION}, 200, 1),
                ({'email_consent': 'true'}, 400, 0),
                ({'email_consent': 1}, 400, 0),
                ({'email_consent': True, 'email_consent_version': 'old'}, 400, 0),
            ]:
                with self.subTest(handler=name, payload=payload):
                    self.exercise(tree, name, payload, expected, captures)

    def test_dmd_variants_use_the_reviewed_nurture_source(self):
        tree = ast.parse(Path('server.py').read_text())
        for source in ('dmd-variation-1', 'dmd-variation-2', 'dmd-variation-3'):
            with self.subTest(source=source):
                self.exercise(tree, 'digital_marketing_domination_submission',
                    {'source': source, 'email_consent': True,
                     'email_consent_version': CONSENT_VERSION}, 200, 1)

    def test_capture_failure_never_reports_success_or_falls_back(self):
        tree = ast.parse(Path('server.py').read_text())
        for name in NAMES:
            with self.subTest(handler=name):
                self.exercise(tree, name, {'email_consent': True,
                    'email_consent_version': CONSENT_VERSION}, 500, 1, fail=True)

    def exercise(self, tree, name, payload, expected, captures, fail=False):
        app = Flask(__name__)
        db = MagicMock()
        db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        db.rpc.return_value.execute.return_value.data = {'status': 'recorded'}
        if fail:
            db.rpc.return_value.execute.side_effect = RuntimeError('test database unavailable')
        legacy = MagicMock(side_effect=AssertionError('No legacy email provider allowed'))
        scope = dict(request=request, jsonify=jsonify, time=time, submission_attempts={},
            supabase=db, deliver_lead=deliver_lead, consent_from_payload=consent_from_payload,
            record_acquisition_lead=MagicMock(), send_conversion_event=MagicMock(),
            add_book_giveaway_to_getresponse=legacy, add_survival_playbook_to_getresponse=legacy,
            add_membership_mastery_to_getresponse=legacy,
            add_digital_marketing_domination_to_getresponse=legacy)
        node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == name)
        node.decorator_list = []
        exec(compile(ast.Module(body=[node], type_ignores=[]), 'server.py', 'exec'), scope)
        app.add_url_rule('/signup', name, scope[name], methods=['POST'])
        with contextlib.redirect_stdout(io.StringIO()):
            response = app.test_client().post('/signup', json={'name': 'Test',
                'email': 'TEST@example.com', **payload})
        self.assertEqual(response.status_code, expected, response.json)
        self.assertEqual(db.rpc.call_count, captures)
        if captures:
            args = db.rpc.call_args.args
            self.assertEqual(args[0], 'email_capture_optin')
            self.assertEqual(args[1]['p_email'], 'test@example.com')
            self.assertIs(args[1]['p_accepted'], True)
            self.assertEqual(args[1]['p_version'], CONSENT_VERSION)
            if name == 'digital_marketing_domination_submission':
                self.assertEqual(args[1]['p_source'], 'digital-marketing-domination')
        legacy.assert_not_called()

if __name__ == '__main__':
    unittest.main()
