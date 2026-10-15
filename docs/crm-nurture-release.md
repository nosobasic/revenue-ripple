# Approved nurture runtime integration

This change aligns the application's guarded delivery runtime with the reviewed
canonical Lambda runtime. Nurture delivery requires a matching bundle allowlist,
an unexpired database admission bound to the attempt, claim token, recipient,
subject and template hash, plus the existing pre-send database gate. Missing
configuration blocks transport. Existing pilot and simulator guards are preserved.

The signup handlers already call `email_capture_optin` only for explicit consent
version `free-education-2026-10-06`. Tests verify the three DMD source aliases
normalize to `digital-marketing-domination`, missing/declined consent never
captures, malformed consent fails, and capture errors do not fall back to a legacy
provider. These tests use real handler code with mocked external services.

No email copy, templates, signup UI, credentials, schedules or database policy
are changed by this application branch. The exact approved 35-email bundle is
staged separately in the canonical Terraform repository. Scheduled nurture sends
use the Lambda S3 template loader; the application's legacy local template loader
is not enabled as an alternative nurture sender.

Release prerequisites: fresh owner-SQL function/ACL comparison; coordinated
canonical runtime/template and SQL migration; verified deployed backend revision.
Keep application sending and nurture transport disabled. Preserve all 1,494
historical exclusions, the completed owner pilot paused at step 1, the 50 per
rolling 24-hour cap and at least one-second pacing. No historic backfill.

Activation is a separate operation requiring the approved bundle, a specific
fresh-opt-in cutoff and controlled due-worker gate changes. Do not enable FIFO
or founder enrollment as part of this sequence. Rollback starts by closing all
gates; preserve accepted/uncertain attempts and never blindly retry them.

Offline verification (Flask and boto3 installed in the test environment):

```sh
python -m unittest discover -s tests -p 'test_*delivery*.py'
python -m unittest discover -s tests -p 'test_consent_routes.py'
python -m unittest discover -s tests -p 'test_nurture_runtime.py'
python -m unittest discover -s tests -p 'test_email_human_pilot.py'
```
