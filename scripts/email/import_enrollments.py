#!/usr/bin/env python3
"""Legacy GetResponse JSON resume import.

Do not use this for cutover. GR access is gone; dayOfCycle cannot be recovered.
Use scripts/email/import_csv_restart.py instead (honest reset → lesson 1).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from email_crm.enroll import enroll_resume  # noqa: E402
from email_crm.map_cycles import enrollment_from_gr_contact  # noqa: E402


def load_contacts(path: Path) -> list:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    return data.get("contacts") or []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("contacts_json")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--activate", action="store_true", help="Set imported enrollments active (cutover). Default is paused.")
    args = parser.parse_args()

    contacts = load_contacts(Path(args.contacts_json))
    stats = Counter()
    mapped_rows = []
    for contact in contacts:
        mapped = enrollment_from_gr_contact(contact)
        stats["total"] += 1
        stats[mapped["source"]] += 1
        if mapped["suppressed"]:
            stats["suppressed"] += 1
        elif mapped["enrollment"] and mapped["enrollment"].get("status") == "completed":
            stats["completed"] += 1
        else:
            stats["resumed"] += 1
        mapped_rows.append(mapped)

    print(f"Mapped {stats['total']} contacts")
    for key, count in stats.most_common():
        if key != "total":
            print(f"  {key}: {count}")

    preview = ROOT / "exports" / "getresponse" / "mapped_enrollments.json"
    preview.parent.mkdir(parents=True, exist_ok=True)
    serializable = []
    for row in mapped_rows:
        item = dict(row)
        enr = item.get("enrollment")
        if enr and enr.get("next_send_at"):
            item = dict(item)
            item["enrollment"] = dict(enr)
            item["enrollment"]["next_send_at"] = enr["next_send_at"].isoformat()
        serializable.append(item)
    preview.write_text(json.dumps(serializable, indent=2, default=str), encoding="utf-8")
    print(f"Wrote {preview}")

    if args.dry_run:
        print("Dry run — no database writes.")
        return 0

    from supabase import create_client

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required for import")
        return 1
    sb = create_client(url, key)
    for mapped in mapped_rows:
        if mapped.get("enrollment") and not args.activate:
            mapped["enrollment"]["status"] = "paused" if mapped["enrollment"].get("status") == "active" else mapped["enrollment"]["status"]
        enroll_resume(sb, mapped)
    print("Import complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
