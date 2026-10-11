# Email CRM reporting — local review handoff

Base: `ddbd1e646eb6de5afc10c42a99e4f4f2462b16a0`. Isolated branch: `codex/email-crm-reporting`.

Adds `/admin/email-reports` within the existing admin shell and a read-only `GET /api/admin/email/reporting?days=7|30|90` Flask endpoint. Existing navbar, coach, enrollment management and authentication are preserved. No SQL migrations, credentials, grants, SES configuration, sending behavior, or production deployment changes.

## Sources and semantics

The active safeguards rollout confirmed the delivery-reliability and opt-in-gate migrations were applied. Reporting reads their existing service-readable tables without changing access. The newer migrations are not yet committed in this base checkout. The UI remains usable with unavailable states if they are absent/unreadable.

- `email_delivery_attempts`: distinct SES provider-message + recipient pairs in state accepted with `accepted_at` in `[now − days, now)`. Same person receiving two messages counts twice. Neither API retries nor legacy `email_events.sent` add counts.
- `email_provider_events`: semantically deduplicate outcomes by provider + message + recipient + outcome type; match only accepted cohort recipients. Repeated transport events therefore do not increase delivery, bounce or complaint counts. Feedback recorded before acceptance reconciliation is retained. Feedback after report generation is excluded.
- Delivery counts require Delivery events, not accepted minus bounces. Delivery rate is recorded delivered / accepted; no sends yields an unavailable rate. Outcome types may overlap, and are not a partition.
- `occurred_at` currently defaults to database ingestion time, despite its name. The UI labels it as feedback recording time, displays the latest matched record, and calls out age over 24 hours without equating low traffic with pipeline failure.
- `bounced` is permanent. `transient_bounce` combines temporary and undetermined types; final soft bounces cannot be derived. Raw campaign metrics are not SES account reputation.
- Current attempt states expose uncertain/quarantined, retryable, blocked, sending and claimed. Retryable includes budget deferrals, so it is not labeled failed delivery. These are current snapshots across recorded human attempts, not historical failure-event totals.
- Current eligibility requires active status, current human consent version, `new_optin` admission, ready/count-matching legacy manifest, no legacy hash match, and no uncertain attempt. This is permission eligibility, not enrollment/due status or enabled delivery. Missing quarantine visibility makes eligibility unavailable.
- Suppressed contacts: current unsubscribed/bounced/complained status, counted once. Review: legacy_review/existing_review admissions. Counts may overlap.
- Recent unsubscribes: currently unsubscribed contacts whose `unsubscribed_at` falls in the window. This is explicitly not complete transition history or campaign attribution.
- Legacy exclusion count reflects manifest rows, not imported CRM contacts. No address/hash/ID/name is returned to the browser.
- All contacts with `ses-simulator:` source or `@simulator.amazonses.com` address are excluded before joins. Consent with simulator source cannot establish human eligibility. Authoritative simulator admissions (enrollment_id, contact_id, run_id) must also be readable: every historical admission is excluded regardless of run expiry or later changes to address/source. Any operator-test-not-human-consent source in contacts or consent records is excluded. If the authoritative admission read fails, all human metrics are withheld. No grants were added. The currently deployed owner-only table therefore blocks live reporting until a separately reviewed read-only contract exists.

## Engagement and growth gaps

Open/click capture and per-message tracking coverage are unverified; all engagement counts/rates remain unavailable, even when delivery exists. No fixture values enter the application. The interface defines future CTR as unique content-clicked messages / accepted messages with verified click tracking and a content link; open rate as opened-delivered messages / delivered HTML messages with verified open tracking; CTOR as unique clicked / opened messages on the same both-trackable cohort. These are percentages. Unsubscribe/preferences clicks must be excluded. CTOR can exceed 100%; no inferred opens or clamping. Observed engagement will need privacy-prefetch/scanner caveats. Exact GetResponse parity is not promised.

Net eligible-list growth is unavailable without historical eligibility transitions or snapshots. No imported-list count is portrayed as acquisition growth.

Minimum separately approved pipeline work: persist actual provider occurrence and receive timestamps, bounce subtype/finality, immutable message/version and test provenance, open/click coverage version, content-vs-unsubscribe link category, and eligibility transitions. Verify SES instrumentation and applicable consent behavior before enabling it. Do not backfill fabricated events.

## Bounded reads and limitations

Reads use stable ordered 500-row pages and stop at 20,000 rows per source. Missing sources, read failures, or over-limit results make the dependent section unavailable; never emit truncated totals. Scans are intentionally conservative for this first local version, using existing grants with no new RPC/security surface. At scale, propose a reviewed aggregate query/RPC separately. Reads are not a transactionally consistent snapshot; concurrent changes may affect page boundaries. No marketing decision should rely on exact live snapshot consistency.

