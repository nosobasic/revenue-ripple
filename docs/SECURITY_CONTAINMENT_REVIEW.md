# Admin and sensitive-record containment — NOT DEPLOYED

Current product: Revenue Ripple is FREE. This change does not add payment gates
or restore monetization. Broader paid-feature refactoring and unrelated warning
cleanup are deferred. No production mutations or customer-row reads occurred.

## Tested local result

- 80 PostgreSQL security assertions PASS using synthetic in-memory PGlite 0.5.8.
- 13 Python authorization/quiz/community-privacy tests PASS.
- 2 authenticated-fetch tests PASS.
- Production frontend build PASS (pre-existing type-import/missing image warnings).
- Runtime recovered from existing npm cache into
  `/tmp/rr-security-validation/pglite/dist/index.js`; no dependency added to app.

Reproduce:
```
RR_PGLITE_PACKAGE=/tmp/rr-security-validation/pglite/dist/index.js node tests/security/containment.test.mjs
.venv/bin/python -m unittest discover -s tests/security -p 'test_*.py'
node --test tests/security/authenticatedFetch.test.mjs
npm run build -- --outDir /tmp/rr-security-build
```

## Important correction to initial risk interpretation

Live `payments` and `subscriptions` ALL policies have `qual=NULL` and
`with_check=true`. Reproducing their exact policy shape in PostgreSQL showed
anonymous SELECT denied, but unrestricted INSERT permitted. Do NOT claim that
anonymous financial read/update/delete was proven by those policies. The live
advisor description overgeneralized the omitted USING expression. Public users
read/update and commissions read/update are separately supported by explicit
true predicates. No real-world exploitation or API probe was attempted.

## Proposed database change

Apply `supabase/migrations/2026-10-05-security-containment.sql` only after fresh
metadata review and exact production confirmation. Scope:

1. users: revoke anonymous access and client TRUNCATE/REFERENCES/TRIGGER;
   remove Allow_read, Allow_Insert and update policies; preserve own/admin
   reads and updates; guard all protected columns including future columns.
2. Profile updates allow name, phone, company, bio, paypal_email,
   value_engine_last_seen and updated_at. Email changes must match verified
   Auth email. Admin and service-role operations remain permitted.
3. Free signup permits only the verified caller's baseline member profile;
   role/admin/payment/commission/founder fields cannot be forged.
4. payments/subscriptions/commissions/tripwire_purchases/webhook_logs:
   revoke anonymous grants and authenticated writes; remove verified broad
   policies, retain existing owner/admin SELECT policies and service-role grants.
5. user_engagement: enable RLS, revoke all direct client access. It is an inactive
   feature with no callers found in the searched checkout; session identifiers
   must remain private.
6. Remove independent column grants as well as table grants. Harden is_admin
   with a fixed search_path and explicit authenticated/backend execution.

No rows are updated/deleted by the migration. No other feature is enabled.

## Backend/frontend safeguards

`middleware/verified_identity.py` verifies bearer tokens using Supabase Auth,
rejects conflicting user IDs, and derives admin roles from the verified user's
profile. It protects admin/devops/payout/sensitive operational routes and
user-scoped service-role routes. `request_user.py` and `auth.py` delegate to it;
the command-center mock identity is removed. AI uses verified profile roles.

An origin-scoped authenticatedFetch helper updates affected browser callers.
Existing signed-in free educational access remains; no has_paid check is added.
Pregrading quiz responses omit answer keys while internal grading retains them.
Community and public success-story author projections omit private email addresses.
AI-visibility endpoints fail closed temporarily because their profile-ID ownership
checks are incomplete. This inactive feature is not enabled by this work.

Client success pages no longer assign roles/founder benefits/commissions. Signup
always proposes a free member; confirmed signin can provision a missing own
profile. Email is synchronized only after verified Auth confirmation. Legacy
payment code/history remains recoverable in Git. No paid flows were activated.

The existing Stripe webhook now fails closed on missing verifier configuration
or unpaid completion events. Broader paid-flow changes staged in
`/tmp/rr-security-validation/free_changes` were NOT copied after scope narrowed.
Do not deploy that directory.

A hardcoded third-party credential was found in server.py and replaced with an
environment reference locally. No credential was rotated; avoid printing its
value or full historical diff. Live configuration/rotation remains owner work.

## Production prerequisites / approval

