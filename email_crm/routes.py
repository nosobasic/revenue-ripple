"""Flask routes: unsubscribe, SES SNS events, admin enrollments, one-click List-Unsubscribe."""

from flask import Blueprint, jsonify, request

email_bp = Blueprint("email_crm", __name__)


def _supabase():
    from flask import current_app

    return getattr(current_app, "supabase", None) or _import_supabase()


def _import_supabase():
    try:
        import server as root_server

        return getattr(root_server, "supabase", None)
    except Exception:
        return None


@email_bp.route("/api/email/unsubscribe", methods=["GET", "POST"])
def unsubscribe():
    from email_crm.enroll import suppress_contact

    token = request.values.get("token") or (request.get_json(silent=True) or {}).get("token")
    email = request.values.get("email") or (request.get_json(silent=True) or {}).get("email")
    if not token and not email:
        return jsonify({"error": "token or email is required"}), 400
    sb = _supabase()
    if not sb:
        return jsonify({"error": "Unsubscribe temporarily unavailable; please retry"}), 503
    contact = suppress_contact(sb, token=token, email=email, reason="unsubscribed")
    if not contact:
        return jsonify({"success": True, "message": "If that address is on the list, it has been unsubscribed."})
    return jsonify({"success": True, "email": contact["email"]})


@email_bp.route("/api/email/ses-events", methods=["POST"])
def ses_events():
    # SES events are handled by the authenticated SNS -> Lambda subscription.
    # Do not accept unsigned notifications or fetch caller-provided SubscribeURLs.
    return jsonify({"error": "Use the configured SNS Lambda subscription"}), 410


def _admin_database():
    from flask import abort

    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        abort(401)
    sb = _supabase()
    if not sb:
        abort(503)
    try:
        user = sb.auth.get_user(authorization[7:]).user
    except Exception:
        abort(401)
    if not user:
        abort(401)
    profiles = sb.table("users").select("role").eq("id", user.id).limit(1).execute()
    if not profiles.data or profiles.data[0].get("role") != "admin":
        abort(403)
    return sb


@email_bp.route("/api/admin/email/enrollments", methods=["GET"])
def admin_enrollments():
    sb = _admin_database()
    if not sb:
        return jsonify({"error": "database unavailable"}), 503
    status = request.args.get("status")
    source = request.args.get("source")
    query = (
        sb.table("email_enrollments")
        .select("id,sequence_id,step_index,status,next_send_at,last_sent_at,origin,getresponse_day_of_cycle,email_contacts(email,name,source,status,tags)")
        .order("next_send_at", desc=False)
        .limit(int(request.args.get("limit") or 200))
    )
    if status:
        query = query.eq("status", status)
    result = query.execute()
    rows = result.data or []
    if source:
        rows = [r for r in rows if ((r.get("email_contacts") or {}).get("source") == source)]
    return jsonify({"enrollments": rows, "count": len(rows)})


@email_bp.route("/api/admin/email/enrollments/<uuid:enrollment_id>/pause", methods=["POST"])
def pause_enrollment(enrollment_id):
    sb = _admin_database()
    rows = (sb.table("email_enrollments").update({"status": "paused"})
            .eq("id", str(enrollment_id)).eq("status", "active").execute())
    if not rows.data:
        return jsonify({"error": "Active enrollment not found"}), 409
    return jsonify({"success": True})
