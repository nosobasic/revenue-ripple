# Profile settings and existing-customer billing portal — local review

Date: 2026-10-10. Local only; no live Stripe sessions, customers, charges,
subscription mutations, configuration changes, entitlement writes, deployment,
or security-policy changes were performed. Original dirty checkout is untouched.
This follows the three separate auth/legacy-protection commits documented in
AUTH_PAYMENT_FOLLOWUP_REVIEW.md.

## Behavior

Profile now uses scoped responsive CSS, a growing header (shared dashboard CSS
previously fixed it at 150px), associated labels, 44px-minimum controls, visible
focus rings and inline save/error announcements. Existing editable profile fields
remain name/email/phone/company/bio. Role and plan are read-only account facts.
Profile payload logging was removed; the existing profile-save error typo now
throws the actual Supabase error. Email confirmation remains handled by Auth.

Membership management is separate from learning/admin/legacy access. GET status
never creates a portal; only an explicit button click POST can create one. No
linked customer is not a repurchase instruction. Errors and 15-second timeouts
produce retry/support state, including if the SDK session lookup stalls. Old
responses after account changes/unmount cannot redirect. Return query strings do
not grant access or confirm payment. No payment amounts or customer IDs are
returned in status, and responses are private/no-store.

Role-specific optional upgrade links are preserved (affiliate -> /special;
affiliate/reseller -> /affiliate-centre/tools). Admin/member/pro_reseller do not
see those upgrade prompts. Removed unsupported blanket commission/premium claims.
Quick-action destinations remain unchanged.

## Backend contract and trust boundary

- `GET /api/billing/status`: remotely verify Supabase bearer token, query only the
  verified user ID in `founders_annual_members` and `rr_subscriptions`.
- `POST /api/billing/portal`: repeat verification/resolution; require exact
  production frontend Origin; accept no client customer, email, identity,
  configuration, or return parameters.
- Existing service-written founder customer/subscription mappings and new
  subscription mappings are the only ownership source. Resolve subscription IDs
  with Stripe, require one consistent customer, reject deleted/ambiguous/malformed
  mappings and lookup failures. Never search by email or create a customer.
- Missing mappings -> `not_linked`; missing tables/DB/provider/configuration
  failures -> `unavailable`. Neither changes any account access.
- Explicit server `STRIPE_PORTAL_CONFIGURATION_ID` required; retrieve existing
  configuration, require active and customer-mode match. No default-configuration
  fallback and no configuration activation/update.
- Return URL fixed to the request's allowed Revenue Ripple origin plus
  `/profile?billing=returned`; only HTTPS `billing.stripe.com` navigation accepted.
  Production-only origin allowlist intentionally excludes previews/localhost.

The implementation follows Stripe's [authenticated customer portal integration](https://docs.stripe.com/customer-management/integrate-customer-portal)
and [session creation API](https://docs.stripe.com/api/customer_portal/sessions/create).
The available customer actions depend on the [portal configuration](https://docs.stripe.com/customer-management/configure-portal).

## Verification

- 12 new mocked backend portal tests (23 total billing tests) pass: unauthenticated,
  invalid token, identity mismatch, exact owner lookup, forged parameters/headers,
  no linked mapping, founders mapping, no GET session creation, pinned origins,
  ambiguous/deleted customer, bounded lookup, missing/inactive/wrong-mode config,
  provider failure and hostile redirect.
- 38 synthetic React Profile/portal assertions pass: accessible fields, edit/save,
  no initial payment action, retry, role-specific links, account-switch late
  response, portal URL rejection, bounded status and portal SDK stalls.
- Regression: 123 auth/routing assertions; 21 Python security tests; 2 authenticated
  fetch tests; 80 isolated PostgreSQL containment assertions; 16 draft tier fixture
  assertions. The tier fixture is not proof of deployed historical reconciliation.
- Production build passes; git diff whitespace check passes.
- Chrome rendered actual Profile + Navbar with synthetic auth and billing adapters,
  real CSS, long name/email, and CSP `connect-src 'none'`. At 320, 375 and 390px,
  DOM document scrollWidth exactly equals viewport width; profile controls measured
  at least 50px tall. Screenshots inspected at each width. At 320px caught/fixed
  clipped header. At 375px exercised edit/save and mocked portal failure; at 390px
  exercised retry. No live Stripe navigation. Preview builder is
  `node tests/profile/build-preview.mjs` after `npm run build`; outputs only to
  `/tmp/rr-profile-preview`, including no real user or credential data.
- Independent review found no authorization blocker and reran the first 36 React
  assertions / 23 billing tests. Its session-lookup timeout caveat was subsequently
  fixed with a race bounding the whole operation, with two more passing assertions.
  It did not independently rerender mobile or certify deployed mappings/config.

## Dependencies, limits, and scoped deployment plan for parent review

1. Preserve earlier commits separately: 3cbdb25 auth checkout routing; 4445538
   verified legacy webhook identity preservation; 28b907d auth/race follow-up.
   This portal/Profile work does not require the unfinished access branch.
2. Frontend scope: Profile.jsx/Profile.css, MembershipBilling.jsx and the narrow
   AuthContext logging/error fix. Requires authenticatedFetch already on main.
   If backend endpoints are absent, UI reports billing unavailable without
   redirecting to purchase. Verify final frontend release marker after approval.
3. Backend scope: billing_portal.py plus server blueprint registration. Existing
   Flask/Stripe/Supabase dependencies suffice; no package or schema changes.
   Both mapping tables must exist and deployed write containment must be verified
   before enabling. Missing either table intentionally fails closed, even if the
   other has a valid mapping. Existing legacy email-only members may need an
   owner-approved trusted customer mapping reconciliation; never populate by
   guessing or email-only Stripe search.
4. Configuration dependency: owner/parent must choose and review an existing
   portal configuration for the intended Stripe account/mode, then separately
   authorize setting STRIPE_PORTAL_CONFIGURATION_ID. No live configuration was
   inspected/changed here; absence from local code is not proof of Stripe-account
   misconfiguration. Existing Stripe key/environment remains untouched/live-mode.
5. **Do not enable subscription cancellation/plan updates on the assumption that
   application access automatically reconciles.** Current shipped legacy backend
   does not implement full cancellation/expiry/upgrade reconciliation. Review
   allowed portal features first (e.g. limited billing/payment-method management),
   or approve a separate lifecycle project. Portal session creation itself grants
   no app role/subscription/credits. Admin/lifetime access must remain independent.
6. Real Stripe portal smoke test requires explicit owner-approved action after
   deployment/config review; only mocked Stripe responses were used here. Customer
   metadata, current invoices, and real subscription actions were not inspected.
   Custom Stripe portal domains are not supported by this pinned-host version.
7. No deployment/push authorized. Review and deploy backend/frontend separately,
   run signed-in ordinary/profile/admin and billing-unavailable smoke checks,
   verify origins/release markers, retain rollback commits. No security/RLS,
   scan flag, paid billing offer, price IDs, credits, or CRM activation changes.

Remaining original investigation limits persist: exact prior checkout failure
not captured; broader legacy commission/event-order reconciliation unresolved;
no claim all historical subscriptions map correctly. Do not deploy the full
unfinished access branch (19 commission records remain unresolved).
