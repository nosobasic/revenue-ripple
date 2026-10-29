> Current release status supersedes historical test/build statements below: [October 29 rollout](billing-release-2026-10-29.md).

# Production activation approval checklist — prepared only

No item below was executed. The source-only candidate is based on remote main and
the public frontend marker `c0dce7215b7e91253e61109d98e08ebf84916328`, verified on
October 21. The backend revision remains historical evidence. Freeze the final
commit and reconcile current remote/deployed drift before approving release.

## Evidence gates before an activation request

- Complete the separately authorized one synthetic sandbox subscription/payment
  and cancellation cleanup, with provider-signed delivery, redelivery and worker
  recovery. Additional sandbox refund or renewal charges are NOT authorized;
  use isolated replay for refund/dispute behavior unless separate explicit
  approval is obtained. Local signatures and offline GET fixtures do not prove
  actual provider delivery.
- Finish ordinary-member browser checks and hosted JWT/PostgREST compatibility.
  Preview shares production dependencies; use isolated matching-version staging.
- The explicit WSGI wrapper and bounded single-worker runner now exist locally,
  with synthetic startup, timeout, single-instance and shutdown tests. Inactive
  Gunicorn/Supervisor proposals and an exact local dependency version lock are in
  `docs/runtime-proposal/`. Review the selected platform translation and smoke-test
  its image before activation. No listening Gunicorn/Supervisor daemon or deployed
  dependency set has been verified; no proposal is installed infrastructure.
- Fresh owner-only preflight must inspect the four existing retention evidence
  tables, constraints, owners, RLS/policies, effective grants/default grants, all
  accessible SECURITY DEFINER functions, and intended role/schema absence. The
  SQL proposal's prerequisite guard checks only a subset of this contract.

## Exact hosted DDL/access decision

Review `docs/review-sql/retention-writer.proposed.sql` as a separate migration.
It currently ends ROLLBACK; a separately reviewed execution artifact is needed.
Do not change its terminator or execute it under this checklist. Do not replay
the already-installed paid-content migration or weaken its replay guard.

The proposal creates:

| Object/access | Exact intended boundary |
| --- | --- |
| `rr_retention_writer` | NOLOGIN, NOINHERIT, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE, NOREPLICATION |
| Schema `rr_billing_private` | PUBLIC access revoked; writer USAGE on this schema and public |
| Existing `rr_retention_catalog`, `rr_retention_bindings`, `rr_retention_evidence`, `rr_retention_review_holds` | Writer SELECT on all four; INSERT only on evidence/holds; no profile access, binding/catalog mutation, evidence update/delete, hold clearing or TRUNCATE |
| Writer RLS policies | Catalog/bindings/evidence restricted to the reviewed account; holds require an existing binding for the target user |
| `rr_billing_private.lock_bound_user(uuid)` | postgres-owned SECURITY DEFINER, empty search_path; locks only a bound user; EXECUTE revoked from PUBLIC/anon/authenticated/service_role and granted only to writer |
| `rr_billing_private.receipts` plus `receipt_due` index | RLS enabled; PUBLIC/anon/authenticated/service_role revoked; writer SELECT/INSERT/UPDATE under account policy; minimal event references, live-mode/API checks and event identity primary key |

The existing proposal pins live account `acct_1RHozW2Ku9STqdAd` and API
`2025-03-31.basil`. The reviewed default catalog is price
`price_1RI8Me2Ku9STqdAdhTw4iWhS`, product `prod_SCXRGL4GsjEZCY`, $47 USD monthly.
Confirm these against approved current provider evidence; no new provider read
or write was performed in this task. No email or checkout-metadata binding.

Separate access approvals are required for one dedicated database LOGIN,
CONNECT, and only the writer capability. Review inheritance/SET ROLE behavior,
connection TLS and effective privileges with that actual principal. The proposal
does not create a LOGIN or grant membership. Do not reuse the Supabase service
role or owner credentials. Owner-seeded exact catalog/bindings remain separate
reviewed operations; freeze binding edits during ingestion.

## Runtime and provider decisions

- Existing `render.yaml` has an empty buildCommand and starts
  `gunicorn server:app --bind 0.0.0.0:$PORT`. That target remains disabled. It does
  not install optional requirements, enable ingestion, or launch a worker.
- Review a build that installs the app requirements plus `requirements-retention.txt`
  (Stripe 16.0.0; psycopg[binary] 3.3.6), with a reproducible compatible dependency
  set. Most legacy requirements are unpinned. The local smoke version inventory
  is evidence, not approval to upgrade all production packages to those versions.
  `docs/runtime-proposal/requirements-runtime.proposed.lock` pins that tested local
  set; compare deployed versions and validate target-platform wheels/image digest
  before adopting it. Existing requirements and active build config are unchanged.
- Review the implemented `retention_billing.runtime:create_application()` wrapper,
  which calls the exported
  `server.create_retention_server` before requests, injecting the dedicated
  transactional connection factory, scoped read-only provider, endpoint secret,
  and matching PaidPolicy. It defaults disabled and reads only explicit
  `RR_BILLING_*` configuration when enabled. Missing/mismatched configuration fails
  startup. The connection factory enforces connect timeout 5s, verify-full TLS
  with an explicit CA path, and no ambient PG* or service/passfile fallback.
  Validate the actual LOGIN's grants and key permissions separately; name/prefix
  checks cannot prove privilege isolation.
- Secure owner entry and approval are needed for the dedicated DB credential,
  restricted read-only provider key and distinct endpoint signing secret. Do not
  reuse legacy global payment keys or disclose values in logs/config artifacts.
- Review the provider endpoint URL `/webhook/retention`, pinned account/mode/API
  contract, and subscribed invoice/subscription/refund/dispute events. Preserve
  the legacy `/webhook`; checkout events cannot grant entitlements here.
- Deploy one separately supervised worker initially, calling `run_once()` with
  bounded idle polling. Enforce SDK timeout 10s and no SDK retries, DB
  lock_timeout 5s and statement_timeout 30s, and worker hard lifetime 90s against
  the 120-second lease. `retention_billing.worker_runtime` implements one spawned
  child per receipt, hard-deadline termination/reaping, signal shutdown and a host
  lock. Runtime factories set the SDK/DB limits. Poll delay is 1s normally and 5s
  after retry/error/timeout. Review the inactive Supervisor proposal (numprocs=1,
  autostart=false, bounded restart attempts, group cleanup) and ensure one replica
  across hosts; flock is host-local. Review proposed 1 CPU/512 MiB limits against
  image measurements. Do not start a worker per web request.
- Approve monitoring destination and thresholds for dead receipts, oldest pending
  age, retry rate, and provider/DB failures. Log sanitized categories only. Review
  dead-letter recovery by exact account/event IDs; never clear evidence/holds.
- Approve exact ingress/worker deployment and bounded live verification audience
  only after the prior gates. No AI, CRM sending, checkout or sales activation is
  implied by this billing release.

## Rollback decision

Stop the new worker and disable its provider endpoint; restart the application
with default `server:app` so new ingestion returns 503. Preserve receipts,
settlement evidence, bindings and review holds. Never blindly roll back to
permissive service-role content reads. If necessary, disable content readiness
while preserving restrictive ACLs and acknowledge the resulting content outage.
Review pending event replay before re-enabling ingestion. No data deletion or
privilege expansion is included in rollback.
