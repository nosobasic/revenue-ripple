> Current release status and activation gates: [October 29 rollout](../billing-release-2026-10-29.md).

# Reviewed local runtime proposal; not installed

Implemented entry points:

- WSGI: `retention_billing.runtime:create_application()` wraps the existing main
  server. With no exact `RR_BILLING_ENABLED=true`, the default is disabled; invalid
  flag values fail startup. `server:app` continues to work unchanged and disabled.
- Worker: `python -m retention_billing.worker_runtime`. Disabled exits successfully.
  Enabled validates dependencies before starting a single supervisor loop. It
  spawns one fresh process per receipt, waits at most 90 seconds, terminates it,
  then kills/reaps after a bounded grace period. No overlapping children. SIGTERM
  and SIGINT stop in-flight work; unfinished receipts replay under their lease.
  `--max-cycles N` allows a bounded operator run without altering time limits.

The worker polls after one second normally, five seconds after error/retry/timeout.
An exclusive `/tmp/rr-retention-worker.lock` file prevents concurrent runners on
one host; the file persists to avoid unlink races but holds no secrets. Deployment
must enforce one replica across hosts. `supervisord.conf.proposed` is an inactive
example with autostart=false, bounded restart attempts and process-group cleanup.
Give the worker service only its dedicated RR_BILLING_* secrets and necessary
runtime environment; do not inherit the main application's unrelated credentials.
It is not a Render worker service or an installed Supervisor service. If the
selected platform cannot run Supervisor, translate its contract into an exact
reviewed platform manifest before activation. Resource values are proposals.

## Explicit configuration contract

Only `RR_BILLING_*` is read by the wrapper, never legacy STRIPE_SECRET_KEY,
STRIPE_WEBHOOK_SECRET or Supabase service credentials. No .env file is loaded by
the billing runtime. The legacy server retains its existing startup behavior.

| Variable | Required only for explicit activation |
| --- | --- |
| `RR_BILLING_ENABLED` | exact true; absent/default false |
| `RR_BILLING_MODE` | sandbox or live |
| `RR_BILLING_ACCOUNT_ID` | reviewed account; live must match existing policy |
| `RR_BILLING_API_VERSION` | 2025-03-31.basil |
| `RR_BILLING_PRICE_ID`, `RR_BILLING_PRODUCT_ID` | exact catalog; live must match existing policy |
| `RR_BILLING_DATABASE_DSN` | explicit host, dbname, dedicated user, password, sslmode=verify-full, sslrootcert; optional port |
| `RR_BILLING_READ_KEY` | dedicated rk_test_ or rk_live_ key matching mode; prefix is NOT proof of read-only permissions |
| `RR_BILLING_SIGNING_SECRET` | distinct whsec_ endpoint secret |

Values must come from approved runtime secure entry. No values are configured by
these files. DSN service/passfile/Unix socket fallback, ambient PG* configuration,
and known owner/service identities are rejected. Connection uses a five-second
connect timeout, lock_timeout=5000ms, statement_timeout=30000ms and transactions.
Provider HTTP timeout is ten seconds and retries are zero. Actual principal/key
privileges, CA path and TLS connectivity require separate deployment verification;
name checks cannot prove privilege isolation. Settings repr omits all secrets.

## Dependency/build decision

`requirements-runtime.proposed.lock` snapshots exact versions already installed
and successfully checked in this task's isolated smoke environment. It is a
reproducible version set for local verification, not an instruction to upgrade the
existing production app. Existing requirements.txt, render.yaml and all deployed
dependency settings are unchanged. No new package upgrade was done for this bundle.

Proposed clean-image install, only after deployed-version comparison/review:
`python -m pip install -r docs/runtime-proposal/requirements-runtime.proposed.lock`
then `python -m pip check`. Add wheel hashes/artifact digest and target-platform
build verification before release. The tested host is macOS arm64/Python 3.14.7;
Linux wheel compatibility and the current production Python version are not
verified. Preserve deployed legacy versions unless a specific compatibility
change is reviewed; re-resolve/retest the lock if they differ. The lock is not a
production dependency inventory. Stripe16.0.0 and psycopg3.3.6 are billing pins.

## Verification and operational limits

Synthetic tests cover wrapper dependency injection, disabled startup, invalid
settings, redacted representations, DB/provider limits, child completion/error,
hard-kill/reaping, shutdown and duplicate-runner exclusion. Full-server tests also
load the actual WSGI wrapper through Gunicorn's application loader. No listening
Gunicorn process or Supervisor daemon is started by these tests. All child
processes are reaped and their test-owned lock directories are removed.

No production DDL/roles, credentials, bindings, endpoint registration or deployment
is performed. The remaining provider authorization covers one synthetic sandbox
subscription/payment and cancellation cleanup only. Extra refund or renewal
charges require separate explicit approval; use isolated replay for refund/dispute
behavior until then. Production approval remains bounded by the activation
checklist, exact artifact digest, hosted preflight and runtime-image validation.
