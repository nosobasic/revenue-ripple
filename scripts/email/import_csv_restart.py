#!/usr/bin/env python3
"""Import a contact CSV into list_restart (reset email → DMD lesson 1).

Does not resume GetResponse dayOfCycle. Default enrollments are paused until
SES is live. People who reply "don't restart" should be paused in Admin.

Usage:

    python scripts/email/import_csv_restart.py path/to/contacts.csv --dry-run
    python scripts/email/import_csv_restart.py path/to/contacts.csv
    python scripts/email/import_csv_restart.py path/to/contacts.csv --activate
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:
    pass

from email_crm.enroll import enroll_new, ensure_sequences, upsert_contact  # noqa: E402
from email_crm.source import display_name_from_gr_name  # noqa: E402

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _create_client():
    kept = [p for p in sys.path if p not in {"", "."} and Path(p).resolve() != ROOT]
    old = sys.path[:]
    sys.path[:] = kept
    try:
        from supabase import create_client
        return create_client
    finally:
        sys.path[:] = old


def _norm(header: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (header or "").strip().lower())


def _pick(row: dict, *names: str) -> str:
    wanted = {_norm(n) for n in names}
    for key, val in row.items():
        if _norm(key) in wanted:
            return (val or "").strip()
    return ""


def load_rows(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("contacts_csv")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--activate",
        action="store_true",
        help="Set list_restart enrollments active (ready to send). Default is paused.",
    )
    args = parser.parse_args()

    if not args.dry_run and os.getenv("SES_PRODUCTION_CONFIRMED", "").strip().lower() not in {
        "1",
        "true",
        "yes",
    }:
        print(
            "Refusing CSV import: SES is still in sandbox. Dry-run is allowed. "
            "After AWS approves production access, set SES_PRODUCTION_CONFIRMED=true "
            "and import paused first — do not pass --activate until a seed send works."
        )
        return 1

    path = Path(args.contacts_csv)
    rows = load_rows(path)
    stats = Counter()
    preview = []
    seen = set()
    for row in rows:
        stats["rows"] += 1
        email = _pick(row, "email", "e-mail", "e_mail").lower()
        if not EMAIL_RE.match(email):
            stats["skipped_bad_email"] += 1
            continue
        if email in seen:
            stats["skipped_duplicate"] += 1
            continue
        seen.add(email)
        name = display_name_from_gr_name(_pick(row, "name", "fullname", "full_name"))
        preview.append({"email": email, "name": name})
        stats["importable"] += 1

    print(f"Read {stats['rows']} CSV rows from {path}")
    for key, count in stats.most_common():
        if key != "rows":
            print(f"  {key}: {count}")

    if args.dry_run:
        print("Dry run — no database writes.")
        for item in preview[:8]:
            print(f"  {item['email']} ({item['name'] or '—'})")
        if len(preview) > 8:
            print(f"  … {len(preview) - 8} more")
        return 0

    create_client = _create_client()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required for import")
        return 1
    sb = create_client(url, key)
    ensure_sequences(sb)
    status = "active" if args.activate else "paused"
    written = 0
    for item in preview:
        contact = upsert_contact(
            sb,
            email=item["email"],
            name=item["name"],
            source="list_restart",
        )
        enroll_new(
            sb,
            contact=contact,
            source="list_restart",
            funnel="list_restart",
            sequence_id="list_restart",
            status=status,
            origin="csv_restart",
        )
        written += 1
    print(f"Imported {written} contacts into list_restart ({status}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
