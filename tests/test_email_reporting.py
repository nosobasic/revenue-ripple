"""Offline tests only. Synthetic records here never enter application reporting."""
import copy
import hashlib
import json
import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch
from flask import Flask
from email_crm.reporting import build_report, _rows
from email_crm.reporting_routes import email_reporting_bp

NOW = datetime(2026, 10, 11, 12, tzinfo=timezone.utc)


def dataset():
    return {
        'users': [{'id': 'admin-id', 'role': 'admin'}],
        'email_contacts': [
            {'id': 'h', 'email': 'human@example.test', 'source': 'form', 'status': 'active', 'unsubscribed_at': None},
            {'id': 's', 'email': 'success@simulator.amazonses.com', 'source': 'form', 'status': 'active'},
            {'id': 't', 'email': 'test@example.test', 'source': 'ses-simulator:run:operator-test-not-human-consent', 'status': 'active'},
            {'id': 'l', 'email': 'legacy@example.test', 'source': 'form', 'status': 'active'},
            {'id': 'u', 'email': 'optout@example.test', 'source': 'form', 'status': 'unsubscribed', 'unsubscribed_at': '2026-10-10T11:00:00Z'},
        ],
        'email_enrollments': [{'id': cid, 'contact_id': cid, 'sequence_id': 'indoctrination'} for cid in ('h', 's', 't')],
        'email_delivery_attempts': [
            {'id': cid, 'enrollment_id': cid, 'step_index': 0, 'provider': 'ses', 'state': 'accepted', 'provider_message_id': cid,
             'accepted_at': '2026-10-10T12:00:00Z', 'created_at': '2026-10-10T11:00:00Z'} for cid in ('h', 's', 't')],
        'email_provider_events': [
            {'provider': 'ses', 'event_key': 'a', 'recipient': 'human@example.test', 'event_type': 'delivery', 'message_id': 'h', 'occurred_at': '2026-10-10T13:00:00Z'},
            {'provider': 'ses', 'event_key': 'b', 'recipient': 'human@example.test', 'event_type': 'delivery', 'message_id': 'h', 'occurred_at': '2026-10-10T14:00:00Z'},
            {'provider': 'ses', 'event_key': 'c', 'recipient': 'success@simulator.amazonses.com', 'event_type': 'delivery', 'message_id': 's', 'occurred_at': '2026-10-10T14:00:00Z'},
        ],
        'email_launch_admissions': [{'contact_id': cid, 'disposition': 'new_optin', 'recorded_at': '2026-10-10T11:00:00Z'} for cid in ('h', 's', 't', 'l', 'u')],
        'email_optin_consents': [{'contact_id': cid, 'version': 'free-education-2026-10-06', 'source': 'form', 'captured_at': '2026-10-10T11:00:00Z'} for cid in ('h', 's', 't', 'l', 'u')],
        'email_legacy_manifest': [{'id': True, 'ready': True, 'expected_count': 1}],
        'email_legacy_exclusions': [{'email_sha256': hashlib.sha256(b'legacy@example.test').hexdigest()}],
    }


class Query:
    def __init__(self, db, table):
        self.db, self.table_name, self.filters = db, table, []
        self.bounds = (0, 99999)
    def select(self, _): return self
    def order(self, _): return self
    def eq(self, key, value): self.filters.append(lambda row: row.get(key) == value); return self
    def gte(self, key, value): self.filters.append(lambda row: datetime.fromisoformat(row[key].replace('Z', '+00:00')) >= datetime.fromisoformat(value)); return self
    def lt(self, key, value): self.filters.append(lambda row: datetime.fromisoformat(row[key].replace('Z', '+00:00')) < datetime.fromisoformat(value)); return self
    def range(self, start, end): self.bounds = (start, end); return self
    def limit(self, n): self.bounds = (0, n-1); return self
    def execute(self):
        self.db.reads.append(self.table_name)
        if self.table_name in self.db.fail: raise RuntimeError('private database detail human@example.test')
        rows = self.db.data[self.table_name]
        for fn in self.filters: rows = [r for r in rows if fn(r)]
        return SimpleNamespace(data=rows[self.bounds[0]:self.bounds[1]+1])


