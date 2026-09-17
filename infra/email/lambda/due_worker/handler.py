"""EventBridge-triggered due worker: send due drip emails via SES, then advance enrollments."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import boto3

SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or ""
FROM_ADDR = os.environ.get("SES_FROM") or "Donte from RR <hello@revenueripple.org>"
CONFIG_SET = os.environ.get("SES_CONFIGURATION_SET") or ""
APP_BASE = (os.environ.get("APP_BASE_URL") or "https://revenueripple.org").rstrip("/")
REGION = os.environ.get("AWS_DEFAULT_REGION") or "us-east-1"
DAILY_CAP = int(os.environ.get("EMAIL_DAILY_SEND_CAP") or "200")
SEND_ENABLED = (os.environ.get("EMAIL_SEND_ENABLED") or "").lower() in {"1", "true", "yes"}
TEMPLATE_BUCKET = os.environ.get("EMAIL_TEMPLATE_BUCKET") or ""
PHYSICAL = os.environ.get("EMAIL_PHYSICAL_ADDRESS") or "Revenue Ripple, support@revenueripple.org"


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
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else []
    except urllib.error.HTTPError as exc:
        print(f"Supabase {method} {path} failed: {exc.read().decode('utf-8')[:400]}")
        raise


def _today():
    return datetime.now(timezone.utc).date().isoformat()


def _cap_remaining() -> int:
    rows = _sb("GET", "email_send_counters", f"send_date=eq.{_today()}")
    used = (rows[0]["sent_count"] if rows else 0)
    return max(0, DAILY_CAP - used)


def _increment_cap(n: int):
    rows = _sb("GET", "email_send_counters", f"send_date=eq.{_today()}")
    if rows:
        _sb(
            "PATCH",
            "email_send_counters",
            f"send_date=eq.{_today()}",
            {"sent_count": rows[0]["sent_count"] + n},
        )
    else:
        _sb("POST", "email_send_counters", body={"send_date": _today(), "sent_count": n})


def _load_template(template_key: str) -> str:
    if not TEMPLATE_BUCKET or not template_key:
        return ""
    s3 = boto3.client("s3", region_name=REGION)
    try:
        obj = s3.get_object(Bucket=TEMPLATE_BUCKET, Key=f"email-templates/{template_key}")
        return obj["Body"].read().decode("utf-8")
    except Exception as exc:
        print(f"template miss {template_key}: {exc}")
        return ""


def _render(html: str, contact: dict, extra: dict) -> str:
    token = contact.get("unsubscribe_token") or ""
    unsub = f"{APP_BASE}/unsubscribe?token={token}"
    values = {
        "first_name": (contact.get("name") or "there").split()[0],
        "name": contact.get("name") or "",
        "email": contact.get("email") or "",
        "unsubscribe_url": unsub,
        "physical_address": PHYSICAL,
        "app_base_url": APP_BASE,
        **extra,
    }
    for key, val in values.items():
        html = html.replace("{{" + key + "}}", str(val))
    if "<html" not in html.lower():
        html = (
            "<html><body style='font-family:Arial,sans-serif;line-height:1.5'>"
            f"{html}<hr><p style='font-size:12px;color:#666'>"
            f"<a href='{unsub}'>Unsubscribe</a><br>{PHYSICAL}</p></body></html>"
        )
    return html


def _send(to_email: str, subject: str, html: str, unsub: str) -> str:
    ses = boto3.client("ses", region_name=REGION)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_ADDR
    msg["To"] = to_email
    msg["List-Unsubscribe"] = f"<{unsub}>"
    msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
    msg.attach(MIMEText(html, "html", "utf-8"))
    kwargs = {"Source": FROM_ADDR, "Destinations": [to_email], "RawMessage": {"Data": msg.as_bytes()}}
    if CONFIG_SET:
        kwargs["ConfigurationSetName"] = CONFIG_SET
    resp = ses.send_raw_email(**kwargs)
    return resp.get("MessageId")


def _advance(enrollment: dict, sequence: dict):
    steps = sequence.get("steps") or []
    nxt = enrollment["step_index"] + 1
    now = datetime.now(timezone.utc).isoformat()
    if nxt < len(steps):
        current = steps[enrollment["step_index"]]
        nxt_step = steps[nxt]
        if nxt_step.get("delay_seconds") is not None or current.get("delay_seconds") is not None:
            delta = int(nxt_step.get("delay_seconds") or 0) - int(current.get("delay_seconds") or 0)
            next_at = (datetime.now(timezone.utc) + timedelta(seconds=max(delta, 0))).isoformat()
        else:
            delay = int(nxt_step.get("day_offset", 0)) - int(current.get("day_offset") or 0)
            if delay <= 0:
                delay = 14 if sequence.get("id") == "dmd_course_26" else 1
            next_at = (datetime.now(timezone.utc) + timedelta(days=delay)).isoformat()
        _sb(
            "PATCH",
            "email_enrollments",
            f"id=eq.{enrollment['id']}",
            {"step_index": nxt, "next_send_at": next_at, "last_sent_at": now},
        )
        return
    _sb(
        "PATCH",
        "email_enrollments",
        f"id=eq.{enrollment['id']}",
        {"status": "completed", "next_send_at": None, "last_sent_at": now, "completed_at": now},
    )
    nxt_seq = sequence.get("next_sequence")
    if nxt_seq:
        delay = int(sequence.get("next_delay_days") or 14)

        _sb(
            "POST",
            "email_enrollments",
            body={
                "contact_id": enrollment["contact_id"],
                "sequence_id": nxt_seq,
                "step_index": 0,
                "status": "active",
                "origin": "handoff",
                "next_send_at": (datetime.now(timezone.utc) + timedelta(days=delay)).isoformat(),
            },
        )


def handler(event, context):
    if not SEND_ENABLED:
        print("EMAIL_SEND_ENABLED is not true — skipping sends (shadow/inventory mode)")
        return {"skipped": True}
    remaining = _cap_remaining()
    if remaining <= 0:
        print("Daily SES warm-up cap reached")
        return {"capped": True}

    now = datetime.now(timezone.utc).isoformat()
    query = (
        "select=id,contact_id,sequence_id,step_index,status,next_send_at,email_contacts(*)"
        "&status=eq.active"
        f"&next_send_at=lte.{urllib.parse.quote(now)}"
        "&order=next_send_at.asc"
        f"&limit={remaining}"
    )
    due = _sb("GET", "email_enrollments", query)
    sent = 0
    errors = 0
    for enrollment in due:
        contact = enrollment.get("email_contacts") or {}
        if contact.get("status") not in (None, "active"):
            continue
        seqs = _sb("GET", "email_sequences", f"id=eq.{enrollment['sequence_id']}")
        if not seqs:
            continue
        sequence = seqs[0]
        steps = sequence.get("steps") or []
        if enrollment["step_index"] >= len(steps):
            _advance(enrollment, sequence)
            continue
        step = steps[enrollment["step_index"]]
        html = _load_template(step.get("template_key") or "")
        if not html:
            html = f"<p>Hi {{{{first_name}}}},</p><p>{step.get('subject') or ''}</p><p>— Donte</p>"
        extra = {}
        if step.get("title"):
            extra["lesson_title"] = step["title"]
            extra["lesson_number"] = str(step["index"] + 1)
        unsub = f"{APP_BASE}/unsubscribe?token={contact.get('unsubscribe_token') or ''}"
        html = _render(html, contact, extra)
        try:
            _send(contact["email"], step.get("subject") or "Revenue Ripple", html, unsub)
            _sb(
                "POST",
                "email_events",
                body={
                    "contact_id": contact.get("id"),
                    "enrollment_id": enrollment["id"],
                    "event_type": "sent",
                    "payload": {"sequence_id": sequence["id"], "step_index": enrollment["step_index"]},
                },
            )
            _advance(enrollment, sequence)
            sent += 1
        except Exception as exc:
            errors += 1
            print(f"send failed {contact.get('email')}: {exc}")
    if sent:
        _increment_cap(sent)
    return {"sent": sent, "errors": errors, "due": len(due)}
