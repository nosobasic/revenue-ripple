#!/usr/bin/env python3
"""Send 1–3 sandbox emails to verified @revenueripple.org inboxes only.

Does not enable the due-worker. Enrollments are paused after send so a later
EMAIL_SEND_ENABLED=true cannot continue the sequence. Do not use this for the
GetResponse CSV.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:
    pass

from email_crm.enroll import enroll_new, ensure_sequences, upsert_contact  # noqa: E402
from email_crm.send import send_enrollment_step  # noqa: E402

# Sandbox can send to any address on the verified domain revenueripple.org.
SEED_RECIPIENTS = [
    ("hello@revenueripple.org", "Donte"),
    ("donte@revenueripple.org", "Donte"),
]


def _create_client():
    """The repo has a supabase/ folder; load the PyPI client from site-packages."""
    kept = [p for p in sys.path if p not in {"", "."} and Path(p).resolve() != ROOT]
    old = sys.path[:]
    sys.path[:] = kept
    try:
        from supabase import create_client
        return create_client
    finally:
        sys.path[:] = old


def _production_access_enabled() -> bool:
    try:
        import boto3

        acct = boto3.client("sesv2", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1")).get_account()
        return bool(acct.get("ProductionAccessEnabled"))
    except Exception:
        return False


def main() -> int:
    extra = (os.getenv("SES_SANDBOX_TO") or "").strip().lower()
    recipients = list(SEED_RECIPIENTS)
    if extra and extra not in {e for e, _ in recipients}:
        if not extra.endswith("@revenueripple.org"):
            print(f"Ignoring SES_SANDBOX_TO={extra}: sandbox send is limited to @revenueripple.org")
        else:
            recipients.append((extra, extra.split("@")[0].title()))

    if _production_access_enabled():
        print("SES production access is already on — this script is for sandbox proof only.")
        return 1

    os.environ["EMAIL_SEND_ENABLED"] = "true"
    os.environ.setdefault("SES_FROM", "Donte Willis <hello@revenueripple.org>")
    os.environ.setdefault("SES_CONFIGURATION_SET", "revenue-ripple-prod-email-cfg")
    os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
    os.environ.setdefault("APP_BASE_URL", "https://revenueripple.org")
    os.environ.setdefault("EMAIL_PHYSICAL_ADDRESS", "Revenue Ripple, Attn: Donte Willis")

    create_client = _create_client()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required")
        return 1
    sb = create_client(url, key)
    ensure_sequences(sb)

    sent = []
    for email, name in recipients[:3]:
        contact = upsert_contact(sb, email=email, name=name, source="sandbox_seed", tags=["sandbox_seed"])
        if not contact:
            print(f"skip {email}: contact upsert failed")
            continue
        enroll_new(
            sb,
            contact=contact,
            source="sandbox_seed",
            funnel="sandbox_seed",
            sequence_id="indoctrination",
            status="paused",
            origin="sandbox_seed",
        )
        result = send_enrollment_step(contact=contact, sequence_id="indoctrination", step_index=0)
        sb.table("email_enrollments").update({"status": "paused", "next_send_at": None}).eq(
            "contact_id", contact["id"]
        ).eq("sequence_id", "indoctrination").execute()
        sent.append((email, result.get("message_id")))
        print(f"sent {email} message_id={result.get('message_id')}")

    print(f"Done. {len(sent)} sandbox seed(s). Due-worker remains off; enrollments are paused.")
    return 0 if sent else 1


if __name__ == "__main__":
    raise SystemExit(main())