class Database:
    def __init__(self):
        self.data, self.fail, self.reads = dataset(), set(), []
        self.auth = SimpleNamespace(get_user=lambda token: SimpleNamespace(user=SimpleNamespace(id='admin-id', user_metadata={'role': 'admin'})))
    def table(self, name): return Query(self, name)


class Aggregates(unittest.TestCase):
    def setUp(self): self.db = Database()
    def report(self): return build_report(self.db, 7, NOW)
    def test_duplicate_feedback_retries_and_simulators(self):
        self.db.data['email_delivery_attempts'].append(copy.deepcopy(self.db.data['email_delivery_attempts'][0]))
        result = self.report()
        self.assertEqual(result['delivery']['counts']['accepted'], 1)
        self.assertEqual(result['delivery']['counts']['delivery'], 1)
        self.assertEqual(result['list']['total'], 3)
        self.assertEqual(result['list']['eligible'], 1)
        self.assertEqual(result['list']['suppressed'], 1)
        self.assertEqual(result['list']['unsubscribed_in_window'], 1)
        self.assertEqual(sum(row['accepted'] for row in result['delivery']['daily']), 1)
        self.assertEqual(result['engagement']['status'], 'unavailable')
        self.assertIsNone(result['list']['growth'])
        serialized = json.dumps(result)
        self.assertNotIn('@', serialized)
        self.assertNotIn('admin-id', serialized)
    def test_no_messages_does_not_fabricate_tracking(self):
        self.db.data['email_delivery_attempts'] = []
        result = self.report()
        self.assertEqual(result['delivery']['counts']['accepted'], 0)
        self.assertEqual(result['engagement']['status'], 'unavailable')
        self.assertIsNone(result['delivery']['last_feedback_recorded_at'])
    def test_source_failure_is_unavailable_not_partial_zero(self):
        self.db.fail.add('email_provider_events')
        result = self.report()
        self.assertEqual(result['delivery'], {'status': 'unavailable'})
        self.assertEqual(result['list']['status'], 'available')
        self.assertNotIn('private', json.dumps(result))
        self.db.fail.add('email_contacts')
        self.assertEqual(self.report()['list'], {'status': 'unavailable'})
    def test_eligibility_requires_manifest_and_quarantine_visibility(self):
        self.db.data['email_legacy_manifest'][0]['ready'] = False
        self.assertIsNone(self.report()['list']['eligible'])
        self.db.data['email_legacy_manifest'][0]['ready'] = True
        self.db.fail.add('email_delivery_attempts')
        self.assertIsNone(self.report()['list']['eligible'])
    def test_uncertain_attempt_excludes_eligibility(self):
        self.db.data['email_delivery_attempts'][0]['state'] = 'uncertain'
        result = self.report()
        self.assertEqual(result['list']['eligible'], 0)
        self.assertEqual(result['delivery']['operations']['uncertain'], 1)
    def test_out_of_order_feedback_does_not_change_suppression(self):
        self.db.data['email_contacts'][0]['status'] = 'unsubscribed'
        result = self.report()
        self.assertEqual(result['list']['eligible'], 0)
        self.assertEqual(result['delivery']['counts']['delivery'], 1)
        self.assertEqual(self.db.data['email_contacts'][0]['status'], 'unsubscribed')
    def test_event_types_and_same_person_multiple_messages(self):
        a = copy.deepcopy(self.db.data['email_delivery_attempts'][0]); a.update(id='h2', step_index=1, provider_message_id='h2')
        self.db.data['email_delivery_attempts'].append(a)
        for kind in ['delivery', 'bounced', 'transient_bounce', 'complained', 'reject']:
            event = copy.deepcopy(self.db.data['email_provider_events'][0]); event.update(event_key=kind, event_type=kind, message_id='h2')
            self.db.data['email_provider_events'].append(event)
        result = self.report()['delivery']
        self.assertEqual(result['counts']['accepted'], 2)
        self.assertEqual(result['counts']['delivery'], 2)
        self.assertEqual(result['counts']['transient_bounce'], 1)
        self.assertEqual(len(result['messages']), 2)
    def test_accepted_window_half_open_and_timezone(self):
        a = self.db.data['email_delivery_attempts'][0]
        a['accepted_at'] = '2026-10-04T08:00:00-04:00'
        self.assertEqual(self.report()['delivery']['counts']['accepted'], 1)
        a['accepted_at'] = NOW.isoformat()
        self.assertEqual(self.report()['delivery']['counts']['accepted'], 0)
    def test_feedback_before_acceptance_is_retained(self):
        # Reconciliation can record acceptance after the provider event arrived.
        self.db.data['email_delivery_attempts'][0]['accepted_at'] = '2026-10-04T12:00:00Z'
        self.db.data['email_provider_events'][0]['occurred_at'] = '2026-10-04T11:59:59Z'
        self.db.data['email_provider_events'] = self.db.data['email_provider_events'][:1]
        self.assertEqual(self.report()['delivery']['counts']['delivery'], 1)

    def test_recipient_and_provider_must_match(self):
        self.db.data['email_provider_events'][0]['recipient'] = 'other@example.test'
        self.db.data['email_provider_events'][1]['provider'] = 'other'
        self.assertEqual(self.report()['delivery']['counts']['delivery'], 0)
    def test_pagination_and_limit(self):
        with patch('email_crm.reporting.PAGE_SIZE', 2), patch('email_crm.reporting.MAX_ROWS', 10):
            self.assertEqual(len(_rows(self.db, 'email_contacts', 'id')), 5)
        with patch('email_crm.reporting.PAGE_SIZE', 2), patch('email_crm.reporting.MAX_ROWS', 4):
            with self.assertRaises(ValueError): _rows(self.db, 'email_contacts', 'id')


