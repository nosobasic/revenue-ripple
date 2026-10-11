# Email CRM reporting — local review handoff

Base: `d53a111405487f4948b33f562117ae5edeae33b9` (final deployed safeguards). Isolated branch: `codex/email-crm-reporting`. Nothing in this branch has been pushed, deployed, or applied to production.

## Delivered

Adds `/admin/email-reports` inside the existing admin shell and `GET /api/admin/email/reporting?days=7|30|90`. Preserves navbar, coach and existing auth. Six overview cards, compact list health, sequence/message and UTC daily trends, operational details, definitions and freshness. Desktop cards use three columns, tablet two, mobile one. Missing/unapproved RPC produces one coherent setup notice, never invented zeroes.

The request path uses one aggregate RPC with the already verified caller JWT. The older Python source aggregator remains only an offline reference for regression tests; it is not a production fallback. Requests are no-store, abort on unmount and cannot publish stale responses after account changes.

## Exact database approval scope — NOT APPLIED

Candidate: `docs/review-sql/email-reporting-snapshot.sql`.
Function: `public.email_reporting_snapshot(p_days integer DEFAULT 30) RETURNS jsonb`.
SHA-256: `152cca346aef0d10e94cf91bf789879037a2f0a958145b3a136b38afe365f9e9`.

Plain-language permission request: allow signed-in, currently authorized Revenue Ripple administrators to retrieve only the aggregate email report through this one read-only function. The database itself rejects members, anonymous callers and the service-role principal. This is a new privileged aggregate read capability and needs separate approval before production application.

Exact privilege changes:

- SECURITY DEFINER function owned by existing `postgres`; STABLE, fixed `search_path=pg_catalog,public`, UTC, schema-qualified source tables.
- Revoke function execution from PUBLIC, anon, authenticated and service_role, then grant EXECUTE only to authenticated.
- Require `auth.role()='authenticated'`, non-null `auth.uid()`, and the current protected `public.users.role='admin'` row for that subject. No caller-supplied ID, admin boolean or metadata role is accepted.
- Direct invocation by authenticated clients is possible, but the database admin guard always applies. Flask independently verifies the caller with Supabase Auth and checks current protected profile role.
- The existing server service credential is only the gateway apikey header. Authorization contains the verified user's JWT. The shared service client is never mutated.
- No direct table grants, credentials, new roles, sending permissions, table writes, tracking grants or operational RPC calls.

Owner-context reads: `users`, `email_contacts`, `email_optin_consents`, `email_launch_admissions`, `email_legacy_manifest`, `email_legacy_exclusions`, `email_enrollments`, `email_delivery_attempts`, `email_provider_events`, and `email_simulator_admissions`. Simulator tables remain owner-only; `email_simulator_runs` is not read. All admission history is used regardless of run state/expiry.

Output contains counts, allowlisted sequence names, bounded steps, dates/timestamps and readiness. No contact addresses, names, IDs, hashes, run IDs, tokens or provider payloads. The API rebuilds an allowlisted response and rejects malformed aggregates. Windows are restricted to 7/30/90 days; output is bounded to days+1 daily rows and 707 sequence/step groups. Source scan work is not capped by row count; production-scale performance still needs integration observation.

## Metric semantics and exclusions

- Accepted: distinct SES message + recipient pairs in accepted state within the half-open rolling UTC window. One person receiving two messages counts twice; retries and legacy sent events cannot add counts.
- Delivered: matched Delivery feedback, not accepted minus bounces. Delivery rate is delivered / accepted; an empty denominator is unavailable. Outcomes may overlap.
- Feedback is semantically deduped per message/recipient/outcome. Reordered feedback before acceptance reconciliation is retained; future feedback is excluded. `occurred_at` is currently recording/ingestion time, not verified provider occurrence time. Freshness is labeled accordingly.
- Recipient disagreement between a cohort message and its feedback fails closed for reconciliation instead of showing false zero delivery.
- Permanent bounce, non-permanent bounce (temporary or undetermined), complaint and reject follow the accepted cohort. Final soft-bounce classification is unavailable.
- Operations are current attempt-state counts: uncertain/quarantined, retryable, blocked, sending and claimed. Retryable includes budget deferrals and is not labeled delivery failure.
- Eligibility requires active status, current explicit consent version/capture, new-optin admission, sealed count-matching legacy manifest, no legacy exclusion and no uncertain attempt. This is permission eligibility, not enabled sending or due enrollment.
- Suppression is current unsubscribed/bounced/complained status counted once. Review includes legacy/existing review admissions. Counts may overlap.
- Recent unsubscribes means currently unsubscribed contacts timestamped inside the window, not complete transition history or campaign attribution. Legacy exclusion count is manifest addresses, not imported contacts.
- Exclude all historical simulator admissions by contact and enrollment, even expired/disabled runs or subsequently edited identity. Also exclude simulator domain, contact/consent simulator or operator-test source and simulator template snapshots. Missing authoritative history prevents reporting. Never invoke operational claim/send functions to discover test identity.
- One SQL statement supplies the snapshot. Late recorded outcomes attach to the accepted cohort on refresh. Dates group by UTC with partial first/last days; summary timestamps display browser-local time.

