"""Owner-only preparation status. No scan, billing, or provider execution."""
import os
from flask import Blueprint, abort, jsonify
from middleware.verified_identity import verified_identity

owner_pilot = Blueprint('owner_pilot', __name__)


@owner_pilot.get('/api/visibility-pilot/release')
def release():
    response = jsonify(release='visibility-owner-preparation-v1', commit=os.getenv('RENDER_GIT_COMMIT'), scans_enabled=False)
    response.headers['Cache-Control'] = 'no-store'
    return response


@owner_pilot.get('/api/visibility-pilot/status')
def status():
    user = verified_identity()
    if (getattr(user, 'email', '') or '').lower() != 'wdonte97@gmail.com' or not getattr(user, 'email_confirmed_at', None):
        abort(403, description='This preparation pilot is restricted to the verified owner account.')
    response = jsonify(status='preparing', scans_enabled=False, purchases_enabled=False,
                       message='Your owner pilot is in preparation. Live scans are unavailable while infrastructure and secure credentials are completed. No scan credit has been used.')
    response.headers['Cache-Control'] = 'private, no-store'
    return response
