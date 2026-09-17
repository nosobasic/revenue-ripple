#!/usr/bin/env python3
"""Export GetResponse campaigns, contacts, autoresponders, and compare the two API keys.

Writes JSON/CSV under exports/getresponse/ (gitignored). Does not print API keys.

Usage (from repo root, with .env loaded):

    python scripts/email/export_getresponse.py
    python scripts/email/export_getresponse.py --account-check-only
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

OUT_DIR = ROOT / "exports" / "getresponse"
API = "https://api.getresponse.com/v3"


def _headers(api_key: str) -> dict:
    return {"X-Auth-Token": f"api-key {api_key}", "Content-Type": "application/json"}


def _paginate(path: str, api_key: str, params=None, extra_headers=None) -> list:
    params = dict(params or {})
    params.setdefault("perPage", 100)
    page = 1
    items = []
    headers = _headers(api_key)
    if extra_headers:
        headers.update(extra_headers)
    while True:
        params["page"] = page
        resp = requests.get(f"{API}{path}", headers=headers, params=params, timeout=30)
        if resp.status_code != 200:
            print(f"  ⚠️ GET {path} -> {resp.status_code}: {resp.text[:300]}")
            break
        batch = resp.json()
        if not batch:
            break
        if isinstance(batch, dict):
            # some endpoints return a single object
            items.append(batch)
            break
        items.extend(batch)
        if len(batch) < int(params["perPage"]):
            break
        page += 1
        time.sleep(0.35)
    return items


def account_info(api_key: str) -> dict:
    resp = requests.get(f"{API}/accounts", headers=_headers(api_key), timeout=20)
    if resp.status_code != 200:
        return {"error": resp.status_code, "body": resp.text[:400]}
    data = resp.json()
    return {
        "accountId": data.get("accountId") or data.get("id"),
        "email": data.get("email"),
        "firstName": data.get("firstName"),
        "lastName": data.get("lastName"),
        "phone": data.get("phone"),
        "href": data.get("href"),
        "companyName": (data.get("company") or {}).get("name") if isinstance(data.get("company"), dict) else data.get("companyName"),
    }


def compare_accounts() -> dict:
    master_key = os.getenv("GETRESPONSE_API_KEY")
    tripwire_key = os.getenv("GET_RESPONSE_TRIPWIRE_KEY")
    report = {
        "master_key_set": bool(master_key),
        "tripwire_key_set": bool(tripwire_key),
        "same_key": bool(master_key and tripwire_key and master_key == tripwire_key),
        "master": None,
        "tripwire": None,
        "two_paid_accounts": None,
    }
    if master_key:
        report["master"] = account_info(master_key)
        report["master"]["campaign_id_env"] = os.getenv("GETRESPONSE_CAMPAIGN_ID")
    if tripwire_key:
        report["tripwire"] = account_info(tripwire_key)
        report["tripwire"]["campaign_id_env"] = os.getenv("GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID")
        report["tripwire"]["founders_campaign_hardcoded"] = "im9O1"
    master_id = (report["master"] or {}).get("accountId")
    trip_id = (report["tripwire"] or {}).get("accountId")
    report["two_paid_accounts"] = bool(master_id and trip_id and master_id != trip_id)
    report["same_account"] = bool(master_id and trip_id and master_id == trip_id)
    return report


def dump_lane(label: str, api_key: str, campaign_id: str | None):
    lane_dir = OUT_DIR / label
    lane_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n=== {label} ===")
    campaigns = _paginate("/campaigns", api_key)
    (lane_dir / "campaigns.json").write_text(json.dumps(campaigns, indent=2), encoding="utf-8")
    print(f"  campaigns: {len(campaigns)}")

    tags = _paginate("/tags", api_key)
    (lane_dir / "tags.json").write_text(json.dumps(tags, indent=2), encoding="utf-8")
    print(f"  tags: {len(tags)}")

    custom_fields = _paginate("/custom-fields", api_key)
    (lane_dir / "custom_fields.json").write_text(json.dumps(custom_fields, indent=2), encoding="utf-8")

    autoresponders = _paginate("/autoresponders", api_key)
    (lane_dir / "autoresponders.json").write_text(json.dumps(autoresponders, indent=2), encoding="utf-8")
    print(f"  autoresponders: {len(autoresponders)}")

    newsletters = _paginate("/newsletters", api_key)
    (lane_dir / "newsletters.json").write_text(json.dumps(newsletters, indent=2), encoding="utf-8")
    print(f"  newsletters: {len(newsletters)}")

    from_fields = _paginate("/from-fields", api_key)
    (lane_dir / "from_fields.json").write_text(json.dumps(from_fields, indent=2), encoding="utf-8")

    suppression = _paginate("/suppressions", api_key)
    (lane_dir / "suppressions.json").write_text(json.dumps(suppression, indent=2), encoding="utf-8")
    print(f"  suppressions: {len(suppression)}")

    contacts = []
    if campaign_id:
        contacts = _paginate(
            "/contacts",
            api_key,
            params={"campaigns[]": campaign_id, "fields": "email,name,campaign,tags,dayOfCycle,createdOn,changedOn,origin,scoring"},
        )
        # Also try without fields filter if empty
        if not contacts:
            contacts = _paginate("/contacts", api_key, params={"campaigns[]": campaign_id})
    else:
        contacts = _paginate("/contacts", api_key)
    (lane_dir / "contacts.json").write_text(json.dumps(contacts, indent=2), encoding="utf-8")

    csv_path = lane_dir / "contacts.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "email",
                "name",
                "dayOfCycle",
                "createdOn",
                "campaignId",
                "tags",
                "origin",
                "contactId",
            ],
        )
        writer.writeheader()
        for c in contacts:
            tags = c.get("tags") or []
            tag_names = []
            for t in tags:
                if isinstance(t, dict):
                    tag_names.append(t.get("name") or t.get("tagId") or "")
                else:
                    tag_names.append(str(t))
            writer.writerow(
                {
                    "email": c.get("email"),
                    "name": c.get("name"),
                    "dayOfCycle": c.get("dayOfCycle"),
                    "createdOn": c.get("createdOn"),
                    "campaignId": (c.get("campaign") or {}).get("campaignId"),
                    "tags": "|".join(tag_names),
                    "origin": c.get("origin"),
                    "contactId": c.get("contactId"),
                }
            )
    print(f"  contacts: {len(contacts)} -> {csv_path}")
    return {"contacts": len(contacts), "autoresponders": len(autoresponders), "campaigns": len(campaigns)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--account-check-only", action="store_true")
    args = parser.parse_args()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    report = compare_accounts()
    (OUT_DIR / "account_check.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("GetResponse account check")
    print(f"  master key set:   {report['master_key_set']}")
    print(f"  tripwire key set: {report['tripwire_key_set']}")
    print(f"  same API key:     {report['same_key']}")
    if report.get("master"):
        print(f"  master account:   {report['master'].get('email')} id={report['master'].get('accountId')}")
    if report.get("tripwire"):
        print(f"  tripwire account: {report['tripwire'].get('email')} id={report['tripwire'].get('accountId')}")
    print(f"  two paid seats:   {report.get('two_paid_accounts')}")

    if args.account_check_only:
        return 0 if report["master_key_set"] else 1

    summary = {"exported_at": datetime.now(timezone.utc).isoformat(), "lanes": {}}
    master_key = os.getenv("GETRESPONSE_API_KEY")
    if master_key:
        summary["lanes"]["master"] = dump_lane("master", master_key, os.getenv("GETRESPONSE_CAMPAIGN_ID"))
    trip_key = os.getenv("GET_RESPONSE_TRIPWIRE_KEY")
    if trip_key and not report["same_key"]:
        summary["lanes"]["tripwire"] = dump_lane("tripwire", trip_key, os.getenv("GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID"))
        # Founders list is hardcoded on the tripwire key in server.py
        dump_lane("founders", trip_key, "im9O1")
    elif trip_key and report["same_key"]:
        dump_lane("founders", trip_key, "im9O1")
    (OUT_DIR / "export_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print("\nDone. Review exports/getresponse/ (not committed).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
