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
- All contacts with `ses-simulator:` source or `@simulator.amazonses.com` address are excluded before joins. Consent with simulator source cannot establish human eligibility. Owner-only simulator admission tables are not queried or granted. This matches the rollout's exact simulator-address gate.

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

Browser checks are held for the safeguards task's active browser session until explicit handoff. Production integration/deployment remains a separate coordinated action after that rollout. Parent should cherry-pick this isolated commit into the then-current main and rerun focused tests/build.

Definitions supplied by the parent from:
- https://www.getresponse.com/help/what-is-click-to-open-rate-ctor.html
- https://www.getresponse.com/help/where-can-i-see-how-my-messages-are-doing.html
- https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html
- https://docs.aws.amazon.com/ses/latest/dg/faqs-metrics.html
- https://docs.aws.amazon.com/ses/latest/dg/reputationdashboardmessages.html

Validation completed locally: 16 reporting tests + 21 existing Python security tests pass; production Vite build passes. Static preview renders six cards without invalid values. Normal ESLint is blocked by the pre-existing globals package entry `AudioWorkletGlobalScope ` (trailing whitespace). Focused lint passed with only global-key whitespace trimmed in memory; repository lint configuration is unchanged.
