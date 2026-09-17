#!/usr/bin/env python3
"""Write a CSV of suppressed emails from a mapped GR export for SES import.

Plain unsubscribes are stored in email_contacts by the importer. This file is
for SES account-level bounce/complaint suppression only.

    python scripts/email/import_ses_suppression.py exports/getresponse/mapped_enrollments.json
    aws sesv2 put-suppressed-destination --email-address ADDRESS --reason BOUNCE
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mapped_json")
    parser.add_argument(
        "--out",
        default=str(ROOT / "exports" / "getresponse" / "ses_suppression.csv"),
    )
    args = parser.parse_args()
    rows = json.loads(Path(args.mapped_json).read_text(encoding="utf-8"))
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with out.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["email", "reason"])
        for row in rows:
            if not row.get("suppressed") or not row.get("email"):
                continue
            status = (row.get("status") or "").lower()
            reason = "BOUNCE" if status == "bounced" or row.get("bounce") else "COMPLAINT"
            writer.writerow([row["email"], reason])
            count += 1
    print(f"Wrote {count} suppressed addresses to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
