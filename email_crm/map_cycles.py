"""Legacy GetResponse dayOfCycle mapper.

Not the live cutover path. GetResponse access is gone; existing subscribers
enter list_restart via CSV import (scripts/email/import_csv_restart.py) and
restart at DMD lesson 1 after the reset email.

This module is kept so older tests and dry-runs still compile.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from email_crm.sequences import SEQUENCES, get_sequence, lead_magnet_calendar
from email_crm.source import (
    LEAD_MAGNET_SOURCES,
    display_name_from_gr_name,
    sequence_id_for_source,
    source_from_gr_contact,
)


def _parse_dt(value) -> Optional[datetime]:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
    text = str(value).strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def day_of_cycle(contact: dict) -> int:
    raw = contact.get("dayOfCycle")
    if raw is None or raw == "":
        return 0
    try:
        return max(0, int(raw))
    except (TypeError, ValueError):
        return 0


def is_suppressed(contact: dict) -> bool:
    status = (contact.get("status") or contact.get("origin") or "").lower()
    if status in {"unsubscribed", "unsubscribed-by-admin", "bounced", "complained"}:
        return True
    if contact.get("unsubscribed") or contact.get("removedOn"):
        return True
    return False


def _next_after_offset(steps: list[dict], current_day: int) -> Optional[dict]:
    for step in sorted(steps, key=lambda s: s["day_offset"]):
        if step["day_offset"] > current_day:
            return step
    return None


def map_lead_magnet(day: int) -> Optional[dict]:
    """Return the next flattened step after `day`, or None if the year is done."""
    return _next_after_offset(lead_magnet_calendar(), day)


def map_sequence_day(sequence_id: str, day: int) -> Optional[dict]:
    seq = get_sequence(sequence_id)
    steps = [s for s in seq["steps"] if "day_offset" in s]
    if not steps:
        return None
    found = _next_after_offset(steps, day)
    if not found:
        return None
    return {**found, "sequence_id": sequence_id}


def next_send_at_for_offset(created_on, day_offset: int, now: Optional[datetime] = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    created = _parse_dt(created_on) or now
    target = created + timedelta(days=day_offset)
    if target < now:
        return now
    return target


def enrollment_from_gr_contact(contact: dict, now: Optional[datetime] = None) -> dict:
    """Build a resume enrollment (or suppression record) from a GR contact dict."""
    now = now or datetime.now(timezone.utc)
    source = source_from_gr_contact(contact)
    email = (contact.get("email") or "").strip().lower()
    name = display_name_from_gr_name(contact.get("name"))
    created_on = contact.get("createdOn") or contact.get("changedOn")
    suppressed = is_suppressed(contact)
    cycle = day_of_cycle(contact)

    result = {
        "email": email,
        "name": name,
        "source": source,
        "getresponse_contact_id": contact.get("contactId") or contact.get("id"),
        "getresponse_campaign_id": (contact.get("campaign") or {}).get("campaignId"),
        "getresponse_day_of_cycle": cycle,
        "created_on": created_on,
        "suppressed": suppressed,
        "enrollment": None,
    }

    if not email or suppressed:
        return result

    if source in LEAD_MAGNET_SOURCES or source == "unknown":
        nxt = map_lead_magnet(cycle)
        if not nxt:
            result["enrollment"] = {
                "sequence_id": "dmd_course_26",
                "step_index": len(SEQUENCES["dmd_course_26"]["steps"]),
                "status": "completed",
                "next_send_at": None,
            }
            return result
        result["enrollment"] = {
            "sequence_id": nxt["sequence_id"],
            "step_index": nxt["index"],
            "status": "active",
            "next_send_at": next_send_at_for_offset(created_on, nxt["day_offset"], now),
            "template_key": nxt.get("template_key"),
        }
        return result

    sequence_id = sequence_id_for_source(source)
    seq = get_sequence(sequence_id)
    if seq["engine"] == "step_functions":
        # Founders: do not resume a 5-minute Discord invite months later.
        # Only enroll remaining day-scale emails (index >= 4) if still in window.
        if cycle >= 50:
            result["enrollment"] = {
                "sequence_id": sequence_id,
                "step_index": len(seq["steps"]),
                "status": "completed",
                "next_send_at": None,
            }
            return result
        # Map roughly: day 0-6 → week1 (index 4), 7-29 → day30, 30-49 → guarantee
        if cycle < 7:
            step = seq["steps"][4]
        elif cycle < 30:
            step = seq["steps"][5]
        else:
            step = seq["steps"][6]
        result["enrollment"] = {
            "sequence_id": sequence_id,
            "step_index": step["index"],
            "status": "active",
            "next_send_at": next_send_at_for_offset(created_on, {4: 7, 5: 30, 6: 50}[step["index"]], now),
            "template_key": step.get("template_key"),
            "engine": "due_worker",  # remaining founders emails are day-scale
        }
        return result

    mapped = map_sequence_day(sequence_id, cycle)
    if not mapped:
        result["enrollment"] = {
            "sequence_id": sequence_id,
            "step_index": len(seq["steps"]),
            "status": "completed",
            "next_send_at": None,
        }
        return result
    result["enrollment"] = {
        "sequence_id": sequence_id,
        "step_index": mapped["index"],
        "status": "active",
        "next_send_at": next_send_at_for_offset(created_on, mapped["day_offset"], now),
        "template_key": mapped.get("template_key"),
    }
    return result
