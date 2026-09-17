"""Reconstruct lead-magnet / buyer source from GetResponse name suffixes and tags.

Lead-magnet helpers in server.py never applied GR tags; they encoded source in the
contact name, e.g. "Jane (Membership Mastery)". Paid contacts use names like
"Tripwire Buyer" plus a real tags array.
"""

from __future__ import annotations

import re
from typing import Optional

# Longest suffix first so "Digital Marketing Domination" wins over shorter matches.
NAME_SUFFIXES = (
    ("(digital marketing domination)", "digital-marketing-domination"),
    ("(membership mastery)", "membership-mastery"),
    ("(survival playbook)", "survival-playbook"),
    ("(book giveaway)", "book-giveaway"),
)

PAID_NAME_SOURCES = {
    "founder member": "founders_annual",
    "tripwire buyer": "tripwire",
    "membership buyer": "membership",
    "reseller buyer": "reseller",
    "pro_reseller buyer": "pro_reseller",
    "pro reseller buyer": "pro_reseller",
    "reseller_trial buyer": "reseller_trial",
    "pro_reseller_trial buyer": "pro_reseller_trial",
    "quarterly_growth buyer": "quarterly_growth",
}

TAG_TO_SOURCE = {
    "tripwire": "tripwire",
    "founders_annual": "founders_annual",
    "membership": "membership",
    "reseller": "reseller",
    "pro_reseller": "pro_reseller",
    "reseller_trial": "reseller_trial",
    "pro_reseller_trial": "pro_reseller_trial",
    "quarterly_growth": "quarterly_growth",
}

# Funnel ids used by landing pages / holdout env (EMAIL_HOLDOUT_FUNNELS).
FUNNEL_ALIASES = {
    "dmd-variation-1": "digital-marketing-domination",
    "dmd-variation-2": "digital-marketing-domination",
    "dmd-variation-3": "digital-marketing-domination",
    "digital-marketing-domination": "digital-marketing-domination",
    "dmd": "digital-marketing-domination",
    "membership-variation-1": "membership-mastery",
    "membership-variation-2": "membership-mastery",
    "membership-variation-3": "membership-mastery",
    "membership-mastery": "membership-mastery",
    "survival-playbook": "survival-playbook",
    "book-giveaway": "book-giveaway",
    "tripwire": "tripwire",
    "founders_annual": "founders_annual",
    "founders-annual": "founders_annual",
}

LEAD_MAGNET_SOURCES = {
    "digital-marketing-domination",
    "membership-mastery",
    "survival-playbook",
    "book-giveaway",
}

PAID_SOURCES = {
    "tripwire",
    "founders_annual",
    "membership",
    "reseller",
    "pro_reseller",
    "reseller_trial",
    "pro_reseller_trial",
    "quarterly_growth",
}

_PAREN_RE = re.compile(r"\(([^)]+)\)\s*$")


def normalize_funnel(funnel: Optional[str]) -> str:
    if not funnel:
        return "unknown"
    key = str(funnel).strip().lower()
    return FUNNEL_ALIASES.get(key, key)


def source_from_contact_name(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    lowered = name.strip().lower()
    for suffix, source in NAME_SUFFIXES:
        if lowered.endswith(suffix):
            return source
    for paid_name, source in PAID_NAME_SOURCES.items():
        if lowered == paid_name or lowered.endswith(paid_name):
            return source
    match = _PAREN_RE.search(name.strip())
    if match:
        inner = match.group(1).strip().lower()
        return FUNNEL_ALIASES.get(inner, inner.replace(" ", "-"))
    return None


def display_name_from_gr_name(name: Optional[str]) -> str:
    """Strip the source suffix so we store a real person name."""
    if not name:
        return ""
    cleaned = name.strip()
    for suffix, _source in NAME_SUFFIXES:
        # suffix is lowercase; match case-insensitively at end
        if cleaned.lower().endswith(suffix):
            return cleaned[: len(cleaned) - len(suffix)].strip()
    return cleaned


def source_from_tag(tag: Optional[str]) -> Optional[str]:
    if not tag:
        return None
    return TAG_TO_SOURCE.get(str(tag).strip().lower())


def source_from_gr_contact(contact: dict) -> str:
    tags = contact.get("tags") or []
    tag_values = []
    for tag in tags:
        if isinstance(tag, dict):
            tag_values.append(tag.get("name") or tag.get("tagId") or "")
        else:
            tag_values.append(str(tag))
    for tag in tag_values:
        mapped = source_from_tag(tag)
        if mapped:
            return mapped
    named = source_from_contact_name(contact.get("name"))
    if named:
        return named
    campaign = (contact.get("campaign") or {}).get("campaignId") or ""
    if campaign == "im9O1":
        return "founders_annual"
    return "unknown"


def sequence_id_for_source(source: str) -> str:
    """Which sequence a *new* contact (day 0) should enter."""
    src = normalize_funnel(source)
    if src == "founders_annual":
        return "founders_annual"
    if src == "tripwire":
        # Product is free for now — don't send the shelved tripwire upsell.
        return "indoctrination"
    if src in {"membership", "reseller", "pro_reseller", "reseller_trial", "pro_reseller_trial", "quarterly_growth"}:
        return "paid_buyer"
    # DMD, MM, Survival, book giveaway all share the indoctrination → 26-lesson path
    return "indoctrination"
