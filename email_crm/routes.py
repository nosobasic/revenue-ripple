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
    contact = suppress_contact(_supabase(), token=token, email=email, reason="unsubscribed")
    if not contact:
        return jsonify({"success": True, "message": "If that address is on the list, it has been unsubscribed."})
    return jsonify({"success": True, "email": contact["email"]})


@email_bp.route("/api/email/ses-events", methods=["POST"])
def ses_events():
    """SNS subscription confirmation + SES bounce/complaint notifications."""
    import json

    from email_crm.enroll import suppress_contact

    payload = request.get_json(silent=True)
    if not payload:
        try:
            payload = json.loads(request.data.decode("utf-8") or "{}")
        except Exception:
            return jsonify({"error": "invalid json"}), 400

    # SNS subscription handshake
    if payload.get("Type") == "SubscriptionConfirmation" and payload.get("SubscribeURL"):
        import requests

        try:
            requests.get(payload["SubscribeURL"], timeout=10)
        except Exception as exc:
            print(f"⚠️ SNS confirm failed: {exc}")
        return jsonify({"ok": True, "confirmed": True})

    message = payload.get("Message")
    if isinstance(message, str):
        try:
            message = json.loads(message)
        except Exception:
            message = {}
    notification = message or payload
    notif_type = (notification.get("notificationType") or notification.get("eventType") or "").lower()
    mail = notification.get("mail") or {}
    dest = ""
    destinations = mail.get("destination") or []
    if destinations:
        dest = destinations[0]
    bounce = notification.get("bounce") or {}
    complaint = notification.get("complaint") or {}
    if not dest:
        bounced = (bounce.get("bouncedRecipients") or [{}])
        dest = (bounced[0] or {}).get("emailAddress") or ""
    if not dest:
        complained = complaint.get("complainedRecipients") or [{}]
        dest = (complained[0] or {}).get("emailAddress") or ""

    reason = None
    if "complaint" in notif_type:
        reason = "complained"
    elif "bounce" in notif_type:
        bounce_type = (bounce.get("bounceType") or "").lower()
        if bounce_type == "transient":
            return jsonify({"ok": True, "ignored": "transient"})
        reason = "bounced"
    if reason and dest:
        suppress_contact(_supabase(), email=dest, reason=reason)
        _log_event(dest, reason, notification)
    return jsonify({"ok": True})


def _log_event(email, event_type, payload):
    sb = _supabase()
    if not sb:
        return
    try:
        contact = sb.table("email_contacts").select("id").eq("email", email.strip().lower()).limit(1).execute()
        contact_id = contact.data[0]["id"] if contact.data else None
        sb.table("email_events").insert(
            {
                "contact_id": contact_id,
                "event_type": event_type,
                "payload": payload,
            }
        ).execute()
    except Exception as exc:
        print(f"⚠️ Failed to log email event: {exc}")


@email_bp.route("/api/admin/email/enrollments", methods=["GET"])
def admin_enrollments():
    sb = _supabase()
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
