"""Versioned, optional opt-in for the free education sequence."""
CONSENT_VERSION = 'free-education-2026-10-06'
CONSENT_TEXT = ('Yes, email me Revenue Ripple’s free learning sequence: 9 introductory emails over 14 days, '
                'then 26 digital marketing lessons every two weeks. I can unsubscribe at any time.')


def consent_from_payload(data):
    value = data.get('email_consent', False)
    if not isinstance(value, bool):
        raise ValueError('Email consent must be a boolean')
    if value and data.get('email_consent_version') != CONSENT_VERSION:
        raise ValueError('Please refresh the page to review the current email subscription')
    return {'accepted': value, 'version': CONSENT_VERSION}
