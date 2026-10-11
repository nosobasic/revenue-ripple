"""Aggregate-only admin route; uses existing trusted server authorization."""
from flask import Blueprint, abort, jsonify, request
from middleware.verified_identity import require_admin
from email_crm.reporting_rpc import read_snapshot, ReportingAccessDenied

email_reporting_bp = Blueprint('email_reporting', __name__)


@email_reporting_bp.route('/api/admin/email/reporting', methods=['GET'])
def email_report():
    require_admin()
    days = request.args.get('days', '30')
    if days not in ('7', '30', '90'):
        return jsonify({'error': 'Choose a 7, 30, or 90 day window.'}), 400
    try:
        response = jsonify(read_snapshot(request.headers['Authorization'].split()[1], int(days)))
    except ReportingAccessDenied:
        abort(403, description='Administrator access required')
    response.headers['Cache-Control'] = 'no-store'
    return response
