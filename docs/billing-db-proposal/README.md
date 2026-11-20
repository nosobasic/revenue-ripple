# Billing database boundary — proposal, not applied

These files are review artifacts. No build, deploy, or application entrypoint runs them. Production billing stays disabled. Separate explicit approval of the final SQL and credentials is required before any hosted execution.

1. `01-boundary.sql` creates the narrow NOLOGIN capability, private receipt queue, account policies and bound-user lock. It modifies no existing catalog/binding/evidence row and does not replay the paid-content migration.
2. `02-principal.sql` stages `rr_billing_ingest_login` as **NOLOGIN INHERIT**, without a password. PostgreSQL 15 membership has no ADMIN OPTION. The role inherits the writer's privileges and can also SET ROLE into it; PostgreSQL 15 has no per-membership SET restriction.
3. `03-enable-principal.sql` is a separate credential gate, only after private unique-password provisioning and effective-privilege review. Enabling LOGIN does not activate billing.
4. `04-verify-owner.sql` checks effective grants, unrelated table/column/function/sequence denials and client isolation. `05-principal-probe.sql` checks the actual login and server TLS; client-side verify-full, approved CA and hostname still require separate verification.
5. `rollback-disable-principal.sql` removes login/membership capability without deleting receipts, evidence, bindings or holds. Stop/drain worker and ingress first; NOLOGIN does not terminate existing sessions.

## Required target metadata input

Private project identifiers, endpoints, local paths and live metadata fingerprints are intentionally excluded from this public proposal. Before any separately approved execution, the operator must verify the exact target and supply an independently reviewed four-table snapshot as session setting `rr.reviewed_retention_fingerprints` (JSON object from `catalog-fingerprints.sql`). Missing, malformed or changed fingerprints fail closed. Never generate and immediately accept a fresh snapshot automatically. The SQL is otherwise complete and ends COMMIT; its presence here is **not execution authorization**.

## Inherited rights

Shared PUBLIC CONNECT/TEMP, public schema USAGE, and six public invoker trigger functions remain unchanged. These trigger functions are not ordinary callable RPCs; their underlying DML retains caller privileges. The billing principal gets no rights on the unrelated target tables. No global PUBLIC revocation or general security cleanup is proposed. Per-role REVOKE cannot subtract privileges granted through PUBLIC. The new private objects explicitly revoke PUBLIC/client permissions before COMMIT, without changing global default ACLs.

## Validation

The separate 20-minute CI job uses an official digest-pinned PostgreSQL **15.8** amd64 image, not a claim to reproduce a provider-specific patched build. The database runs with network disabled, no published port, disposable storage and no real credentials. Tests execute proposal DDL only against that disposable database; they cover drift failure/atomicity, PG15 inheritance, staged NOLOGIN, no admin membership, effective allows/denials, inherited TEMP/trigger access, private-object ACLs, synthetic receipt/evidence writes and rollback preservation. Production snapshots are never supplied to CI. No secrets or customer data are used.

Actual hosted ACL drift, dedicated credential provisioning, Render verify-full CA/hostname/principal checks, live provider identity and exact binding rows remain production gates. No hosted SQL, live webhook, worker service or billing activation is authorized by this PR.
