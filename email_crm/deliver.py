"""Single entry point Flask calls instead of (or in addition to) GetResponse."""

from __future__ import annotations

from typing import Callable, Optional

from email_crm.enroll import enroll_new, upsert_contact
from email_crm.provider import should_enroll_aws, should_send_getresponse, write_crm
from email_crm.source import normalize_funnel, sequence_id_for_source


def deliver_lead(
    *,
    supabase,
    email: str,
    name: str,
    phone: str = "",
    funnel: str,
    send_getresponse: Optional[Callable] = None,
    tags=None,
) -> dict:
    source = normalize_funnel(funnel)
    result = {"source": source, "getresponse": False, "aws": False}
    try:
        if write_crm() and supabase:
            contact = upsert_contact(
                supabase,
                email=email,
                name=name,
                phone=phone,
                source=source,
                tags=tags or [source],
            )
            if should_enroll_aws(funnel) and contact:
                enroll_new(
                    supabase,
                    contact=contact,
                    source=source,
                    funnel=funnel,
                    sequence_id=sequence_id_for_source(source),
                )
                result["aws"] = True
    except Exception as exc:
        print(f"⚠️ Email CRM enroll failed (GetResponse path still runs if enabled): {exc}")
    if should_send_getresponse(funnel) and send_getresponse:
        send_getresponse()
        result["getresponse"] = True
    return result


def deliver_paid(
    *,
    supabase,
    email: str,
    tag: str,
    name: str = "",
    send_getresponse: Optional[Callable] = None,
) -> dict:
    return deliver_lead(
        supabase=supabase,
        email=email,
        name=name or f"{tag} buyer",
        funnel=tag,
        send_getresponse=send_getresponse,
        tags=[tag],
    )
