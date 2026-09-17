#!/usr/bin/env python3
"""Upsert email_sequences rows from the in-repo catalog (run after the SQL migration)."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from email_crm.enroll import ensure_sequences  # noqa: E402


def _create_client():
    kept = [p for p in sys.path if p not in {"", "."} and Path(p).resolve() != ROOT]
    old = sys.path[:]
    sys.path[:] = kept
    try:
        from supabase import create_client
        return create_client
    finally:
        sys.path[:] = old


def main():
    create_client = _create_client()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required")
        return 1
    sb = create_client(url, key)
    ensure_sequences(sb)
    print("Seeded email_sequences from email_crm.sequences")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
