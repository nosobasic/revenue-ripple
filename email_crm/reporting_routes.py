"""Aggregate-only admin route; uses existing trusted server authorization."""
from flask import Blueprint, current_app, jsonify, request
from middleware.verified_identity import require_admin
from email_crm.reporting import build_report

email_reporting_bp = Blueprint('email_reporting', __name__)


@email_reporting_bp.route('/api/admin/email/reporting', methods=['GET'])
def email_report():
    require_admin()
    days = request.args.get('days', '30')
    if days not in ('7', '30', '90'):
        return jsonify({'error': 'Choose a 7, 30, or 90 day window.'}), 400
    db = getattr(current_app, 'supabase', None)
    if db is None:
        from middleware.supabase_admin import get_supabase_admin
        db = get_supabase_admin()
    response = jsonify(build_report(db, int(days)))
    response.headers['Cache-Control'] = 'no-store'
    return response