## Tracking gaps

Open/click capture and message-level coverage are unverified, so engagement counts/rates remain unavailable. Net eligible-list growth remains unavailable without eligibility transition history.

Future definitions supplied by parent: CTR = unique content-clicked messages / accepted messages with verified click tracking and a content link; open rate = opened-delivered messages / delivered HTML messages with verified open tracking; CTOR = clicked / opened messages within the same both-trackable cohort. Exclude unsubscribe/preferences links. CTOR may exceed 100%; never infer opens or clamp. Observed engagement needs privacy-prefetch/scanner caveats. Exact GetResponse parity is not claimed.

Minimum separate pipeline proposal: actual provider occurrence plus ingestion timestamps, bounce subtype/finality, immutable message/version/test provenance, open/click coverage versions, content vs unsubscribe link categorization, and eligibility transitions. Verify SES instrumentation and consent behavior before enabling. No fabricated backfill.

## Validation and evidence

62 tests passed: 27 Python reporting/API tests, 21 existing security tests, 3 request lifecycle tests and 11 actual PostgreSQL contract tests. Production Vite build passed. New report components pass focused lint with the pre-existing installed globals key whitespace normalized only in memory; repository lint configuration is unchanged. Admin.jsx retains exactly its base 7 errors and 3 warnings, unrelated to the added route/nav entry.

The PostgreSQL suite creates a private Unix-socket-only temporary cluster, applies this exact SQL to test tables, exercises actual role permissions and separate JWT-claim sessions, and stops/removes the cluster. No production DSN/env is read. Coverage includes forged metadata, member/anonymous/service-role denial, revoked admin role, no actor argument, window bounds, deduplication, reordered/future events, quarantines, legacy exclusions, expired simulator history, changed enrollment identity, read-only transactions and output privacy.

```sh
python -m unittest discover -s tests -p 'test_email_reporting*.py'
python -m unittest discover -s tests/security -p 'test_*.py'
node --test tests/email-reporting/request.test.mjs
python tests/email-reporting/run_postgres.py --pg-bin /path/to/postgresql/bin --preview-json ../populated-fixture.json
node tests/email-reporting/render_preview.mjs ../populated-fixture.json ../preview/populated-reporting-preview.html
npm run build
```

Offline populated preview uses actual SQL output and the API sanitizer, clearly marked SYNTHETIC FIXTURES / NOT PRODUCTION. Fixture totals: 8 accepted, 6 delivered, 75%; sequence/daily disclosures checked in native Chrome. Desktop layout and initial 390px mobile viewport inspected. A later mobile scroll failed because the browser window became unavailable; deeper mobile scrolling is not claimed. The blocked-state preview was also checked earlier. Full authenticated live integration is unverified.

Populated screenshot: `../email-reporting-populated-desktop.png`.
Verified Library ID: `libfile_bc413edfda04819196219c879c5daa1a` (read back successfully).
Preview: `../preview/populated-reporting-preview.html`; mobile wrapper: `../preview/populated-reporting-preview-mobile.html`.
Local preview server stopped; browser returned to rollout owner. Local preview tab may remain open after the window became unavailable. Production SQL UI unchanged.

Remaining blockers: separate approval/application of the exact SQL permission contract and coordinated app deployment; then authenticated integration verification. No campaign activation is part of reporting. Opens/clicks and net growth need separately approved instrumentation/history work.

Definition references supplied by parent:
- https://www.getresponse.com/help/what-is-click-to-open-rate-ctor.html
- https://www.getresponse.com/help/where-can-i-see-how-my-messages-are-doing.html
- https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html
- https://docs.aws.amazon.com/ses/latest/dg/faqs-metrics.html
