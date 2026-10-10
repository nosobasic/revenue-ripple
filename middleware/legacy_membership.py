"""Legacy paid-checkout profile updates, separate from the unlaunched quota model.

Callers must authenticate Stripe events before using these helpers. A dictionary
passing the semantic checks below is NOT evidence of a valid Stripe signature.
"""
PAID_ROLES = {
    'founders_annual_subscription': 'member',
    'membership_subscription': 'member',
    'quarterly_growth_subscription': 'member',
    'reseller_subscription': 'reseller',
    'reseller_trial_subscription': 'reseller',
    'pro_reseller_subscription': 'pro_reseller',
    'pro_reseller_trial_subscription': 'pro_reseller',
}


def require_paid_checkout(event, email, role):
    session = (event or {}).get('data', {}).get('object', {})
    if (role not in PAID_ROLES.values() or not event or event.get('type') != 'checkout.session.completed'
            or session.get('payment_status') != 'paid'
            or PAID_ROLES.get(session.get('metadata', {}).get('product')) != role
            or not email or session.get('customer_details', {}).get('email') != email):
        raise ValueError('Verified paid checkout context required')


def legacy_profile_update(current, purchased_role):
    """Preserve administration and lifetime plans; retain paid program changes.

    Lifetime is a plan, not a commission-program role. A lifetime member can
    legitimately buy reseller/pro-reseller while keeping lifetime learning.
    Admin profiles (including their payment-status sentinel) are left intact.
    """
    if purchased_role not in set(PAID_ROLES.values()):
        raise ValueError('Unsupported legacy purchased role')
    if current.get('role') == 'admin':
        return {}
    proposed = {
        'role': purchased_role,
        'plan': 'lifetime' if current.get('plan') == 'lifetime' else purchased_role,
        'has_paid': True,
        'payment_status': 'completed',
    }
    # Duplicate delivery must not issue another profile write.
    return {key: value for key, value in proposed.items() if current.get(key) != value}


def preserve_legacy_identity(current, proposed):
    """Apply founder benefits without erasing administration/lifetime identity."""
    result = dict(proposed)
    if current.get('role') == 'admin':
        result['role'] = current['role']
        result['plan'] = current.get('plan')
    elif current.get('plan') == 'lifetime':
        result['plan'] = 'lifetime'
    return result
