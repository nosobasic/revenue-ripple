"""Capture explicit free-sequence opt-ins; never send or infer legacy consent."""
from email_crm.consent import CONSENT_VERSION
from email_crm.source import normalize_funnel


def deliver_lead(*, supabase, email, name, funnel, phone='', tags=None,
                 send_getresponse=None, consent=None):
    # Legacy callbacks are intentionally unused. Old clients can still receive
    # their on-page resource, but cannot silently subscribe to ongoing emails.
    if not consent or consent.get('accepted') is not True:
        return {'getresponse': False, 'aws': False, 'subscription': 'not_requested'}
    if consent.get('version') != CONSENT_VERSION:
        raise ValueError('Unsupported email consent version')
    if not supabase:
        raise RuntimeError('Email subscription temporarily unavailable')
    result = supabase.rpc('email_capture_optin', {
        'p_email': email.strip().lower(), 'p_name': name,
        'p_source': normalize_funnel(funnel), 'p_version': CONSENT_VERSION,
        'p_accepted': True,
    }).execute().data
    if not result or result.get('status') != 'recorded':
        raise RuntimeError('Email subscription was not recorded')
    return {'getresponse': False, 'aws': False, 'subscription': 'recorded'}


def deliver_paid(**kwargs):
    # A purchase is not consent to this free marketing sequence. Existing paid
    # fulfillment is outside this release and must not invoke a legacy ESP.
    return {'getresponse': False, 'aws': False, 'subscription': 'not_requested'}
