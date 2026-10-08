# Owner pilot preparation release

Based on remote security commit 25bdce31c9537f8d36f059a15b644e1598164e7a.

This release updates the homepage and planned offer, adds owner-only preparation
status, and routes the inactive AI pages to preparation status. Scans remain off.
The backend verifies the bearer identity remotely and requires the confirmed
owner email. Client role/email headers cannot grant access. No scan endpoint is
introduced. Existing legacy payment handlers, free learning, auth implementation,
SQL, credentials, and unpublished CRM work are excluded from this release.

Validation: 21 Python security tests, two authenticated-fetch tests, 80 local
PostgreSQL security assertions, production build, and desktop/mobile Chromium
checks with synthetic sessions and mocked external APIs. Browser checks cover
accurate offer copy, responsive layout, login redirection, owner preparation,
non-owner denial, disabled scan controls, and free-learning navigation.

Verify /release.json on the frontend and /api/visibility-pilot/release on the
backend against the deployed Git commit. The latter reports RENDER_GIT_COMMIT
when available. A successful Git push alone is not deployment verification.

AWS quota and restricted credential provisioning remain launch dependencies.
No purchase, provider call, email, payout, or actual owner login was performed
by these tests. Hosted SQL is managed separately and is not rerun here.
