"""Paid retention reads, delegated to the verified user's database identity.

No billing writes, service-role content fallback, or client-supplied identity.
Disabled until the separate entitlement reconciliation/release is approved.
"""
import os
import uuid
from datetime import datetime, timezone
from urllib.parse import urlsplit

import requests
from flask import Blueprint, jsonify, request
from middleware.verified_identity import verified_identity

retention_bp = Blueprint('retention_content', __name__)
FIELDS = 'id,content_type,level,title,short_description,full_body,url_slug,tags,created_at,published_at'


class RetentionFailure(Exception):
    def __init__(self, status=503, code='access_unavailable'):
        self.status, self.code = status, code


def _gateway(token, path, *, params=None, body=None):
    base = (os.getenv('SUPABASE_URL') or '').rstrip('/')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY')
    if urlsplit(base).scheme != 'https' or not key or not token:
        raise RetentionFailure()
    # Existing key is gateway apikey ONLY; the caller's verified JWT supplies role.
    try:
        response = requests.request('POST' if body is not None else 'GET',
            base + '/rest/v1/' + path,
            headers={'apikey': key, 'Authorization': 'Bearer ' + token,
                     'Content-Type': 'application/json', 'Cache-Control': 'no-store'},
            params=params, json=body, timeout=12, allow_redirects=False)
        if response.status_code in (401, 403):
            raise RetentionFailure(response.status_code, 'access_denied')
        response.raise_for_status()
        return response.json()
    except RetentionFailure:
        raise
    except Exception:
        raise RetentionFailure() from None


def _access(token):
    decision = _gateway(token, 'rpc/rr_retention_access', body={})
    if not isinstance(decision, dict) or decision.get('state') not in ('allowed', 'denied', 'review'):
        raise RetentionFailure()
    if decision['state'] != 'allowed':
        raise RetentionFailure(403 if decision['state'] == 'denied' else 503,
                               'membership_required' if decision['state'] == 'denied' else 'access_review')
    if 'valid_until' not in decision:
        raise RetentionFailure()
    expiry = decision.get('valid_until')
    if expiry is not None:
        try:
            when = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            if when.tzinfo is None or when <= datetime.now(timezone.utc):
                raise ValueError()
        except (TypeError, ValueError, AttributeError):
            raise RetentionFailure(403, 'membership_required') from None
    return {'state': 'allowed', 'valid_until': expiry}


@retention_bp.after_request
def no_store(response):
    response.headers['Cache-Control'] = 'private, no-store'
    response.headers['Vary'] = 'Authorization'
    return response


@retention_bp.errorhandler(RetentionFailure)
def access_failure(error):
    return jsonify(success=False, code=error.code,
                   error=('Membership access needs verification.' if error.status == 503
                          else 'Content not available.' if error.status == 404
                          else 'Paid membership is required for playbooks and briefings.')), error.status


def _read(kind, identifier=None):
    verified_identity()
    # Integration candidate is off by default; never silently activate billing.
    if os.getenv('RETENTION_CONTENT_READY') != 'true':
        raise RetentionFailure()
    if identifier is not None:
        try:
            identifier = str(uuid.UUID(identifier))
        except (ValueError, TypeError, AttributeError):
            raise RetentionFailure(404, 'content_not_found') from None
    token = request.headers['Authorization'].split()[1]
    decision = _access(token)
    params = {'select': FIELDS, 'content_type': 'eq.' + kind, 'level': 'eq.member',
              'published_at': 'lte.' + datetime.now(timezone.utc).isoformat(),
              'order': 'published_at.desc,id.desc', 'limit': '1' if identifier else '100'}
    if identifier:
        params['id'] = 'eq.' + identifier
    records = _gateway(token, 'content_items', params=params)
    if not isinstance(records, list) or len(records) > int(params['limit']):
        raise RetentionFailure()
    # Do not cache arbitrary fields, IDs or unpublished rows on a malformed reply.
    clean = []
    for row in records:
        try:
            published = datetime.fromisoformat(row['published_at'].replace('Z', '+00:00'))
            if (row['content_type'] != kind or row['level'] != 'member' or published.tzinfo is None
                    or published > datetime.now(timezone.utc) or (identifier and row['id'] != identifier)):
                raise ValueError()
            safe = {key: row.get(key) for key in FIELDS.split(',')}
            safe['estimated_read_time'] = f"{max(1, round(len((safe['full_body'] or '').split()) / 225))} min"
            clean.append(safe)
        except (TypeError, KeyError, ValueError, AttributeError):
            raise RetentionFailure() from None
    # Recheck after the read: access can expire/change during the network call.
    decision = _access(token)
    if identifier and not clean:
        raise RetentionFailure(404, 'content_not_found')
    return jsonify(success=True, access=decision,
                   **({'playbook': clean[0]} if identifier else
                      {'playbooks' if kind == 'playbook' else 'briefings': clean}))


@retention_bp.get('/api/vault/playbooks')
def playbooks():
    return _read('playbook')


@retention_bp.get('/api/vault/playbooks/<identifier>')
def playbook(identifier):
    return _read('playbook', identifier)


@retention_bp.get('/api/vault/briefings')
def briefings():
    return _read('premium_briefing')
