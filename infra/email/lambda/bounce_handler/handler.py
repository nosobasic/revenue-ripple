"""SES event destination / SNS bounce + complaint handler."""

from __future__ import annotations

import json
import os
import urllib.request

SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or ""


def _sb(method: str, path: str, query: str = "", body=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    if query:
        url += "?" + query
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else []


def _suppress(email: str, reason: str):
    email = (email or "").strip().lower()
    if not email:
        return
    status = {"complained": "complained", "bounced": "bounced"}.get(reason, "unsubscribed")
    contacts = _sb("GET", "email_contacts", f"email=eq.{email}")
    if not contacts:
        return
    contact = contacts[0]
    _sb(
        "PATCH",
        "email_contacts",
        f"id=eq.{contact['id']}",
        {"status": status, "unsubscribed_at": "now()", "suppression_reason": reason},
    )
    _sb(
        "PATCH",
        "email_enrollments",
        f"contact_id=eq.{contact['id']}&status=in.(active,paused)",
        {"status": "suppressed", "next_send_at": None},
    )
    _sb(
        "POST",
        "email_events",
        body={"contact_id": contact["id"], "event_type": reason, "payload": {"email": email}},
    )


def handler(event, context):
    for record in event.get("Records") or [event]:
        body = record.get("Sns", {}).get("Message") or record.get("body") or record
        if isinstance(body, str):
            try:
                body = json.loads(body)
            except Exception:
                continue
        if body.get("Type") == "SubscriptionConfirmation" and body.get("SubscribeURL"):
            urllib.request.urlopen(body["SubscribeURL"], timeout=10)
            continue
        message = body.get("Message", body)
        if isinstance(message, str):
            try:
                message = json.loads(message)
            except Exception:
                message = body
        ntype = (message.get("notificationType") or message.get("eventType") or "").lower()
        bounce = message.get("bounce") or {}
        complaint = message.get("complaint") or {}
        dest = ""
        dests = (message.get("mail") or {}).get("destination") or []
        if dests:
            dest = dests[0]
        if not dest:
            recs = bounce.get("bouncedRecipients") or complaint.get("complainedRecipients") or [{}]
            dest = (recs[0] or {}).get("emailAddress") or ""
        if "complaint" in ntype:
            _suppress(dest, "complained")
        elif "bounce" in ntype and (bounce.get("bounceType") or "").lower() != "transient":
            _suppress(dest, "bounced")
    return {"ok": True}
