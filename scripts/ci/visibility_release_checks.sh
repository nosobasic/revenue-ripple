#!/usr/bin/env bash
set -euo pipefail
# Disposable runner network namespace; synthetic configuration only, no secrets.
export VITE_SUPABASE_URL=http://127.0.0.1:9
export VITE_SUPABASE_ANON_KEY=synthetic-ci-not-a-key
export VITE_API_BASE_URL=http://127.0.0.1:9
export VITE_BILLING_PORTAL_ENABLED=false
export RR_VISIBILITY_ALLOW_LIVE=false
export RR_AUTH_TEST_ROOT="$PWD"
node --test tests/auth/router-major.test.mjs tests/auth/feedback.test.mjs tests/visibility/allowance-copy.test.mjs tests/visibility/beta-errors.test.mjs tests/admin-analytics.test.mjs tests/auth/unpaid-profile.test.mjs tests/auth/link-contrast.test.mjs
node tests/auth/routing.test.mjs
python -m unittest discover -s tests/visibility -p 'test_*.py' -v
python tests/release_contract/check_api_contract.py "$PWD"
npm run build
# Browser validation is reported separately; the opt-in browser contrast case is skipped here.
# Repository-wide lint/typecheck are separately tracked, not represented as passed.
