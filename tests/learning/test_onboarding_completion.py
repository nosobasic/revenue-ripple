"""Completion contract tests; execute the handler with an in-memory DB double.

No Flask or Supabase service required. The handler is extracted to isolate
persistence ordering and retry behavior from deployment/auth configuration.
"""
import ast
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
import unittest
from uuid import uuid5, NAMESPACE_URL
import traceback


class Database:
    def __init__(self, profile):
        self.profile = profile
        self.goals = {}
        self.completed = False
        self.fail_goal = False
        self.fail_completion = False

    def table(self, name):
        db = self

        class Query:
            def select(self, *_): return self
            def eq(self, *_): return self
            def upsert(self, data, **kwargs):
                self.insert = data
                self.ignore = kwargs.get('ignore_duplicates')
                return self
            def update(self, data):
                self.update_data = data
                return self
            def execute(self):
                if name == 'user_goals':
                    if db.fail_goal: raise RuntimeError('goal unavailable')
                    if not self.ignore or self.insert['id'] not in db.goals:
                        db.goals[self.insert['id']] = self.insert
                    return SimpleNamespace(data=list(db.goals.values()))
                if hasattr(self, 'update_data'):
                    if db.fail_completion: raise RuntimeError('completion unavailable')
                    db.completed = self.update_data['completed']
                return SimpleNamespace(data=[{'data': db.profile}] if db.profile is not None else [])
        return Query()


def handler(db):
    source = Path(__file__).resolve().parents[2] / 'server/routes/onboarding.py'
    tree = ast.parse(source.read_text())
    function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'complete_onboarding')
    function.decorator_list = []
    namespace = {'supabase': db, 'jsonify': lambda value: value, 'datetime': datetime,
                 'uuid5': uuid5, 'NAMESPACE_URL': NAMESPACE_URL, 'traceback': traceback,
                 'print': lambda *_: None}
    exec(compile(ast.Module(body=[function], type_ignores=[]), str(source), 'exec'), namespace)
    return namespace['complete_onboarding']


class CompletionTests(unittest.TestCase):
    def test_goal_created_before_completed(self):
        db = Database({'goals': 'Build an email list', 'interests': ['Email Marketing']})
        self.assertIn('state', handler(db)('user-a'))
        self.assertTrue(db.completed)
        self.assertEqual(next(iter(db.goals.values()))['title'], 'Build an email list')

    def test_retry_after_partial_failure_does_not_duplicate_goal(self):
        db = Database({'goals': 'Build an email list'})
        db.fail_completion = True
        self.assertEqual(handler(db)('user-a')[1], 500)
        self.assertFalse(db.completed)
        db.fail_completion = False
        self.assertIn('state', handler(db)('user-a'))
        self.assertEqual(len(db.goals), 1)
        self.assertIn('state', handler(db)('user-a'))
        self.assertEqual(len(db.goals), 1)

    def test_goal_failure_never_completes_onboarding(self):
        db = Database({'goals': 'Build an email list'})
        db.fail_goal = True
        self.assertEqual(handler(db)('user-a')[1], 500)
        self.assertFalse(db.completed)

    def test_empty_or_missing_state_cannot_complete(self):
        for profile, status in [(None, 404), ({'goals': '  '}, 400)]:
            db = Database(profile)
            self.assertEqual(handler(db)('user-a')[1], status)
            self.assertFalse(db.completed)
            self.assertFalse(db.goals)

    def test_user_goal_ids_are_distinct(self):
        db = Database({'goals': 'Learn marketing'})
        handler(db)('user-a')
        handler(db)('user-b')
        self.assertEqual(len(db.goals), 2)


if __name__ == '__main__':
    unittest.main()
