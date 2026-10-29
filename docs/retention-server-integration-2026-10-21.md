# Local billing server integration

The existing `server:app` startup installs an ingestion-disabled exact-path WSGI
handler: `/webhook/retention` returns 503 and `Cache-Control: no-store`. It neither
imports optional durable/database dependencies nor opens connections. Existing
`/webhook`, checkout, content, and other routes remain owned by the existing app.

`server.create_retention_server(connect=..., provider=..., endpoint_secret=...,
policy=...)` explicitly configures durable ingress and returns the main Flask app.
The caller must supply the reviewed dedicated writer transaction factory, scoped
read-only provider, signing secret, and matching policy. Partial configuration
fails startup. Configuration after requests or repeated activation is rejected.
This factory does not discover credentials or reuse the legacy global Stripe key
or Supabase service client. It does not start a listener, worker, or scheduler.

The worker is returned by `install_retention_billing` and is also available at
`app.extensions['retention_billing']['worker']`; a separately supervised process
calls `run_once()`. The explicit wrapper now exists in `retention_billing/runtime.py`;
`worker_runtime.py` implements a bounded single-child runner with signal handling,
90-second deadline and host lock. SDK timeout 10s/no retries and DB connect 5s,
lock 5s/statement 30s limits are set by its dependency factory. Inactive Supervisor
and Gunicorn proposals plus a tested dependency version lock are under
`docs/runtime-proposal/`. Platform adoption and actual secret entry remain separate
approval gates. Merely deploying the default server keeps ingestion disabled.
No credential values, service configuration or production runtime were activated.

The new endpoint uses the isolated durable app, so its signature checks and 1 MiB
limit run independently of member session middleware and static-page fallback.
Receipt commit precedes HTTP 200. No public replay or hold-clear endpoint exists.

## Local verification and limits

58 offline/runtime tests and 27 disposable PostgreSQL 17.11 tests passed on October
21 (85 distinct tests; reruns are not added). The final runtime bundle adds 15
configuration/lifecycle cases and a fifth full-server smoke case to the previous
69-test candidate. All earlier offline cases passed again. The 27 database cases
were not rerun for the dependency wrapper/runner addition; actual TLS deployment
connections and image compatibility remain rollout gates.
This includes eight new main-server bootstrap tests and one bootstrap/receipt/
restricted-worker/entitlement database test. The main-server test extracts and
executes its actual app assignment, billing import/install, and factory AST nodes;
it deliberately does not import the full legacy server or discover its runtime
credentials. The additional five cases now import the full legacy server using
Gunicorn's actual `server:app` loader and execute in-process WSGI requests. They
found and fixed a missing factory export in `server/__init__.py`. Each runs in a
fresh credential-free interpreter with dotenv discovery disabled, urllib3's
IPv6 capability probe mocked off, and all connects, DNS and binds blocked. Real
declared dependencies were installed in a task-only virtual environment. This
verifies full module startup, default-disabled behavior, explicit factory access,
legacy webhook separation, auth guards, failure handling and body limits. It does
not verify a listening Gunicorn worker, deployment image, or live dependency
compatibility. No listener or production worker was started; synthetic lifecycle
children were stopped and reaped. The provider
uses offline transports, signatures use synthetic secrets, and content identity
and PostgREST transport remain fixture adapters. No real provider delivery or
ordinary-member browser pass is claimed.

## Release and rollback

Remote main and the public frontend marker were freshly read as
`c0dce7215b7e91253e61109d98e08ebf84916328`; backend SHA is only historically recorded.
The original dirty checkout is preserved; this source-only candidate contains its
existing work plus this integration. No commit, push, migration or deploy occurred.

Before activation: finish the authorized one synthetic sandbox subscription/payment,
cancellation cleanup and signed delivery. Extra sandbox refund/renewal charges
require separate explicit approval; refund/dispute behavior stays in isolated
replay unless approved. Inspect hosted
schema/function/ACL drift; review exact writer DDL; approve a dedicated LOGIN with
only the writer capability, restricted provider key and endpoint secret; verify
catalog/bindings; review supervisor and monitoring configuration; then obtain
approval for the exact deployment. See `retention-production-activation-checklist.md`
for exact objects, access boundaries and runtime decisions. Preview shares production dependencies and
must not serve as isolated staging. Do not replay the installed content migration.

Rollback stops the new worker and disables its endpoint, then restarts with default
`server:app` ingestion-disabled configuration. Keep receipts/evidence/holds and
restrictive content ACLs. A content-read failure may require readiness off, which
causes an outage; do not restore permissive service-role reads. No data deletion or
automated clearing of review holds is part of rollback.