Supported windows are rolling 7/30/90 days in UTC; accepted daily rows are grouped by UTC date with partial first/last day. Summary timestamps display browser local time. Outcomes are as of report generation, with late recorded feedback attached to the accepted cohort on refresh. Responses are `Cache-Control: no-store`.

## Validation and preview

Run from the checkout with a Python environment containing Flask:

```
python -m unittest discover -s tests -p test_email_reporting.py -v
python -m unittest discover -s tests/security -p 'test_*.py'
npm run build
```

Tests exercise trusted-admin authorization, anonymous/member/expired/mismatched identity, missing profile/auth-store failure, bounded windows, duplicates/retries, simulator/legacy exclusion, quarantine, half-open/timezone boundaries, late/reordered feedback, multiple messages for one recipient, missing tracking, empty cohorts, page limits and absence of PII.

`tests/email-reporting/preview.jsx` renders the actual view with unavailable states offline. It makes no API calls and contains no campaign fixture metrics. The generated review artifact lives beside this checkout as `email-reporting-preview.html`.

After an explicit handoff, the offline blocked-report state was visually checked in native Chrome at desktop width and in a 390px iframe viewport. Disclosure interaction worked and text wrapped without clipping. UTF-8 metadata was corrected in the generated preview. Screenshots were saved; the preview tab was closed and the production SQL tab was left unchanged. Browser control was returned to the safeguards rollout. Full authenticated production integration and the populated KPI layout remain unverified in-browser. Production integration/deployment remains a separate coordinated action after that rollout. Parent should cherry-pick this isolated commit into the then-current main and rerun focused tests/build.

Definitions supplied by the parent from:
- https://www.getresponse.com/help/what-is-click-to-open-rate-ctor.html
- https://www.getresponse.com/help/where-can-i-see-how-my-messages-are-doing.html
- https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html
- https://docs.aws.amazon.com/ses/latest/dg/faqs-metrics.html
- https://docs.aws.amazon.com/ses/latest/dg/reputationdashboardmessages.html

Validation completed locally: 21 reporting tests + 21 existing Python security tests + 3 request-lifecycle tests pass; production Vite build passes. Static preview renders the coherent blocked-report state without invented values. Admin report instances are keyed by verified account ID, and cancelled requests cannot publish late data/errors after unmount, logout, or account switch. Normal ESLint is blocked by the pre-existing globals package entry `AudioWorkletGlobalScope ` (trailing whitespace). Focused lint passed with only global-key whitespace trimmed in memory; repository lint configuration is unchanged.


## Required integration proposal — NOT applied

The rollout owner verified there is no existing service-readable historical simulator exclusion contract. The active/unexpired `email_simulator_admitted` predicate is owner-only and would be incorrect for historical reporting. Never call operational claim/send functions to discover test identity.

Preferred minimal contract: a new read-only aggregate RPC, conceptually `email_reporting_snapshot(p_days integer) RETURNS jsonb`, with a fixed 7/30/90-day allowlist and the same aggregate response shape. Its single SQL snapshot performs `NOT EXISTS` against **all** historical simulator admissions, joining by contact and enrollment; it does not filter run status/expiry. Keep source/domain defenses and current consent/exclusion/quarantine checks. Bound output to daily and known sequence/step groups, no contact identifiers, addresses, tokens, hashes, raw payloads, or run IDs. It must not mutate tables or invoke operational RPCs.

Exact proposed privilege impact (requires separate approval and review): create a narrowly scoped SECURITY DEFINER function owned by the existing database owner, fixed `search_path=pg_catalog,public` and schema-qualified objects; REVOKE EXECUTE from PUBLIC, anon, authenticated; GRANT EXECUTE only to service_role. Keep both simulator tables owner-only, and keep the Flask verified-admin guard. No direct table grants, credentials, new roles, browser access, or sending privileges. This adds a new aggregate-only execution capability to the backend service role. Review its SQL and malicious-parameter/privilege tests before applying. No migration file or grant has been created in this branch.

Once approved and available, replace the bounded Python source scans with this one snapshot RPC. Existing useful metric logic covers accepted/delivered counts/rate, observed bounce/complaint/reject outcomes, sequence/daily groups, current eligibility/suppression/review/exclusions and operational attempts. Engagement and eligible net growth remain unavailable until their separate instrumentation/history gaps are solved. This reporting dependency does not block the safeguards deployment or bounded simulator tests.