Complete metadata backup is saved in the task workspace as
supabase-catalog-backup-2026-10-05.json. Its canonical content matches the captured
browser result (69 columns, 20 policies, 7 tables, one trigger). Policy/ACL drift
checks passed for the scoped migration. Signup now supplies zero commission
explicitly to satisfy the baseline policy despite the live 0.5 default.
Both deployed revisions and the configured backend credential role/project have
now been checked without displaying credentials.
Tab-bound browser access recovered. The read-only catalog query returned complete
metadata captured at 2026-10-05T21:01:59.603227Z. The observed seven tables, twenty
policies, function and trigger definitions match the planned scope; independent
column grants and target-role memberships are absent. Live users defaults include
commission_rate=0.5, a quoted member role and quoted active status. Signup explicitly
supplies member/active/plan and now zero commission to satisfy the proposed policy.
Render sign-in recovered through its existing GitHub session. Its production
service srv-d0h1n0h5pdvs73aomq50 runs commit
9fa58a4165c972e7d8bb6b20ab7e4de10a9d2b66. A read-only shell check printed only
booleans confirming the configured credential service_role claim and matching
Supabase project/URL; no alternate service key is configured. This inspects
configuration claims, not a cryptographic or customer-row API test.
Vercel production deployment eTtcAkWrpaV4t28UYhukURuCz6nC is Ready at the same
commit, verified in the signed-in Production Deployment overview.

Deploy the matching browser/backend changes with the SQL so old clients are not
left sending only x-user-id. Confirm exact deployment commits/artifacts; do not
include the pre-existing CRM changes accidentally. Sending remains unchanged.

Exact approval scope: apply the reviewed containment migration to production
project gwiqvfvcxcznecbfzlns and deploy only the reviewed security application
changes. Expected effects: anonymous sensitive-table access and client financial
writes stop; self-escalation stops; verified own-profile/admin/free learning
access remains. Old client-role assignment and unverified-email writes fail
closed. AI visibility remains temporarily unavailable. Existing records remain.

After approval: capture backup, apply transaction with lock timeout, verify
catalog/grant invariants, rerun Security Advisor, and perform legitimate owned
account smoke checks. No production synthetic writes or unauthorized probes.

## Recovery / remaining risks

Failed transaction rolls back. After commit do not automatically restore broad
policies/grants; keep restrictions and fix forward or disable affected UI.
Use metadata backup for diagnosis, not an executable insecure rollback.

Remaining work includes other RLS-disabled tables and content_items definer
view. No new paid membership predicate is imposed on educational content.
Review existing admin assignments with the owner: prior exposure could have
changed roles, but no customer/user rows were read to establish compromise.
Broader authorization review and live validation remain necessary before claiming
that the entire app is secure. CRM files and disabled sending were preserved.


## Security-only release overlay

The deployment handoff is an explicit allowlist overlay in the task workspace,
with full replacement files, per-file SHA-256 hashes, and baseline Git blob hashes.
It contains no CRM files, credentials, dependency directories, environment files,
or full historical patch (the historical server source contains a credential).
This is a reviewable source overlay, not a directly deployable full application.
Apply it to a clean checkout of the manifest base commit only after confirming
that this base matches the intended production baseline. If production differs,
reconcile the security changes against that revision before approval. Do not
publish from this dirty working directory or push unrelated CRM changes.

Repository configuration identifies Vercel's Vite `dist` frontend, and Render's
`revenue-ripple-api` service running `gunicorn server:app`. Browser API default is
`https://revenue-ripple.onrender.com`; both production revisions and the Render service ID are verified above. Local server code reads
`SUPABASE_SERVICE_ROLE_KEY`; live configured role/project claims were checked separately as described above. Never print or export its value. No dependency changes needed.

Compatibility checks before release:
- Confirm frontend `VITE_API_BASE_URL` targets the intended backend and the
  production origin is allowed by Flask CORS; preview domains are not listed.
- Confirm deployed backend's configured Supabase project and server credential
  type via safe deployment metadata; configuration names alone are insufficient.
- Release the bearer-capable frontend, then guarded backend, then SQL within a
  coordinated window. Existing cached tabs sending only x-user-id will receive
  401 until refreshed. Exposure persists until all relevant containment is live.
- Backend Auth verification depends on Supabase Auth availability and adds a
  remote verification per request. Failures deny access rather than bypassing.
- Confirm signup defaults and Auth confirmation behavior; authenticated baseline
  profile creation is allowed, arbitrary role/payment fields are not.
- Admin browser financial writes are intentionally denied by database grants;
  trusted financial mutations must use verified backend service-role routes.
- Existing admin profiles remain trusted: owner review is still required because
  prior permissive policies could have allowed role manipulation.
- Metadata migration is intentionally one-shot; named-policy/trigger drift or
  rerunning it should fail transactionally. Do not use blind retry after commit.
- Keep email sending and all existing CRM deployment/configuration unchanged.

The initial 38-file overlay is superseded by the refreshed overlay after the live
commission default correction. SQL migration content is unchanged.

All existing files in the security overlay match the deployed commit at their
pre-change Git blob baseline. The local base 66e6a49 differs from production
9fa58a4 only by docs/ACQUISITION_EMAIL_LAUNCH.md; that file is excluded from the
security overlay. No CRM working-tree changes enter the isolated release.
