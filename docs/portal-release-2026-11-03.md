# Invoice portal release candidate — not deployed

Base: a96687257052d31933b21e9ff39d1a417e98fcce, verified remote main,
Render live deploy and public frontend marker on November 3, 2026.

Recover the deferred portal with dedicated StripeClient, pinned live account/API,
10-second network timeout and zero automatic retries. Authenticate with existing
Supabase get_user, require both server-owned rr_subscriptions mapping and exact
subscription rr_user_id metadata, reject mixed/test mode and ambiguous customers.
Do not use email matching or create customer/binding rows.

The portal must be active, live, invoice-history-only, with customer/payment-method/
subscription modifications and login page disabled. Verify every returned session's
customer, configuration, mode and return URL. No entitlement writes or return-based
access grants. Responses are private/no-store; provider errors are redacted.

Default backend remains disabled. Default frontend retains MembershipStatus.
Enabling requires RR_PORTAL_ENABLED=true, RR_PORTAL_ACCOUNT_ID matching the
reviewed live account, RR_PORTAL_CONFIGURATION_ID and a dedicated RR_PORTAL_KEY.
Frontend activation requires VITE_BILLING_PORTAL_ENABLED=true at build time.
No setting was applied. The existing legacy payment key is never reused.

## Approval needed before enabling

Create/review one live Stripe invoice-only portal configuration; provision a
restricted live key with Customers Read, Subscriptions Read, Customer portal Write,
all other permissions None. Stripe's portal Write permission also allows changing
configurations, although this app only retrieves configurations and creates
sessions. Approve secure ongoing storage on the existing Render web service;
owner must enter it without sharing in chat or opening key pages through automation.
Verify the real account context and one consenting member's existing mapping and
provider ownership, then test real authentication without a charge or metadata edit.
Missing ownership must fail closed; any repair requires a separate specific review.

This is independent of ingestion activation. No DB LOGIN, grants, webhook, worker,
new paid resource or payment is needed for invoice viewing. The existing Starter
service and gunicorn server:app remain the hosting plan. Both billing DB roles remain
NOLOGIN; the two October 29 structural migrations are present and must not be replayed.
Live ingestion remains 503/no-store. Same-instance worker supervision, resource
headroom and cross-deploy overlap remain unproven and outside this portal delta.

## Validation and rollback

Local Python 3.11.11 with unchanged production requirements: 17 portal tests,
11 existing legacy billing tests and 58 offline retention regressions passed
(86 tests total); pip check passed. An initial run using an older stack venv
failed because psycopg was absent; installing the existing requirements into
the new isolated venv resolved that environment mismatch.
Profile/portal: 45 assertions passed with each frontend flag value (90 total).
Node 22.23.4 production builds passed with flag disabled and enabled.
No production authentication or live provider session has been tested.
The completed sandbox session test used synthetic app authentication and cannot
establish real ownership. Fixture cleanup is parent-confirmed; temporary key expiry
is owner-reported.

Disable RR_PORTAL_ENABLED and the frontend flag, rebuild the frontend, and redeploy
verified previous SHA a96687257052d31933b21e9ff39d1a417e98fcce if necessary.
No schema or dependency changes are included, and no data rollback is required.
