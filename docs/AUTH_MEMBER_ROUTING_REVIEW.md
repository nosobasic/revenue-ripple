# Existing-member authentication and checkout review — 2026-10-10

Follow-up: see AUTH_PAYMENT_FOLLOWUP_REVIEW.md for independent review corrections, explicit unverified subscription state, and final 123-assertion validation. This document preserves the initial investigation evidence.

## Verified baseline and owner record

- Isolated clone: `codex/auth-member-routing`, based on fetched remote main `1a08ea101e16ede86d19840fc1034c01db5e14e7`.
- Public frontend `/release.json` returned that exact commit. Backend `/api/visibility-pilot/release` returned `7240a35d6d65f687c3372d987f104eb338327b74`. Both report `scans_enabled=false`.
- Existing browser started at `https://www.revenueripple.org/dashboard`, already authenticated. Profile displayed Donte Willis, Admin Account, and ADMIN training/resource access. Returned browser to the starting dashboard. Email input is redacted by the browser interface; it was not used to infer identity.
- Separately, an exact, authorized email-filtered Supabase REST read for the reported owner returned one profile: `role=admin`, `plan=lifetime`, `status=active`, `has_paid=true`, `payment_status=admin_access`. No new `rr_subscriptions` rows or legacy email-matched subscription rows. Only role/plan/status fields were printed; no Auth-user enumeration, tokens, IDs, payment amounts, or payment details.
- This is existing admin/lifetime access, not proof of an active Stripe subscription. Missing new subscriptions does not revoke historical access or require repurchase. No owner data correction is indicated by this evidence.

## Confirmed code causes

The deployed OAuth callback has three competing completion paths: an auth event listener, `getSession`, and a timer. They close over a React `hasRedirected` value, consume shared localStorage, and default missing return paths to `/checkout?product=membership`. A completion path can consume the intended dashboard return, while another falls back to checkout. Independently, stale `sessionStorage.intended-plan=quarterly` takes precedence over the normal dashboard path and directly POSTs to the quarterly checkout endpoint from authentication.

Checkout then automatically POSTs on mount and retries failures. Changing `retryCount`, which is an effect dependency, starts another attempt chain. It has no distinction between arriving after ordinary login and intending to purchase. No trusted membership lookup protects against that unwanted action.

AuthContext ends loading before its trusted profile read completes and fabricates a member on read failure. ProtectedRoute accepts the presence of a localStorage item instead of resolved session+profile. Signup also overwrites Supabase's serialized storage with a raw JWT. These are additional source-confirmed session/race defects.

These mechanisms explain the reported class of unwanted checkout redirects; the exact owner's prior failing journey is **not replayed or conclusively attributed** to one branch. There was no failed checkout open at investigation start, no captured failing request, and the old stored purchase-intent value was not exposed by the permitted browser inspection. Current profile-console errors were empty. No live checkout endpoint was called to manufacture an error.

The production legacy handlers use their existing Stripe prices and are not controlled by the unfinished reviewed-billing flag. The previously unshipped blanket legacy-billing pause was not adopted. The underlying Stripe failure remains unverified; do not describe it as fixed or caused by NULL new-plan price IDs.

## Scoped patch

- OAuth completion has one context-driven navigation path, defaulting to dashboard; old purchase intent never triggers a payment request. New return destinations are tab-scoped, validated local paths, and consumed once.
- Password sign-in preserves deep-link path/query/hash. Ordinary login clears stale purchase hints. Registration still provides free learning.
- Auth waits for the trusted RLS-protected profile, exposes retry on failure, and discards stale account responses. Existing idempotent basic OAuth profile provisioning is retained; existing role/plan fields are not overwritten. No raw JWT writes to Supabase storage.
- Route guards use resolved session+profile, keep loading/error separate from signed-out/denied, and retain trusted admin checks. Onboarding does not force a free-learning repurchase.
- Role hook preserves affiliate/reseller/pro_reseller distinctions and stops labeling every account a paid subscriber. `hasSubscription=false` means no subscription is verified by this legacy hook; it is not a new membership entitlement source and must not be used to revoke historical learning access.
- Checkout is a review screen. Only an explicit Continue to payment click starts one legacy request. No automatic retries, fallback charges, stale quarterly overrides, or localhost debug telemetry. Account/product changes abort and ignore an outstanding result. Failure/503 messages preserve existing access; only an HTTPS Stripe Checkout destination is followed.
- A membership-success query string is a return notice, never proof of payment. Removed the false success-after-timeout presentation and missing `refreshUserData` crash. No success/cancel/error path grants roles, subscriptions, or credits.

