"""Decide GetResponse vs AWS for a new opt-in without dual-sending."""

from __future__ import annotations

import os
from typing import Iterable, Optional

from email_crm.source import normalize_funnel

# EMAIL_MODE:
#   getresponse — current production (GR sends; still write CRM rows if enabled)
#   shadow      — GR still sends; AWS enrollment is paused (no SES)
#   holdout     — funnels in EMAIL_HOLDOUT_FUNNELS go AWS-only; everyone else GR
#   aws         — AWS only
VALID_MODES = ("getresponse", "shadow", "holdout", "aws")


def email_mode() -> str:
    mode = (os.getenv("EMAIL_MODE") or "getresponse").strip().lower()
    return mode if mode in VALID_MODES else "getresponse"


def holdout_funnels() -> set[str]:
    raw = os.getenv("EMAIL_HOLDOUT_FUNNELS") or ""
    return {normalize_funnel(part) for part in raw.split(",") if part.strip()}


def write_crm() -> bool:
    flag = (os.getenv("EMAIL_WRITE_CRM") or "").strip().lower()
    if flag in {"0", "false", "no"}:
        return False
    return True


def should_send_getresponse(funnel: Optional[str]) -> bool:
    mode = email_mode()
    if mode == "aws":
        return False
    if mode == "holdout":
        return normalize_funnel(funnel) not in holdout_funnels()
    return True  # getresponse + shadow


def should_enroll_aws(funnel: Optional[str]) -> bool:
    mode = email_mode()
    if mode == "getresponse":
        # Still enroll paused rows so the mapper/admin have data, unless disabled.
        return write_crm()
    if mode == "holdout":
        return True  # holdout funnel: active AWS; others: paused AWS + GR send
    return True  # shadow + aws


def aws_enrollment_status(funnel: Optional[str]) -> str:
    """active = due-worker may send; paused = stored only (shadow / non-holdout)."""
    mode = email_mode()
    if mode == "aws":
        return "active"
    if mode == "holdout":
        return "active" if normalize_funnel(funnel) in holdout_funnels() else "paused"
    if mode == "shadow":
        return "paused"
    # getresponse: keep paused so a mistaken send cap cannot double-email
    return "paused"


def send_enabled() -> bool:
    return (os.getenv("EMAIL_SEND_ENABLED") or "").strip().lower() in {"1", "true", "yes"}


def daily_send_cap() -> int:
    try:
        return max(0, int(os.getenv("EMAIL_DAILY_SEND_CAP") or "200"))
    except ValueError:
        return 200
