"""Additive attribution; never creates content or replaces nurture delivery."""
import logging
import os
from uuid import UUID

logger = logging.getLogger(__name__)


def enabled():
    return os.getenv('ACQUISITION_ATTRIBUTION_ENABLED', '').lower() == 'true'


def touch_id(value):
    try:
        return str(UUID(str(value))) if value else None
    except (ValueError, TypeError, AttributeError):
        return None


def record_lead(db, email, funnel, payload):
    if not enabled() or not db:
        return
    attribution = payload.get('acquisition') if isinstance(payload, dict) else None
    if not isinstance(attribution, dict):
        return
    first = touch_id(attribution.get('first_touch_id'))
    last = touch_id(attribution.get('last_touch_id'))
    if not first and not last:
        return
    try:
        db.rpc('acquisition_record_lead', {
            'p_email': email.strip().lower(), 'p_funnel': funnel,
            'p_first': first, 'p_last': last,
        }).execute()
    except Exception:
        # The existing funnel/nurture path must continue. Alert on this event.
        logger.exception('acquisition.lead_attribution_failed')


def checkout_metadata(payload):
    attribution = payload.get('acquisition') if isinstance(payload, dict) else None
    if not isinstance(attribution, dict):
        return {}
    return {key: value for key, value in {
        'rr_first_touch': touch_id(attribution.get('first_touch_id')),
        'rr_last_touch': touch_id(attribution.get('last_touch_id')),
    }.items() if value}


def record_checkout(db, event):
    """Called only after Stripe signature verification. Errors allow webhook retry."""
    if not enabled():
        return
    if event.get('type') not in ('checkout.session.completed', 'checkout.session.async_payment_succeeded'):
        return
    session = event['data']['object']
    if session.get('payment_status') != 'paid' or not session.get('amount_total', 0) > 0:
        return
    email = (session.get('customer_details') or {}).get('email') or session.get('customer_email')
    if not email:
        return
    if not db:
        raise RuntimeError('Acquisition attribution database unavailable')
    metadata = session.get('metadata') or {}
    first = touch_id(metadata.get('rr_first_touch'))
    last = touch_id(metadata.get('rr_last_touch'))
    if first or last:
        # Capture a new final touch, including purchases without a prior lead form.
        # Unlike best-effort lead form hooks, database errors here must trigger retry.
        db.rpc('acquisition_record_lead', {
            'p_email': email.strip().lower(), 'p_funnel': 'checkout',
            'p_first': first, 'p_last': last,
        }).execute()
    # The checkout session ID deduplicates completed + async success events.
    db.rpc('acquisition_record_conversion', {
        'p_event': 'stripe:checkout:' + session['id'],
        'p_email': email.strip().lower(),
        'p_amount': session['amount_total'], 'p_currency': session['currency'].lower(),
    }).execute()
