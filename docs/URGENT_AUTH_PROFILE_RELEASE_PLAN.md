# Separate first release: login, mobile Profile, historical identity protection

2026-10-10. Local preparation only. No push, deployment, configuration, credential,
data or migration changes. Full billing lifecycle work is not a dependency of
this urgent release.

## First-release behavior and exact scope

- Ordinary admin/member sign-in goes to a safe requested route or dashboard;
  stale purchase intent cannot initiate checkout. Existing explicit purchase
  journeys remain deliberate clicks, not effects of authentication.
- Trusted profile loading/error stays distinct from nonmembership; admin/lifetime
  identity remains intact. Free learning remains available.
- Responsive Profile shows `Account role` and `Recorded plan` from the trusted
  profile, separately from Stripe billing. No claim these fields prove a current
  paid subscription; no paid scan credits are inferred.
- New `MembershipStatus.jsx` is static account/support presentation. Profile
  imports it instead of the portal prototype. It says online billing management
  is not available, preserves existing access, says no repurchase is needed,
  and links to learning/support. It makes **zero billing API calls**. This does
  not depend on a missing backend route, an environment flag, or Stripe returning
  an error. The unconnected portal prototype remains available only for later
  review/tests and is not imported by Profile.
- Separate backend guard preserves admin/lifetime identity when verified legacy
  checkout webhooks arrive. It does not activate lifecycle revocation or credits.

## Cherry-pick sequence / exclusions

Frontend release, from freshly verified frontend/main baseline
`1a08ea101e16ede86d19840fc1034c01db5e14e7` (rebase/review if it has advanced):

1. `3cbdb25` — primary auth/profile/guard/explicit-checkout routing repair.
2. `28b907d` — dependent auth serialization, stale-operation and success/cancel fixes.
3. `4761abf` — responsive Profile + narrow profile-save error/logging fix and tests.
4. This first-release status-only follow-up commit — Profile imports static
   MembershipStatus, tests distinguish live Profile from deferred portal prototype.

Do not deploy step 3 by itself. It originally connected the portal prototype.
Do **not** cherry-pick `dc79387` (portal backend) or `0bcc598` (portal ownership /
future lifecycle review) into this urgent deployment. Those stay deferred.
`4761abf` needs the two frontend auth commits but no new backend API, SQL, Stripe
configuration or portal commit. Its historical review document describes deferred
portal functionality; this plan controls the urgent release scope.

Backend release, independently based on verified deployed Render commit
`7240a35d6d65f687c3372d987f104eb338327b74`:

- Cherry-pick only `4445538` — middleware/legacy_membership.py, server.py webhook
  guard changes, tests/billing/test_legacy_profile.py and its review document.
- Existing server.py, middleware and requirements are identical between that
  backend commit and frontend baseline 1a08ea1, so this patch has no dependency
  on the frontend or portal commits. Confirm the actual cherry-pick diff before
  building; do not deploy the entire working branch to Render.

Excluded: new subscription/scan offer, portal endpoint/config activation, data
backfills, RLS/grants/schema changes, CRM changes, prices, new keys, commission
reconciliation and the unfinished full access branch.

## Checks before/after separately approved deployment

- Verify remote main and both deployed release markers again; use isolated clean
  release branches/checkouts, review only selected commits and build outputs.
- Frontend: 123 auth assertions; status-only Profile tests; build; whitespace
  check. Browser verify 320/375/390px, labels/focus, edit/cancel/save error state,
  ordinary admin/legacy login, signed-out deep-link return, slow/error retry,
  refresh/back/account switch and no automatic `/create-*-session` or `/api/billing`
  requests. Existing authenticated owner smoke is read-only; real OAuth if the
  owner authorizes/finishes sign-in. Never create a live payment session for QA.
- Backend: synthetic real-signature legacy webhook tests (11 tests, including
  ordinary transition and admin-product subcases); security regressions; no live
  webhook replay. Verify missing/invalid signature rejection without valid
  production payment payloads. Inspect deployment health/release marker after
  approval, not by invoking a live paid event.
