"""Upsert email_contacts + enrollments in Supabase."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from typing import Optional

from email_crm.provider import aws_enrollment_status, send_enabled
from email_crm.sequences import get_sequence, sequence_rows_for_db
from email_crm.source import sequence_id_for_source


def ensure_sequences(supabase) -> None:
    if not supabase:
        return
    try:
        for row in sequence_rows_for_db():
            supabase.table("email_sequences").upsert(row, on_conflict="id").execute()
    except Exception as exc:
        print(f"⚠️ Could not seed email_sequences: {exc}")


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    if dt is None:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    return dt


def first_name(name: Optional[str]) -> str:
    if not name:
        return "there"
    return name.strip().split()[0]


def upsert_contact(supabase, *, email: str, name: str = "", phone: str = "", source: str, tags=None, extra=None) -> Optional[dict]:
    if not supabase:
        return None
    ensure_sequences(supabase)
    email = (email or "").strip().lower()
    if not email:
        return None
    payload = {
        "email": email,
        "name": name or "",
        "phone": phone or None,
        "source": source,
        "tags": tags or [],
        "updated_at": "now()",
    }
    if extra:
        payload.update(extra)
    existing = supabase.table("email_contacts").select("*").eq("email", email).limit(1).execute()
    if existing.data:
        contact = existing.data[0]
        merged_tags = list({*(contact.get("tags") or []), *(tags or [])})
        payload["tags"] = merged_tags
        supabase.table("email_contacts").update(payload).eq("id", contact["id"]).execute()
        contact.update(payload)
        return contact
    payload["unsubscribe_token"] = secrets.token_urlsafe(24)
    payload["status"] = "active"
    inserted = supabase.table("email_contacts").insert(payload).execute()
    return (inserted.data or [None])[0]


def enroll_new(
    supabase,
    *,
    contact: dict,
    source: str,
    funnel: str,
    sequence_id: Optional[str] = None,
    status: Optional[str] = None,
    origin: str = "app",
) -> Optional[dict]:
    if not supabase or not contact:
        return None
    if contact.get("status", "active") != "active":
        return None
    sequence_id = sequence_id or sequence_id_for_source(source)
    if sequence_id == "list_restart":
        raise ValueError("Use affirmative restart consent; automatic list_restart enrollment is disabled")
    get_sequence(sequence_id)  # validate against the application catalog
    status = status or aws_enrollment_status(funnel)
    response = supabase.rpc("email_enroll", {
        "p_contact": contact["id"], "p_sequence": sequence_id,
        "p_status": status, "p_origin": origin,
    }).execute()
    row = response.data
    if (row and sequence_id == "founders_annual" and row["status"] == "active"
            and row.get("step_index", 0) == 0 and not row.get("next_send_at") and send_enabled()):
        enqueue_founders_step(contact, row)
    return row


def enroll_resume(*args, **kwargs):
    raise RuntimeError("Legacy resume import is disabled: recover verified delivery history first")


def advance_enrollment(*args, **kwargs):
    raise RuntimeError("Advancement requires durable provider acceptance via email_accept RPC")


def enqueue_founders_step(contact: dict, enrollment: Optional[dict], step_index: int = 0, delay_seconds: int = 0):
    queue_url = os.getenv("EMAIL_FOUNDERS_QUEUE_URL")
    if not queue_url or not enrollment:
        raise RuntimeError("EMAIL_FOUNDERS_QUEUE_URL and enrollment are required")
    if delay_seconds:
        raise ValueError("Schedule delayed Founders steps with next_send_at, not FIFO message delays")
    try:
        import boto3

        client = boto3.client("sqs", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
        body = _json_dumps(
            {
                "enrollment_id": enrollment["id"],
                "contact_id": contact["id"],
                "email": contact["email"],
                "name": contact.get("name") or "",
                "unsubscribe_token": contact.get("unsubscribe_token") or "",
                "step_index": step_index,
            }
        )
        client.send_message(
            QueueUrl=queue_url,
            MessageBody=body,
            MessageGroupId=str(contact["id"]),
            MessageDeduplicationId=f"{enrollment['id']}:{step_index}",
        )
        print(f"✅ Enqueued Founders step {step_index} for {contact['email']}")
    except Exception as exc:
        raise RuntimeError("Failed to enqueue Founders email") from exc


def _json_dumps(payload: dict) -> str:
    import json

    return json.dumps(payload)


def suppress_contact(supabase, *, email: Optional[str] = None, token: Optional[str] = None, reason: str = "unsubscribed"):
    if not supabase:
        return None
    query = supabase.table("email_contacts").select("*")
    if token:
        query = query.eq("unsubscribe_token", token)
    elif email:
        query = query.eq("email", email.strip().lower())
    else:
        return None
    found = query.limit(1).execute()
    if not found.data:
        return None
    contact = found.data[0]
    import uuid
    supabase.rpc("email_record_event", {
        "p_provider": "app", "p_key": str(uuid.uuid4()), "p_email": contact["email"],
        "p_type": reason if reason in {"bounced", "complained"} else "unsubscribed",
        "p_message_id": None,
    }).execute()
    return contact
