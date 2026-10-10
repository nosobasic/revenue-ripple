# Independent review follow-up — local only

This supersedes the validation count and subscription-hook semantics in
AUTH_MEMBER_ROUTING_REVIEW.md. No changes have been pushed/deployed, no live
Checkout/session/webhook has been invoked, and no hosted roles, subscriptions,
credits, settings, prices, or feature flags have changed.

## Independent review

A separate code-review agent inspected actual code/tests for original frontend
commit 3cbdb25, backend follow-up, and final frontend corrections. It independently
ran the React suite and backend suite. Findings resolved before this handoff:

- Serialized SDK password/signup/logout operations. Unlike simply dropping a
  late React result, this ensures a completed logout clears a previously pending
  sign-in's SDK-persisted session. Queued logout always executes, even if followed
  by another sign-in that later fails. Stale callbacks and UI results are guarded
  by operation/generation IDs. Persistence-before-event and remount regressions
  cover both scenarios. Coordination is per mounted provider, not cross-tab.
- Restored verified email synchronization for the legacy email-based billing
  association. Existing containment rules still govern writes.
- Signup passes the submitted name as Auth metadata and uses insert-ignore
  provisioning, avoiding lost names when the auth-event profile insert wins.
  Only a basic member profile is provisioned; ignored existing profiles retain
  their protected role/plan. Metadata cannot grant roles or credits.
- Shared checkout uses stable session identity for cancellation. A same-account
  token refresh no longer aborts an in-flight purchase request.
- Subscription status in the legacy role hook is explicitly unverified:
  `hasSubscription=null`, `subscriptionStatus='unverified'`. No current paid-gate
  consumer uses it. Admin, affiliate, reseller, pro_reseller remain distinct.
- Replaced App's storage-presence login/register guard with resolved auth state
  and safe return destinations. Loading/missing/error profile stays separate.
- Payment return shows refreshed trusted account role/plan/payment status, but
  does not claim that a query parameter proves a transaction or a paid credit.
- Product lookup uses own-property checks; unsupported products (including
  dormant AI-tracker links) clearly say unavailable and cannot issue a POST.
- Added public `/membership-cancel`, explaining that returning from checkout
  changes neither subscription nor account access. It does not assert nonpayment
  from the URL; uncertain users are directed to receipts/support before retrying.
- Backend helper rejects unknown products/null roles. See its separate report.

Final independent verdict: no remaining blocker found in the reviewed local
scope; appropriate for parent review and controlled preview, not production
signoff. Real OAuth/browser history/multi-tab behavior and full billing
reconciliation remain outside the proven test scope.

## Intentional UX changes versus preserved purchase features

Required safety changes: OAuth never purchases; checkout requires an explicit
button; stale stored quarterly intent no longer overrides current login; retries
are manual; unknown products are unavailable; payment return no longer falsely
announces success after polling expires; cancellation has a dedicated safe page.

Preserved: explicit membership, quarterly and DMD use the original backend
endpoints and acquisition/referrer payload; DMD remains guest-accessible. Existing
reseller, pro-reseller and founder annual/monthly page flows are unchanged. Tests
mount those actual components with decorative dependencies mocked and verify
explicit endpoint contracts; founder's existing timer request remains.

Removed from shared Checkout: inline Stripe Elements/payment-intent rendering
and PayPal fallback. In the previous code recognized products used hosted Stripe
sessions; unrecognized products also selected the membership-session endpoint,
then tried to interpret it as a PaymentIntent. This was not a verified supported
alternative product flow. Dedicated components/endpoints still exist and are not
deleted or disabled by this patch. Prices are reviewed at existing Stripe checkout;
this patch does not advertise/activate the planned new premium scan offer.

Removed presentation: unconditional $47/default purchase pitch and automatic
redirect spinner. Replaced with product-specific explicit purchase review and
existing-access links. This visible UX change is for parent approval.

## Final validation

- `node tests/auth/routing.test.mjs`: **123 assertions passed**; synthetic adapters,
  actual React components, no external requests. Includes late SDK auth responses,
  persistence-aware logout/remount, newer failed login, signup, email sync, profile
  missing/error/retry, forged storage, role distinctions, safe/deep returns,
  stale intent, duplicate click, refresh, account/logout races, 503, successful
  Stripe destination, product allowlist, cancel/success, specialized contracts.
- Python `tests/billing`: **11 tests passed**, including 80 ordinary transition
  subcases and seven admin-product subcases; actual server function bodies and
  real Stripe SDK HMAC verification using synthetic local payloads.
- Existing security: **21 Python tests**, **2 authenticated-fetch tests**,
  **80 isolated PostgreSQL assertions** passed.
- Reviewed access SQL fixture mapping: **16 assertions** passed; draft rules,
  not deployed new paid entitlements or universal historical reconciliation.
- `npm run build` and `git diff --check` pass. Existing ESLint globals error
  (`AudioWorkletGlobalScope ` trailing whitespace) remains a tooling limitation.

Commands and temporary dependency setup are in AUTH_MEMBER_ROUTING_REVIEW.md;
backend command is in LEGACY_PROFILE_PRESERVATION_REVIEW.md. No dependency manifest
or lockfile changes are included.

## Separate deployment scopes / remaining gaps

Frontend requires original 3cbdb25 plus this frontend follow-up; it can be
cherry-picked without the backend-only commit. Backend protection is independently
reviewable and requires a separately approved Render deployment. Neither needs
SQL/data changes, price changes, billing/scans activation or CRM changes. Vercel
release.json is generated with the frontend commit. Verify Render's release marker
only changes when that backend deployment is explicitly approved.

Remaining: original Stripe Checkout failure uncaptured; cross-tab checkout and
manual retries lack server idempotency; specialized pages retain their existing
concurrency/URL handling; legacy commission/email/subscription effects are not
webhook-deduplicated; out-of-order paid events can change ordinary roles; cancellation
expiry is not implemented; payment-email identity association remains legacy;
CAS misses protect admin/lifetime but need operational reconciliation. Do not
claim all historical tiers reconciled or merge the full unfinished access branch.
