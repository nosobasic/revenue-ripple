# Acquisition and email launch handoff — 2026-09-29

## Verified live (read-only)

- SES us-east-1: production access **false**, sending enabled, quota 200/24 hours and 1/second, zero sends in the preceding 24 hours. Domain verification, DKIM and MAIL FROM are successful.
- Supabase: email tables and acquisition campaign/post/opportunity/touch/lead/conversion tables exist. Six sequences, two contacts, two enrollments (one paused, one suppressed), one recorded bounce. Initially no acquisition records. Created the active `DMD — Organic discovery` campaign (`c83156d0-b7c8-432e-a1f0-e32981a95d03`) under Donte Willis, linking to `https://www.revenueripple.org/dmd-variation-1`. No posts, opportunities, touches, leads or conversions were created.
- Deployed due-worker: Active, sending enabled, cap 200, last modified September 21. These are the pre-fix deployed workers.
- Public DMD Flask GET endpoint responds 200. This is availability, not proof of successful lead capture or inbox delivery.
- Vercel runtime logs confirm the acquisition 500: `Missing SUPABASE_URL or SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY)`. Production settings contain `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, but neither server-side Supabase variable. `ACQUISITION_INGEST_SECRET` already exists in Production (added September 22). The user added both missing server variables. Redeployed the existing production source (`1fa1fd6`) as `2MrFJxbn56FEoUR4vm4u8Fqzn3no`; deployment is Ready. Campaigns now returns expected unauthenticated 401, the import endpoint rejects missing credentials with 401, and a nonexistent tracking post returns 404 after a successful database query. The configuration failure is resolved; this redeploy does not include the uncommitted local application fixes.
- n8n: both adapted workflows exist and remain unpublished. Replaced their placeholder campaign UUIDs with the DMD campaign and set canonical `www` import URLs. The Reddit import was configured as Simplified Custom Auth. Switching to Header Auth exposed the old `Header Key` credential, whose header is `X-Auth-Token`; restored the disconnected configuration without sending it. Asked whether `Bearer Auth account 2` (created September 22) is the intended acquisition credential. Awaiting confirmation. No workflows have been executed or published.
- Local configuration uses AWS mode. The user supplied a mailing address, now saved in ignored local `.env` (email and site footer) and the active Terraform stack `.tfvars`. Deployment to Render, Vercel and AWS remains pending.

## Changes prepared locally

App repo:

- AWS-only lead capture now raises an error when the CRM/contact/enrollment cannot be persisted. Missing mode defaults to AWS; invalid modes fail instead of silently selecting GetResponse. Explicit legacy modes remain available.
- Initial Founders FIFO messages omit unsupported per-message DelaySeconds. Failed enqueue attempts propagate; retrying capture retries the existing initial enrollment without creating another row.
- One-click email headers target `/api/email/unsubscribe`; Vercel forwards that endpoint to the existing Render backend. Human-readable footer links still use `/unsubscribe`.
- Email admin API requires a verified Supabase user with `users.role=admin`. Added an authenticated Pause action and UI button. Pausing cannot recall an email already in flight.
- Retired the unsigned Flask SNS webhook (410). The configured SNS → Lambda subscription remains the event-processing path. Unsubscribe reports an unavailable database as 503 rather than false success.
- CSV restart import can explicitly activate existing paused CSV rows. Completed/suppressed enrollments are not restarted, and suppressed contacts are skipped. `--activate` deliberately also resumes previously paused CSV restart rows; review that audience first.
- Acquisition migration 002 now actually matches text/UUID transcript IDs. Existing installed databases do not need this historical migration rerun.

Active infrastructure repo: `/Users/donte/terraform-practice`

- Founders welcome still enters through FIFO; subsequent delays are persisted in `next_send_at` for the due-worker. FIFO does not support per-message timers.
- Founders worker checks enrollment status, retains disabled-send messages for retry, and reschedules sandbox rejections for the due-worker rather than acknowledging and losing the enrollment.
- Both email workers now put the backend unsubscribe endpoint in their List-Unsubscribe headers.
- Regression tests: `tests/test_email_workers.py`.

**Deployed the existing Vercel production code with corrected environment settings, created one campaign, and updated unpublished n8n configuration. The local application and AWS worker code fixes are not deployed. No workflows were activated and no emails or support replies were sent.**

## Deployment and launch order

1. Finish connecting the installed n8n discovery workflows: create a real campaign and replace the placeholder campaign UUID; use Header Auth with the same ingest secret configured in Vercel. Inspect workflow executions and remaining credential bindings. Repository templates live in `integrations/n8n`; do not assume these are already installed live. The LinkedIn template still needs an upstream scraper/CSV source.
2. Check Vercel production function logs for `/api/acquisition/campaigns`. Verify server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_KEY`), plus `ACQUISITION_INGEST_SECRET`, `ACQUISITION_PUBLIC_ORIGIN`, and allowed origins. Browser `VITE_` keys do not configure Node server functions. Keep the service role key server-only.
3. Configure the actual business postal address consistently in Render, Terraform and the site's footer. Deploy the Vercel app and Render backend together for the new unsubscribe path and Pause API.
4. Review/apply the worker changes from `terraform-practice/stacks/revenue-ripple/prod` only. Do not apply this application's leftover `infra/email` stack. The current due-worker schedule defaults to 15 minutes; the Founders five-minute step becomes eligible after five minutes and sends on the next scheduled run, not precisely at five minutes.
5. Before relying on bulk sending, harden/test the workers' shared send-cap accounting and duplicate-send behavior on failures between SES acceptance and database advancement. Current counters are not an atomic account-wide hard cap; Founders does not share the due-worker counter. Do not promise AWS a strict global cap without completing that work.
6. Use a verified, consenting test inbox to exercise capture, welcome receipt, footer unsubscribe, and an actual HTTP POST to the one-click endpoint. Existing suppressed seed contacts must stay suppressed unless their owner explicitly opts back in. A delivered SES API response is not proof of inbox receipt.
7. Create one acquisition campaign for an active DMD or Membership Mastery resource. Import one discovery, review/approve, then manually record an actual outreach send. Verify the tracked CTA, lead capture and attribution; set `ACQUISITION_ATTRIBUTION_ENABLED=true` on Render after confirming tables/functions exist. Automatic social posting remains disabled.
8. Verify a Stripe test-mode purchase and attribution using a staging setup. No real purchase is needed for this check.
9. Seek SES re-evaluation with accurate evidence. Ordinary public subscribers cannot receive SES mail while production access remains denied. SQS does not bypass this restriction. An alternative approved email provider would require a separate integration and its own approval; none was selected here.
10. Only after production approval and verified delivery, review CSV consent/suppression history, import paused, then explicitly activate the intended audience. No GetResponse day-of-cycle resume: reset email → three days → DMD lesson 1. New opt-ins: indoctrination → DMD course.