class Authorization(unittest.TestCase):
    def setUp(self):
        self.db = Database()
        app = Flask(__name__); app.supabase = self.db; app.register_blueprint(email_reporting_bp)
        self.client = app.test_client()
    def get(self, headers=None, suffix=''):
        return self.client.get('/api/admin/email/reporting'+suffix, headers=headers or {})
    def test_anonymous_denied_before_data(self):
        self.assertEqual(self.get().status_code, 401)
        self.assertEqual(self.db.reads, [])
    def test_client_role_and_metadata_cannot_escalate(self):
        self.db.data['users'][0]['role'] = 'member'
        self.assertEqual(self.get({'Authorization': 'Bearer valid', 'x-user-role': 'admin'}).status_code, 403)
        self.assertEqual(set(self.db.reads), {'users'})
    def test_expired_and_mismatched_identity(self):
        self.db.auth.get_user = lambda _: (_ for _ in ()).throw(ValueError())
        self.assertEqual(self.get({'Authorization': 'Bearer expired'}).status_code, 401)
        self.db.auth.get_user = lambda _: SimpleNamespace(user=SimpleNamespace(id='admin-id'))
        self.assertEqual(self.get({'Authorization': 'Bearer valid', 'x-user-id': 'someone-else'}).status_code, 403)
    def test_admin_and_bounded_window(self):
        response = self.get({'Authorization': 'Bearer valid'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Cache-Control'], 'no-store')
        self.assertNotIn('@', response.get_data(as_text=True))
        self.assertEqual(self.get({'Authorization': 'Bearer valid'}, '?days=999').status_code, 400)
    def test_missing_profile_and_auth_store_failure(self):
        self.db.data['users'] = []
        self.assertEqual(self.get({'Authorization': 'Bearer valid'}).status_code, 403)
        self.db.fail.add('users')
        self.assertEqual(self.get({'Authorization': 'Bearer valid'}).status_code, 503)


if __name__ == '__main__': unittest.main()
