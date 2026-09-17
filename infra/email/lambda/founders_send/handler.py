"""SQS-triggered Founders worker: send one step, then DelaySeconds or due-worker handoff."""

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
SEND_ENABLED = (os.environ.get("EMAIL_SEND_ENABLED") or "").lower() in {"1", "true", "yes"}
TEMPLATE_BUCKET = os.environ.get("EMAIL_TEMPLATE_BUCKET") or ""
PHYSICAL = os.environ.get("EMAIL_PHYSICAL_ADDRESS") or "Revenue Ripple, support@revenueripple.org"
QUEUE_URL = os.environ.get("EMAIL_FOUNDERS_QUEUE_URL") or ""
SQS_MAX_DELAY = 900


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


def _delay_to_next(steps, current_index):
    if current_index + 1 >= len(steps):
        return None
    current = int(steps[current_index].get("delay_seconds") or 0)
    nxt = int(steps[current_index + 1].get("delay_seconds") or 0)
    return max(0, nxt - current)


def _already_sent(enrollment_id: str, step_index: int) -> bool:
    rows = _sb(
        "GET",
        "email_events",
        "enrollment_id=eq."
        + urllib.parse.quote(str(enrollment_id))
        + "&event_type=eq.sent"
        + "&select=id,payload",
    )
    for row in rows or []:
        payload = row.get("payload") or {}
        if payload.get("step_index") == step_index and payload.get("sequence_id") == "founders_annual":
            return True
    return False


def _send_ses(to_email: str, subject: str, html: str, unsub: str) -> str:
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


def _enqueue_next(payload: dict, step_index: int, delay_seconds: int):
    if not QUEUE_URL:
        raise RuntimeError("EMAIL_FOUNDERS_QUEUE_URL is not set")
    sqs = boto3.client("sqs", region_name=REGION)
    next_payload = dict(payload)
    next_payload["step_index"] = step_index
    sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps(next_payload),
        DelaySeconds=min(int(delay_seconds), SQS_MAX_DELAY),
        MessageGroupId=str(payload["contact_id"]),
        MessageDeduplicationId=f"{payload['enrollment_id']}:{step_index}",
    )


def _schedule_after_send(payload: dict, enrollment: dict, steps: list, step_index: int):
    now = datetime.now(timezone.utc)
    delay = _delay_to_next(steps, step_index)
    if delay is None:
        _sb(
            "PATCH",
            "email_enrollments",
            f"id=eq.{enrollment['id']}",
            {
                "status": "completed",
                "next_send_at": None,
                "last_sent_at": now.isoformat(),
                "completed_at": now.isoformat(),
            },
        )
        return
    nxt = step_index + 1
    if delay <= SQS_MAX_DELAY:
        _sb(
            "PATCH",
            "email_enrollments",
            f"id=eq.{enrollment['id']}",
            {
                "step_index": nxt,
                "next_send_at": None,
                "last_sent_at": now.isoformat(),
            },
        )
        _enqueue_next(payload, nxt, delay)
        return
    next_at = now + timedelta(seconds=delay)
    _sb(
        "PATCH",
        "email_enrollments",
        f"id=eq.{enrollment['id']}",
        {
            "step_index": nxt,
            "status": "active",
            "next_send_at": next_at.isoformat(),
            "last_sent_at": now.isoformat(),
        },
    )


def _process(payload: dict):
    step_index = int(payload.get("step_index") or 0)
    email = (payload.get("email") or "").strip().lower()
    enrollment_id = payload.get("enrollment_id")
    if not SEND_ENABLED:
        print("EMAIL_SEND_ENABLED false — Founders SQS message acked without send")
        return

    contacts = _sb("GET", "email_contacts", f"id=eq.{urllib.parse.quote(str(payload.get('contact_id') or ''))}")
    if not contacts:
        contacts = _sb("GET", "email_contacts", f"email=eq.{urllib.parse.quote(email)}")
    if contacts and contacts[0].get("status") not in (None, "active"):
        print(f"contact suppressed: {email}")
        return
    contact = contacts[0] if contacts else {}

    seqs = _sb("GET", "email_sequences", "id=eq.founders_annual")
    steps = (seqs[0].get("steps") if seqs else None) or []
    if step_index >= len(steps):
        return
    step = steps[step_index]

    enrollments = _sb("GET", "email_enrollments", f"id=eq.{urllib.parse.quote(str(enrollment_id))}") if enrollment_id else []
    enrollment = enrollments[0] if enrollments else {"id": enrollment_id, "step_index": step_index}

    already = _already_sent(enrollment_id, step_index)
    if already and (
        (enrollment.get("step_index") or 0) > step_index or enrollment.get("status") == "completed"
    ):
        return
    if not already:
        html = f"<p>Hi {(payload.get('name') or contact.get('name') or 'there').split()[0]},</p><p>{step.get('subject')}</p><p>— Donte</p>"
        if TEMPLATE_BUCKET and step.get("template_key"):
            try:
                s3 = boto3.client("s3", region_name=REGION)
                obj = s3.get_object(Bucket=TEMPLATE_BUCKET, Key=f"email-templates/{step['template_key']}")
                html = obj["Body"].read().decode("utf-8")
            except Exception as exc:
                print(f"template miss: {exc}")
        token = payload.get("unsubscribe_token") or contact.get("unsubscribe_token") or ""
        unsub = f"{APP_BASE}/unsubscribe?token={token}"
        for key, val in {
            "first_name": (payload.get("name") or contact.get("name") or "there").split()[0],
            "unsubscribe_url": unsub,
            "physical_address": PHYSICAL,
            "app_base_url": APP_BASE,
        }.items():
            html = html.replace("{{" + key + "}}", val)
        if "<html" not in html.lower():
            html = f"<html><body>{html}<p style='font-size:12px'><a href='{unsub}'>Unsubscribe</a><br>{PHYSICAL}</p></body></html>"
        _send_ses(email, step.get("subject") or "Revenue Ripple", html, unsub)
        _sb(
            "POST",
            "email_events",
            body={
                "contact_id": payload.get("contact_id") or contact.get("id"),
                "enrollment_id": enrollment_id,
                "event_type": "sent",
                "payload": {"sequence_id": "founders_annual", "step_index": step_index},
            },
        )
    _schedule_after_send(payload, enrollment, steps, step_index)


def handler(event, context):
    failures = []
    for record in event.get("Records") or []:
        message_id = record.get("messageId")
        try:
            body = record.get("body") or "{}"
            payload = json.loads(body) if isinstance(body, str) else body
            _process(payload)
        except Exception as exc:
            print(f"founders_send failed: {exc}")
            if message_id:
                failures.append({"itemIdentifier": message_id})
            try:
                payload = json.loads(record.get("body") or "{}")
                _sb(
                    "POST",
                    "email_events",
                    body={
                        "contact_id": payload.get("contact_id"),
                        "enrollment_id": payload.get("enrollment_id"),
                        "event_type": "error",
                        "payload": {"error": str(exc), "step_index": payload.get("step_index")},
                    },
                )
            except Exception:
                pass
    return {"batchItemFailures": failures}
