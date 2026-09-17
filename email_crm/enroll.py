"""Upsert email_contacts + enrollments in Supabase."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
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
    sequence_id = sequence_id or sequence_id_for_source(source)
    seq = get_sequence(sequence_id)
    status = status or aws_enrollment_status(funnel)
    now = _now()
    enrollment = {
        "contact_id": contact["id"],
        "sequence_id": sequence_id,
        "step_index": 0,
        "status": status,
        "origin": origin,
        "next_send_at": _iso(now) if seq["engine"] == "due_worker" else None,
        "getresponse_day_of_cycle": 0,
    }
    existing = (
        supabase.table("email_enrollments")
        .select("id,status")
        .eq("contact_id", contact["id"])
        .eq("sequence_id", sequence_id)
        .in_("status", ["active", "paused", "shadow"])
        .execute()
    )
    if existing.data:
        return existing.data[0]
    inserted = supabase.table("email_enrollments").insert(enrollment).execute()
    row = (inserted.data or [None])[0]
    if sequence_id == "founders_annual" and status == "active" and send_enabled():
        enqueue_founders_step(contact, row, step_index=0, delay_seconds=0)
    return row


def enroll_resume(supabase, mapped: dict) -> Optional[dict]:
    """Legacy GR resume import. Cutover uses scripts/email/import_csv_restart.py instead."""
    if not supabase or not mapped.get("email"):
        return None
    ensure_sequences(supabase)
    extra = {
        "getresponse_contact_id": mapped.get("getresponse_contact_id"),
        "getresponse_campaign_id": mapped.get("getresponse_campaign_id"),
    }
    if mapped.get("suppressed"):
        extra["status"] = "unsubscribed"
        extra["unsubscribed_at"] = "now()"
    contact = upsert_contact(
        supabase,
        email=mapped["email"],
        name=mapped.get("name") or "",
        source=mapped.get("source") or "unknown",
        extra=extra,
    )
    if mapped.get("suppressed") or not mapped.get("enrollment"):
        return contact
    enr = mapped["enrollment"]
    payload = {
        "contact_id": contact["id"],
        "sequence_id": enr["sequence_id"],
        "step_index": enr["step_index"],
        "status": enr.get("status") or "paused",
        "origin": "getresponse_import",
        "next_send_at": _iso(enr.get("next_send_at")),
        "getresponse_day_of_cycle": mapped.get("getresponse_day_of_cycle"),
    }
    existing = (
        supabase.table("email_enrollments")
        .select("id")
        .eq("contact_id", contact["id"])
        .eq("sequence_id", enr["sequence_id"])
        .execute()
    )
    if existing.data:
        supabase.table("email_enrollments").update(payload).eq("id", existing.data[0]["id"]).execute()
        return existing.data[0]
    inserted = supabase.table("email_enrollments").insert(payload).execute()
    return (inserted.data or [None])[0]


def advance_enrollment(supabase, enrollment: dict, sequence: dict) -> dict:
    nxt_index = enrollment["step_index"] + 1
    steps = sequence["steps"]
    if nxt_index < len(steps):
        step = steps[nxt_index]
        delay_days = 0
        if "day_offset" in step and "day_offset" in steps[enrollment["step_index"]]:
            delay_days = step["day_offset"] - steps[enrollment["step_index"]]["day_offset"]
        elif sequence["id"] == "dmd_course_26":
            delay_days = 14
        next_at = _now() + timedelta(days=max(delay_days, 0))
        supabase.table("email_enrollments").update(
            {
                "step_index": nxt_index,
                "next_send_at": _iso(next_at),
                "last_sent_at": _iso(_now()),
            }
        ).eq("id", enrollment["id"]).execute()
        return {"status": "advanced", "step_index": nxt_index}

    next_seq = sequence.get("next_sequence")
    supabase.table("email_enrollments").update(
        {
            "status": "completed",
            "next_send_at": None,
            "last_sent_at": _iso(_now()),
            "completed_at": _iso(_now()),
        }
    ).eq("id", enrollment["id"]).execute()
    if next_seq:
        delay = int(sequence.get("next_delay_days") or 14)
        supabase.table("email_enrollments").insert(
            {
                "contact_id": enrollment["contact_id"],
                "sequence_id": next_seq,
                "step_index": 0,
                "status": enrollment.get("status") or "active",
                "origin": "handoff",
                "next_send_at": _iso(_now() + timedelta(days=delay)),
            }
        ).execute()
        return {"status": "handed_off", "sequence_id": next_seq}
    return {"status": "completed"}


def enqueue_founders_step(contact: dict, enrollment: Optional[dict], step_index: int = 0, delay_seconds: int = 0):
    queue_url = os.getenv("EMAIL_FOUNDERS_QUEUE_URL")
    if not queue_url or not enrollment:
        print("⚠️ EMAIL_FOUNDERS_QUEUE_URL not set — Founders enrollment stored, SQS not enqueued")
        return
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
            DelaySeconds=min(max(int(delay_seconds), 0), 900),
            MessageGroupId=str(contact["id"]),
            MessageDeduplicationId=f"{enrollment['id']}:{step_index}",
        )
        print(f"✅ Enqueued Founders step {step_index} for {contact['email']}")
    except Exception as exc:
        print(f"❌ Failed to enqueue Founders SQS message: {exc}")


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
    status = "complained" if reason == "complained" else "unsubscribed"
    if reason == "bounced":
        status = "bounced"
    supabase.table("email_contacts").update(
        {
            "status": status,
            "unsubscribed_at": "now()",
            "suppression_reason": reason,
        }
    ).eq("id", contact["id"]).execute()
    supabase.table("email_enrollments").update({"status": "suppressed", "next_send_at": None}).eq(
        "contact_id", contact["id"]
    ).in_("status", ["active", "paused"]).execute()
    return contact
