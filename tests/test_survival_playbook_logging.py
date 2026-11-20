"""Exercise the real Flask handler with synthetic data and no server startup."""
import ast
import os
from pathlib import Path
from unittest.mock import Mock

from flask import Flask, jsonify, request
import pytest

from acquisition.attribution import record_lead
from email_crm.consent import CONSENT_VERSION, consent_from_payload
from email_crm.deliver import deliver_lead

ROUTE = '/api/getresponse/survival-playbook'
EMAIL = 'private-example@example.invalid'
NAME = 'Private Fixture Name'
IP = '192.0.2.47'
AUTH = 'Bearer synthetic-auth-fixture'
COOKIE = 'synthetic-session-fixture'
UA = 'synthetic-user-agent-fixture'
UTM = 'synthetic-private-attribution'
TOUCH = '00000000-0000-4000-8000-000000000001'
ERROR = f'private backend detail for {EMAIL} and {AUTH}'


@pytest.fixture
def handler(monkeypatch, capsys, caplog):
    monkeypatch.setenv('ACQUISITION_ATTRIBUTION_ENABLED', 'true')
    monkeypatch.setenv('GETRESPONSE_CAMPAIGN_ID', 'synthetic-campaign')
    monkeypatch.setenv('GETRESPONSE_API_KEY', 'synthetic-key')
    db = Mock()
    db.rpc.return_value.execute.return_value.data = {'status': 'recorded'}
    provider = Mock()
    scope = dict(app=Flask(__name__), request=request, jsonify=jsonify,
                 time=Mock(), submission_attempts={}, supabase=db,
                 deliver_lead=deliver_lead, consent_from_payload=consent_from_payload,
                 record_acquisition_lead=record_lead, requests=provider,
                 os=os, get_getresponse_campaign_id=lambda: 'fake-campaign')
    scope['time'].time.return_value = 1000
    path = Path(__file__).resolve().parents[1] / 'server.py'
    nodes = [n for n in ast.parse(path.read_text()).body
             if isinstance(n, ast.FunctionDef) and n.name in {
                 'survival_playbook_submission', 'add_survival_playbook_to_getresponse'}]
    assert len(nodes) == 2
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), 'exec'), scope)
    yield scope['app'].test_client(), db, provider, scope
    captured = capsys.readouterr()
    logged = captured.out + captured.err + caplog.text
    for sentinel in (EMAIL, EMAIL.upper(), NAME, IP, AUTH, COOKIE, UA, UTM, TOUCH, ERROR):
        assert sentinel not in logged


def post(client, **data):
    client.set_cookie('session', COOKIE)
    return client.post(ROUTE, json={'email': EMAIL.upper(), 'name': NAME, 'utm_content': UTM,
                                     'acquisition': {'first_touch_id': TOUCH}, **data},
                       headers={'Authorization': AUTH, 'User-Agent': UA},
                       environ_overrides={'REMOTE_ADDR': IP})


@pytest.mark.parametrize('consent', [{}, {'email_consent': False},
                                    {'email_consent': True, 'email_consent_version': CONSENT_VERSION}])
def test_success_preserves_download_opt_in_and_recorded_data(handler, consent):
    client, db, provider, _ = handler
    response = post(client, **consent)
    assert response.status_code == 200
    assert response.json == {'success': True,
                             'message': 'Successfully submitted! Redirecting to your free guide...'}
    assert [call.args[0] for call in db.rpc.call_args_list] == (
        ['email_capture_optin'] if consent.get('email_consent') else []) + ['acquisition_record_lead']
    db.table.assert_called_once_with('survival_playbook_submissions')
    stored = db.table.return_value.insert.call_args.args[0]
    assert (stored['email'], stored['name'], stored['ip_address'],
            stored['user_agent'], stored['utm_content']) == (EMAIL, NAME, IP, UA, UTM)
    provider.post.assert_not_called()


@pytest.mark.parametrize('changes,code', [
    ({'email_consent': 'true'}, 400), ({'name': ''}, 400), ({'email': 'not-an-email'}, 400),
])
def test_rejections_log_no_request_details(handler, changes, code):
    client, db, provider, _ = handler
    assert post(client, **changes).status_code == code
    db.table.assert_not_called()
    db.rpc.assert_not_called()
    provider.post.assert_not_called()


@pytest.mark.parametrize('body,code', [(b'[]', 400), (b'{synthetic-bad-json', 500)])
def test_invalid_json_does_not_expose_headers_or_input(handler, body, code):
    client, db, provider, _ = handler
    response = client.post(ROUTE, data=body, content_type='application/json',
                           headers={'Authorization': AUTH, 'User-Agent': UA},
                           environ_overrides={'REMOTE_ADDR': IP})
    assert response.status_code == code
    db.table.assert_not_called()
    db.rpc.assert_not_called()
    provider.post.assert_not_called()


def test_rate_limit_and_debug_get_unchanged(handler):
    client, _, _, _ = handler
    assert client.get(ROUTE).status_code == 200
    assert [post(client).status_code for _ in range(4)] == [200, 200, 200, 429]
    assert client.get(ROUTE).json['method'] == 'GET'


@pytest.mark.parametrize('stage,code', [('consent', 500), ('attribution', 200), ('insert', 200)])
def test_downstream_error_payloads_never_logged(handler, stage, code, caplog):
    client, db, provider, _ = handler
    if stage == 'insert':
        db.table.return_value.insert.return_value.execute.side_effect = RuntimeError(ERROR)
    else:
        db.rpc.return_value.execute.side_effect = RuntimeError(ERROR)
    changes = {'email_consent': True, 'email_consent_version': CONSENT_VERSION} if stage == 'consent' else {}
    assert post(client, **changes).status_code == code
    if stage == 'attribution':
        assert 'acquisition.lead_attribution_failed' in caplog.text
        assert all(record.exc_info is None for record in caplog.records)
    provider.post.assert_not_called()


@pytest.mark.parametrize('status', [202, 409, 503, None])
def test_dormant_legacy_callback_does_not_log_contacts_or_provider_details(handler, status):
    _, _, provider, scope = handler
    if status is None:
        provider.post.side_effect = RuntimeError(ERROR)
    else:
        provider.post.return_value.status_code = status
        provider.post.return_value.text = ERROR
    scope['add_survival_playbook_to_getresponse'](EMAIL, NAME, UTM, '', '', '', '', '')
    provider.post.assert_called_once()
