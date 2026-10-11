"""Read-only, bounded reporting. Never use legacy counters as delivery evidence."""
from collections import Counter
from datetime import datetime, timedelta, timezone
import hashlib

PAGE_SIZE = 500
MAX_ROWS = 20000
CONSENT_VERSION = 'free-education-2026-10-06'


def _rows(db, table, columns, order='id', since=None, until=None, time_column=None):
    rows = []
    for offset in range(0, MAX_ROWS + 1, PAGE_SIZE):
        query = db.table(table).select(columns).order(order)
        if since:
            query = query.gte(time_column, since)
        if until:
            query = query.lt(time_column, until)
        batch = query.range(offset, offset + PAGE_SIZE - 1).execute().data
        if not isinstance(batch, list):
            raise ValueError('Incomplete response')
        rows.extend(batch)
        if len(rows) > MAX_ROWS:
            raise ValueError('Reporting limit exceeded')
        if len(batch) < PAGE_SIZE:
            return rows
    raise ValueError('Reporting limit exceeded')


def _test_source(value):
    return (value or '').startswith('ses-simulator:') or 'operator-test-not-human-consent' in (value or '')


def _synthetic(contact):
    return _test_source(contact.get('source')) or (contact.get('email') or '').strip().lower().endswith('@simulator.amazonses.com')


def _time(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace('Z', '+00:00')).astimezone(timezone.utc)


def _in_window(value, start, end):
    date = _time(value)
    return date is not None and start <= date < end