- Roll out frontend and backend separately with explicit approval; verify the
  changed service's marker and the other service's unchanged marker. Confirm
  scans disabled, owner trusted admin/lifetime fields unchanged, and no portal
  route/config included. Retain baseline rollback commits. Do not roll back DB
  because no DB changes belong to this release.

## Minimum later owner decisions — recommended defaults, not adopted policy

These decisions gate future subscription management, **not this first release**.

| Decision | Recommended starting policy | Effect |
| --- | --- | --- |
| Cancellation timing | Self-service cancellation at paid period end; no new renewal. Immediate cancellation is support-reviewed; explicitly pair its benefit cutoff/refund decision. Honor remaining paid time when no refund/cutoff agreement exists. | Existing covered recurring benefits continue to the agreed end; admin/lifetime/free learning and independent program roles are untouched. |
| Failed-renewal grace | Seven calendar days after the last verified paid-through boundary, only for previously paid recurring memberships. Never restart the clock on repeated failures; do not mint new consumable credits during grace. | Show payment issue and a clear deadline; after grace pause only the recurring benefits. Restore them from accepted payment evidence, not a return URL. No grace-based first-payment/trial grants. |
| Downgrades / proration | Start with self-service plan switching disabled. When implemented, schedule downgrades at period end, with no mid-period prorated refund. Keep upgrades support-reviewed until paid/proration transitions are tested. | Avoids unexpected invoices and mixed benefit periods. Stripe's period-end downgrade support depends on product structure; do not assume every legacy tier qualifies. |
| Refunds / disputes | Support-reviewed initially. A full refund of a current recurring period normally ends only that refunded period's recurring benefits at the approved effective time; partial refunds/disputes require an explicit decision. Do not automatically refund on period-end cancellation. | Prevents a partial refund or dispute event from erasing lifetime/admin/program access or granting/revoking unrelated benefits. |

Confirm the actual historical products/benefits and documented trials before any
mapping migration; preserve existing terms, do not invent trials, credits or scan
quotas. These recommendations need owner approval and are not assertions about
current Stripe settings. [Stripe portal configuration](https://docs.stripe.com/customer-management/configure-portal)
and [cancellation documentation](https://docs.stripe.com/billing/subscriptions/cancel)
explain provider capabilities; application benefit policy remains an owner decision.

## Useful read-only state now

Trusted profile can truthfully show role, recorded plan, and existing learning
availability. A legacy paid/purchase flag may be labeled historical if needed,
but must not be presented as current Stripe status, paid-through date, next charge,
active auto-renewal or cancellation state. New rr_subscriptions has no rows for
the exact owner; say billing verification/link is unavailable, not unpaid/free-tier
only/nonmember. Avoid adding an API merely to expose unverified purchase rows.

## Recovering rightful existing Stripe relationships without repurchase

Yes: once authorized provider access works, inspect an exact known subscription,
customer, session, invoice or original server order reference. Historical
subscription `rr_user_id` or Checkout client_reference_id can be strong evidence
**only if its originating code set it from verified backend identity**, and its
account/mode, customer/subscription and database record agree. Arbitrary metadata,
current email matches and founder email attribution are not sufficient.

Provider records, original receipts/order references and authenticated account
history can support an owner-reviewed linkage even when trustworthy metadata is
absent. They are reconciliation evidence, not automatic account ownership proof.
Resolve ambiguity and shared customers before authorizing the whole customer
portal; record provenance in a separately approved mapping change. Do not make
customers buy again to manufacture linkage, create duplicate customers, rewrite
metadata to fabricate evidence, or automatically enumerate/search users by email.

Local Stripe configuration/webhook reads previously returned 401. No retries with
new keys, credential creation or new access setup were performed. Full provider
mapping/config validation remains unavailable until existing authorized access is
restored by the owner.
