# Reconciled release — 2026-10-15

Local review branch: `codex/retention-visibility-reconciliation`. Nothing pushed or deployed by this reconciliation.

Baseline: current GitHub main and public frontend release metadata both identify `6651a149666c2df04d4480c18bd90200ffad667b`. The hosted backend revision is unverified; its public responses do not establish a commit.

Integrated application commits:

- `e92a8ff`: visibility source `8ad5038927e838b27d27cc01177ea0197da89706`, reconciled with current identity, membership, reporting and pilot guards.
- `175ee13`: paid retention evidence, content gates, UI and synthetic tests. Settled invoices subsequently becoming void/open now require review.
- `ed02501`: CRM source `33caf12c88415b320bc3c432c387edc5a4774a67`; guarded pilot delivery and approved nurture admission checks.

Navbar, ProtectedRoute, verified identity and legacy membership middleware remain byte-identical to the baseline. Playbooks and premium briefings are the only paid content types. Free education and explicit admin/lifetime access remain protected. Visibility fixture SQL must never replace production entitlement functions. No Terraform edits or state access occurred.

## Verification

Passed locally: 30 retention Python tests, 4 reconciliation tests, 25 visibility tests, 11 retention UI tests, 45 CRM tests, 32 identity/pilot/legacy-profile tests, 123 auth/routing assertions, 45 profile assertions, and 4 authenticated-fetch/navigation tests. Production frontend build succeeded. Missing React/Stripe/boto3 in individual test environments were resolved by using existing appropriate runtimes; affected suites then passed.

Database integration used synthetic PostgreSQL 17 data in an isolated local Unix-socket instance. This is not hosted Supabase or matching-version PostgreSQL 15 verification. No live browser matrix or hosted owner-SQL execution is claimed.

## Single consolidated access/evidence request

Use an already authorized owner SQL connection/operator for project `gwiqvfvcxcznecbfzlns` to execute `review-sql/consolidated-owner-preflight.sql` and return its bounded metadata, approved operational status and aggregate outputs. Also supply the existing backend deployment revision from its deployment record. Do not create credentials or grants. If a referenced relation is absent, report the error and stop; do not silently substitute or infer absence from REST responses.

No callable Supabase SQL connector or established background owner-SQL path is available in this executor. Browser use remains excluded by the current background-only constraint. This is an access/evidence gap, not a request to repeat previously approved inspection or billing-policy decisions. The original Advisor totals (8 errors, 16 warnings, 48 suggestions) are historical evidence; fresh warning details and current catalog exposure remain unverified.

## Release order after evidence review and deployment approval

1. Run the consolidated preflight; reconcile existing function bodies, grants, RLS, legacy entitlements and content types with the proposal. Confirm hosted backend revision and CRM paused/off state. Stop on drift.
2. Keep checkout, visibility scans and CRM sending disabled. Review exact paid-retention SQL and deployment artifacts. The proposed SQL ends in ROLLBACK and is not an executable production migration approval.
3. Deploy the reconciled backend with `RETENTION_CONTENT_READY=false`, explicitly accepting a short retention outage while old bypass routes are removed. Preserve identity and free learning guards.
4. Apply only the separately approved retention SQL transaction after a fresh drift check. Keep the new evidence tables empty unless verified billing evidence and binding ownership have been established. Never overwrite existing rr_access, rr_v_access or CRM functions with fixtures.
5. Read back grants, policies and function definitions; verify role behavior. Deploy the matching frontend. Enable retention only after end-to-end checks succeed. The event handler is not installed as a production webhook and billing ingestion remains a separate operational gate.
6. Visibility activation requires its owner's separate provider, credential, SQL and spending gates. Including its UI/API does not authorize scans.
7. CRM application changes are included, but its owner controls worker/SQL sequencing and activation. Preserve sending OFF, historical exclusions and the paused owner pilot until separately approved.

Rollback: disable retention readiness and retain restrictive database controls. Do not restore a service-role content bypass or weaken RLS. No customer migration, billing charge, email send or scan is authorized by this document.