def build_report(db, days=30, now=None):
    now = now or datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    report = {
        'generated_at': now.isoformat(), 'window_start': start.isoformat(),
        'window_end': now.isoformat(), 'days': days,
        'delivery': {'status': 'unavailable'}, 'list': {'status': 'unavailable'},
        'classification': {'status': 'unavailable'},
        'engagement': {'status': 'unavailable', 'reason': 'Open and click tracking is not verified. No rates can be calculated.'},
        'notes': [
            'Delivery metrics cover SES messages accepted in this window, with feedback recorded by report time. They are not inbox-placement or AWS reputation metrics.',
            'Unique means one recipient-message, not one person across all emails. Retries and repeated feedback do not increase outcome counts.',
            'Simulator addresses and simulator-source contacts are excluded. Older sends without reliable attempt records are outside this report.',
            'Feedback timestamps reflect database recording time, not necessarily the original provider event time. No feedback does not prove ingestion is healthy.',
        ],
    }
    try:
        # Authoritative historical exclusions, including expired/disabled runs.
        # Owner-only in the current rollout: permission failure MUST withhold KPIs.
        simulator_admissions = _rows(db, 'email_simulator_admissions', 'enrollment_id,contact_id,run_id', order='enrollment_id')
        test_contacts = {row['contact_id'] for row in simulator_admissions}
        test_enrollments = {row['enrollment_id'] for row in simulator_admissions}
        consents = _rows(db, 'email_optin_consents', 'contact_id,version,source,captured_at', order='contact_id,version')
        test_contacts.update(c['contact_id'] for c in consents if _test_source(c['source']))
        contacts = _rows(db, 'email_contacts', 'id,email,source,status,unsubscribed_at')
        humans = {c['id']: c for c in contacts if c['id'] not in test_contacts and not _synthetic(c)}
        report['classification'] = {'status': 'available'}
    except Exception:
        return report  # Without this boundary we cannot safely exclude synthetic data.

    quarantined_contacts = None
    try:
        enrollments = _rows(db, 'email_enrollments', 'id,contact_id,sequence_id')
        enrollments = {e['id']: e for e in enrollments if e['contact_id'] in humans and e['id'] not in test_enrollments}
        # All attempts are needed for current operational states; the cohort is filtered below.
        attempts = _rows(db, 'email_delivery_attempts', 'id,enrollment_id,step_index,provider,state,provider_message_id,accepted_at,created_at')
        attempts = [a for a in attempts if a['enrollment_id'] in enrollments and a['provider'] == 'ses']
        quarantined_contacts = {enrollments[a['enrollment_id']]['contact_id'] for a in attempts if a['state'] == 'uncertain'}
        events = _rows(db, 'email_provider_events', 'provider,event_key,recipient,event_type,message_id,occurred_at',
                       order='provider,event_key,recipient', until=now.isoformat(), time_column='occurred_at')
        cohort = {}
        for a in attempts:
            if a['state'] == 'accepted' and a.get('provider_message_id') and _in_window(a.get('accepted_at'), start, now):
                c = humans[enrollments[a['enrollment_id']]['contact_id']]
                key = (a['provider'], a['provider_message_id'], c['email'].strip().lower())
                cohort.setdefault(key, a)
        outcomes = {kind: set() for kind in ('send', 'delivery', 'bounced', 'transient_bounce', 'complained', 'reject')}
        latest = None
        for event in events:
            key = (event['provider'], event.get('message_id'), event['recipient'].strip().lower())
            if key not in cohort:
                continue
            timestamp = event.get('occurred_at')
            if timestamp and (latest is None or _time(timestamp) > _time(latest)):
                latest = timestamp
            if event['event_type'] in outcomes:
                outcomes[event['event_type']].add(key)
        counts = {'accepted': len(cohort), **{kind: len(keys) for kind, keys in outcomes.items()}}
        daily = []
        for i in range(days + 1):
            day = (start + timedelta(days=i)).date().isoformat()
            keys = {key for key, a in cohort.items() if _time(a['accepted_at']).date().isoformat() == day}
            daily.append({'day': day, 'accepted': len(keys), 'delivered': len(keys & outcomes['delivery'])})
        by_message = {}
        for key, a in cohort.items():
            sequence = enrollments[a['enrollment_id']]['sequence_id']
            # Only known sequence identifiers leave the server; never arbitrary user text.
            from email_crm.sequences import SEQUENCES
            sequence = sequence if sequence in SEQUENCES else 'other'
            group = (sequence, a['step_index'])
            row = by_message.setdefault(group, {'sequence': sequence, 'step': a['step_index'] + 1, 'accepted': 0, 'delivered': 0, 'hard_bounces': 0, 'complaints': 0})
            row['accepted'] += 1
            for field, kind in [('delivered', 'delivery'), ('hard_bounces', 'bounced'), ('complaints', 'complained')]:
                row[field] += int(key in outcomes[kind])
        states = Counter(a['state'] for a in attempts)
        report['delivery'] = {'status': 'available', 'counts': counts, 'last_feedback_recorded_at': latest,
                              'daily': daily, 'messages': sorted(by_message.values(), key=lambda x: (x['sequence'], x['step'])),
                              'operations': {state: states[state] for state in ('uncertain', 'retryable', 'blocked', 'sending', 'claimed')}}
    except Exception:
        pass  # Do not return a partial report or leak database errors/recipient data.

    try:
        admissions = _rows(db, 'email_launch_admissions', 'contact_id,disposition,recorded_at', order='contact_id')
        manifest = _rows(db, 'email_legacy_manifest', 'id,ready,expected_count')
        exclusions = _rows(db, 'email_legacy_exclusions', 'email_sha256', order='email_sha256')
        hashes = {r['email_sha256'] for r in exclusions}
        consented = {c['contact_id'] for c in consents if c['version'] == CONSENT_VERSION and not _test_source(c['source'])}
        admitted = {a['contact_id'] for a in admissions if a['disposition'] == 'new_optin'}
        eligible = {cid for cid, c in humans.items() if c['status'] == 'active' and cid in consented & admitted and cid not in (quarantined_contacts or set())
                    and hashlib.sha256(c['email'].strip().lower().encode()).hexdigest() not in hashes}
        ready = bool(manifest and manifest[0]['ready'] and len(hashes) == manifest[0]['expected_count'])
        suppressed = {cid for cid, c in humans.items() if c['status'] in ('unsubscribed', 'bounced', 'complained')}
        review = {a['contact_id'] for a in admissions if a['contact_id'] in humans and a['disposition'] in ('legacy_review', 'existing_review')}
        report['list'] = {
            'status': 'available', 'total': len(humans), 'eligible': len(eligible) if ready and quarantined_contacts is not None else None,
            'suppressed': len(suppressed), 'review': len(review),
            'unsubscribed_in_window': sum(c['status'] == 'unsubscribed' and _in_window(c.get('unsubscribed_at'), start, now) for c in humans.values()),
            'legacy_exclusion_addresses': len(hashes), 'manifest_ready': ready,
            'growth': None,
        }
    except Exception:
        pass
    return report