No server, RLS, SQL, price, feature flag, CRM, commission, payout, scan, or deployment changes are part of this patch. No live session, charge, role grant, subscription grant, or credit grant was performed.

## Validation

- `node tests/auth/routing.test.mjs`: **64 assertions**, real React test renderer with synthetic Supabase/session/router/payment adapters, no external requests. Covers admin/legacy/free/partner ordinary login, password session ownership, stale intent, single callback, explicit purchase route, safe/deep returns, slow/error/retry, token refresh, account switch, logout during profile/payment requests, forged storage, explicit checkout 503, revisiting checkout without POST, and unverified success query.
- `tests/auth/tier-fixtures.test.mjs`: **16 assertions**, isolated PostgreSQL WASM using the reviewed access SQL draft: free allowance, affiliate separate from subscription, premium/reseller/pro_reseller mappings, paid-through scheduled cancellation, expiration, disabled rule fallback. Reseller/pro quotas are synthetic fixture values, not approved real offers.
- Existing security suite: **21 Python tests**, **2 authenticated-fetch tests**, **80 PostgreSQL security assertions**. Includes protected profile/RLS and forged header containment.
- Independently reran prior access-branch tests in its existing directory, without copying it into this release: **30 Python tests**, **39 SQL assertions**, including disabled reviewed billing, verified Stripe fixture mapping, webhook idempotency, invalid identity, and payment/cancellation semantics. These are draft-system tests, not proof that those APIs are deployed.
- Production build passes. `git diff --check` passes.
- Targeted lint is blocked by the existing ESLint/globals configuration error: `AudioWorkletGlobalScope ` has trailing whitespace. No unrelated tooling changes made.

Test setup (temporary registry packages, never production configuration):

```sh
npm install --prefix /tmp/rr-auth-tests react@18.2.0 react-test-renderer@18.2.0 @electric-sql/pglite --ignore-scripts --no-audit --no-fund
node tests/auth/routing.test.mjs
RR_ACCESS_SQL=/path/to/reviewed/access.sql RR_PGLITE_PACKAGE=/tmp/rr-auth-tests/node_modules/@electric-sql/pglite/dist/index.js node tests/auth/tier-fixtures.test.mjs
```

`RR_AUTH_TEST_ROOT` can override the React test dependency/output directory. Existing app dependencies are reused read-only from the prior release node_modules; no package manifest or lockfile changes.

## Limits and parent review / deployment plan

1. Review this frontend-only diff against `1a08ea1`. The simpler checkout review screen and truthful payment-return copy are visible behavior changes worth reviewing. The automatic purchase behavior is deliberately removed.
2. Do not merge the full access branch. Its 19-record legacy commission reconciliation is unresolved. No schema migration, backend rollout, billing/scans enablement, or historical-to-new paid-credit mapping belongs in this deployment.
3. After parent approval, build a preview from only this scoped commit with the existing frontend settings. Exercise browser OAuth/password login, admin/legacy free-learning deep links, refresh/back/forward, and explicit upgrade review. The automated route tests model remounts; they are not real Google OAuth or real browser-history integration tests.
4. Confirm purchase navigation stays dormant in ordinary login. Do not invoke the live payment action as a smoke test. Real Stripe checkout failure diagnosis requires authorized sanitized existing server logs or a separately approved test-mode setup; this session has live Stripe configuration.
5. Publish only after parent approval; verify new frontend release marker, unchanged backend marker, existing owner login, and disabled scans. Rollback target is frontend `1a08ea1`.
6. No entitlement data mutation is requested. If future policy maps lifetime/admin access to paid AI credits, obtain explicit owner approval and reconcile trusted historical evidence. Admin role alone does not provide paid scan credits.
