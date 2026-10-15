# Final local regression — 2026-10-15

Application under test: `2119056234ab4982750fd56aa0a3fd2ba6cc1e66` on `codex/retention-visibility-reconciliation`. Fresh execution, not reused pass counts. No application regression found and no runtime code changed. The only correction is the read-only preflight output minimization described below.

| Suite | Fresh result |
| --- | --- |
| Retention routes/provider/reconciliation/PostgreSQL integration | 30 Python tests passed |
| Identity, owner pilot, legacy profile, reconciliation | 36 Python tests passed (32 guards + 4 reconciliation) |
| Visibility adapters/jobs/current-app guards | 25 Python tests passed |
| CRM delivery/consent/nurture/pilot | 45 Python tests passed |
| Retention hook/state, auth routing, profile, fetch, learning navigation | 17 Node test entries passed; includes 11 retention tests, 123 auth/routing assertions and 45 profile assertions |
| Retention SQL membership/content matrix against this checkout's proposed SQL | 79 assertions passed |
| Visibility tier mapping against local visibility SQL fixture | 16 assertions passed |
| CRM SQL nurture and cadence | 2 Node tests passed; nurture reports 112 assertions, cadence exercises all 35 steps |
| Consolidated preflight | All 23 statements executed successfully against isolated synthetic PostgreSQL |

Python total: 136 passing tests. Node test entries: 19 passing across the combined UI and CRM SQL runners. Standalone SQL assertion counts above are separate; embedded assertions are not added again to test totals. Logs are in the parent workspace: `final-retention.log`, `final-guards.log`, `final-visibility.log`, `final-crm.log`, `final-ui.log`, `final-paid-sql-results.json`, `final-tiers.log`, `final-crm-sql.log`.

## Verified behavior

- Free users cannot read premium bodies; free course progress/navigation remain available. Paid users and explicit admin/lifetime users receive only published playbooks and premium briefings. Drafts, future publications and other types are excluded.
- Verified canceled subscriptions retain already-paid coverage until expiry. Failed renewal creates no extension; expiry clears UI bodies and denies API/SQL access. Legacy flags, inconsistent evidence, refunds/disputes and changed settlement fail closed for review.
- Visibility allowance/reservation/charge accounting, queued recovery, lost acknowledgements, pre-dispatch retries, expiry, timeout uncertainty, attempt/budget/concurrency limits and ownership checks pass. Ambiguous dispatched work is not blindly retried.
- CRM consent declines/missing consent fail closed; suppression and historical exclusions prevent admission. Duplicate claims/acceptance/handoff do not duplicate sends; uncertain transport outcomes do not auto-retry. SQL tests exercise rolling 24-hour cap deferral, spacing, 1,494 synthetic exclusions, paused pilot preservation and rollback.
- Navbar, ProtectedRoute and shared App/index CSS have no diff from baseline `6651a149`. Reconciliation tests additionally compare identity and membership guards byte for byte. This proves source preservation, not a fresh visual browser inspection.

## Preflight correction and audit

`review-sql/consolidated-owner-preflight.sql` uses BEGIN READ ONLY, a local 15-second statement timeout and final ROLLBACK. All intervening statements are SELECTs or that local timeout setting. It has no DDL/DML, mutation RPC, grant, credential creation or application-row export. Catalog definitions/owners/ACLs/RLS/policies/triggers, version/extension metadata and limited aggregate counts support hosted drift comparison.

Replaced individual delivery-policy rows with aggregate enabled/cap/interval values. Removed the owner email and contact-table join; the enrollment query now returns only sequence counts and paused-at-step-one count. Those aggregate counts cannot prove a specific person's pilot state, and must not be presented as doing so. No content bodies, email addresses, customer identifiers or billing records are returned. Function definitions should be reviewed privately and not pasted into public tickets.

## Limits and smallest morning step

Local PostgreSQL 17 and PGlite fixtures are not hosted Supabase PostgreSQL 15. CRM SQL tests use the CRM owner's existing candidate SQL and local contract snapshots outside this application commit; they do not prove hosted migration state. Visibility allowance tests also use local fixture SQL. No production API, provider, billing, email or browser calls were made. No push or deployment occurred. The first PostgreSQL test attempt was blocked by the local socket sandbox; the authorized local-only rerun passed all 30 tests.

The smallest next step is one owner handoff: in the already signed-in Supabase SQL dashboard for project `gwiqvfvcxcznecbfzlns`, run the revised consolidated preflight and privately provide its results (or the first error); in the existing backend hosting dashboard, copy the active deployment's commit SHA/status. No new password, token, key, grant or account is needed. If either existing dashboard is inaccessible, report that access failure rather than creating credentials. We did not open either dashboard.

Hosted SQL drift, effective exposure, current Advisor warning details and backend revision remain unresolved until that evidence arrives. Keep production changes and activation blocked; no repeat approval of already-set billing or read-only inspection policy is needed.