## SES support reply preparation (not sent)

The September 16 message claimed double opt-in; September 17 correctly described the present forms as single opt-in. Explain that correction explicitly. AWS did not disclose its decision criteria, so this discrepancy must not be presented as the known cause of denial.

Suggested opening:

> Hello AWS Support Team, I am following up on case 178959060600794. I need to correct my September 16 description: the current Revenue Ripple website forms use explicit single opt-in, not double opt-in. My September 17 description reflects the current process. I apologize for that inconsistency. We understand that production access remains denied and will not send to the migrated list while the account remains in the sandbox.

Then include **only after verified**:

- An example form and its consent wording, the real welcome email, and the actual sending frequency (nine welcome-series messages, then 26 lessons every two weeks).
- Dated evidence of verified-inbox receipt and one-click unsubscribe stopping future sends.
- Verified bounce/complaint suppression and the actual postal address included in messages. The current bounce Lambda does not treat every SES reject as a contact suppression, so do not repeat the earlier blanket claim about reject events.
- Actual list size, collection dates/source and available consent/suppression evidence. These were not supplied or verified during this task.
- A measured initial volume and demonstrated cap implementation, not a claim that a configuration variable alone guarantees a hard limit.
- Ask what additional verifiable evidence is needed for re-evaluation. Do not claim approval is assured.

Sources: [SES sandbox restrictions](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html), [SES best practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html), [FIFO SendMessage restrictions](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html).

## Verification

- `npm run build`
- `PGLITE_MODULE=/tmp/rr-acquisition-tests/node_modules/@electric-sql/pglite/dist/index.js node --test tests/acquisition/*.test.mjs` — all 18 pass, including UUID and text migration paths. PGlite installed temporarily, not added to app dependencies.
- `.venv/bin/python -m unittest discover -s tests/acquisition -p 'test_*.py'` — 7 pass.
- `.venv/bin/python tests/test_email_crm.py` — passes its existing script assertions; unittest discovery does not execute this file's plain functions.
- `.venv/bin/python -m unittest discover -s tests -p test_email_delivery.py` — 17 pass.
- `.venv/bin/python /Users/donte/terraform-practice/tests/test_email_workers.py` — 5 pass.

Production capture, actual sends, credential-authenticated n8n import, and Stripe end-to-end verification remain pending the credential/deployment steps above. A Terraform preview found the intended Lambda changes plus unrelated video CDN drift; prepare/apply only the email-scoped plan, after deploying the app unsubscribe route. Do not apply the full stack plan from this session.
