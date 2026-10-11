"""User-scoped aggregate RPC. Never mutate the shared service-role client."""
from datetime import datetime
import os
from urllib.parse import urlsplit
import requests
from email_crm.reporting import unavailable_report


class ReportingAccessDenied(Exception):
    pass


def _count(value, nullable=False):
    if nullable and value is None:
        return None
    if type(value) is not int or not 0 <= value <= 9007199254740991:
        raise ValueError('Invalid aggregate')
    return value


def _timestamp(value, nullable=False):
    if nullable and value is None:
        return None
    if not isinstance(value, str) or len(value) > 40:
        raise ValueError('Invalid timestamp')
    timestamp = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if timestamp.tzinfo is None:
        raise ValueError('Timestamp requires timezone')
    return timestamp.isoformat()


def sanitize_snapshot(raw, days):
    """Build a new allowlisted response. Never relay arbitrary DB fields/strings."""
    if raw.get('contract_version') != 1 or raw.get('days') != days or raw['classification']['status'] != 'available':
        raise ValueError('Reporting contract mismatch')
    result = unavailable_report(days)  # Static unavailable envelope, no source fallback.
    result.update({key: _timestamp(raw[key]) for key in ('generated_at', 'window_start', 'window_end')})
    result['classification'] = {'status': 'available'}
    delivery, health = raw['delivery'], raw['list']
    if delivery['status'] != 'available' or health['status'] != 'available':
        raise ValueError('Incomplete aggregate snapshot')
    counts = {key: _count(delivery['counts'][key]) for key in ('accepted','send','delivery','bounced','transient_bounce','complained','reject')}
    if any(value > counts['accepted'] for key, value in counts.items() if key != 'accepted'):
        raise ValueError('Outcome outside accepted cohort')
    if len(delivery['daily']) > days + 1 or len(delivery['messages']) > 707:
        raise ValueError('Unbounded aggregate groups')
    daily = []
    for row in delivery['daily']:
        day = datetime.strptime(row['day'], '%Y-%m-%d').date().isoformat()
        daily.append({'day': day, **{key: _count(row[key]) for key in ('accepted','delivered')}})
    messages = []
    allowed = {'indoctrination','dmd_course_26','founders_annual','tripwire_buyer','paid_buyer','list_restart','other'}
    for row in delivery['messages']:
        if row['sequence'] not in allowed or type(row['step']) is not int or not 0 <= row['step'] <= 100:
            raise ValueError('Unknown message group')
        messages.append({'sequence': row['sequence'], 'step': row['step'],
                         **{key: _count(row[key]) for key in ('accepted','delivered','hard_bounces','complaints')}})
    result['delivery'] = {'status':'available', 'counts':counts, 'daily':daily, 'messages':messages,
                          'last_feedback_recorded_at':_timestamp(delivery['last_feedback_recorded_at'], nullable=True),
                          'operations':{key:_count(delivery['operations'][key]) for key in ('uncertain','retryable','blocked','sending','claimed')}}
    if type(health['manifest_ready']) is not bool:
        raise ValueError('Invalid readiness')
    result['list'] = {'status':'available', 'growth':None, 'manifest_ready':health['manifest_ready'],
                     'eligible':_count(health['eligible'], nullable=True),
                     **{key:_count(health[key]) for key in ('total','suppressed','review','unsubscribed_in_window','legacy_exclusion_addresses')}}
    result['notes'].append('One database statement supplies the aggregate snapshot. Daily groups use UTC; message 0 groups out-of-range steps.')
    return result


def read_snapshot(user_token, days):
    unavailable = unavailable_report(days)
    url = (os.getenv('SUPABASE_URL') or '').rstrip('/')
    # Existing server credential is only the gateway API key. Authorization is
    # ALWAYS the already-verified user's JWT, never this service credential.
    api_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY')
    if not api_key or urlsplit(url).scheme != 'https' or not user_token:
        return unavailable
    try:
        response = requests.post(url + '/rest/v1/rpc/email_reporting_snapshot',
            headers={'apikey':api_key, 'Authorization':'Bearer '+user_token, 'Content-Type':'application/json'},
            json={'p_days':days}, timeout=12, allow_redirects=False)
        if response.status_code in (401,403):
            raise ReportingAccessDenied()
        response.raise_for_status()
        return sanitize_snapshot(response.json(), days)
    except ReportingAccessDenied:
        raise
    except Exception:
        # Missing/unapproved RPC, malformed response and timeout all fail closed.
        return unavailable
