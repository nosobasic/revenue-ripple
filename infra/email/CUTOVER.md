# ESP cutover (GetResponse is gone)

Do not dual-send. GetResponse access is lost, so we **do not resume dayOfCycle**. Existing subscribers get an honest reset email, then DMD lesson 1 unless they reply and you pause them in admin. New opt-ins still enter indoctrination.

Founders short waits (welcome + Discord) use SQS FIFO. Everything else uses `email_enrollments.next_send_at` and the EventBridge due-worker.

**Hold the list.** Do not import or `--activate` the GetResponse CSV until SES production access is approved. `scripts/email/import_csv_restart.py` refuses writes unless `SES_PRODUCTION_CONFIRMED=true`. Keep Terraform `email_send_enabled=false` and Render `EMAIL_SEND_ENABLED=false` until then.

## Phase 0 — Copy + catalog

Indoctrination + 26 lessons + the reset note live in `email_crm/templates/`. Re-upload happens on next `terraform apply`.

```bash
python scripts/email/seed_sequences.py
```

Apply `supabase/migrations/2026-09-10-email_crm.sql` if you have not already.

Tripwire follow-up copy is shelved. While the product is free, tripwire sources enter indoctrination.

## Phase 1 — Identity + suppression

Apply `stacks/revenue-ripple/prod` in terraform-practice with `enable_email=true` and `email_send_enabled=false`. Domain, DKIM, and MAIL FROM are Success. Sandbox quota is 200/day to verified identities (the verified domain covers `@revenueripple.org`).

## Phase 2 — Sandbox seed (do this before appealing again)

```bash
python scripts/email/seed_sequences.py
python scripts/email/sandbox_seed_send.py
```

That sends the welcome email to `hello@revenueripple.org` and `donte@revenueripple.org` only, then leaves those enrollments **paused**. Confirm the mail, then click the unsubscribe link once.

Optional extra inbox (must already be a verified SES identity, or on `revenueripple.org`):

```bash
SES_SANDBOX_TO=you@revenueripple.org python scripts/email/sandbox_seed_send.py
```

## Phase 3 — Production-access appeal

Do **not** open a new case. Reply on [case 178959060600794](https://console.aws.amazon.com/support/home#/case/?displayId=178959060600794). Ask for production access at **200 emails/day and 1 email/second**. Do not claim double opt-in. Paste:

---

Hello AWS Support Team,

Thank you for reviewing case 178959060600794. I am requesting **production access** for Amazon SES in **us-east-1** at a conservative **200 emails per 24 hours** and **1 email per second** so we can deliver course emails to people who opted in on our website. We are not requesting a large sending-limit increase.

**Website / opt-in**
- Site: https://revenueripple.org
- Example opt-in: https://revenueripple.org/dmd-variation-1
- Privacy: https://revenueripple.org/privacy-policy
- Unsubscribe: https://revenueripple.org/unsubscribe

People type their name and email on our forms and consent to receive the free educational course. This is explicit single opt-in on our domain. We do not buy, scrape, or rent lists.

**What we send**
- Automated educational course delivery from `Donte from RR <hello@revenueripple.org>` on verified domain `revenueripple.org` (DKIM Success, custom MAIL FROM `mail.revenueripple.org` Success).
- A 9-email welcome series after opt-in, then a 26-lesson course at one lesson every two weeks.
- Occasional product or account updates to the same opted-in list only.
- Not cold outreach. Not purchased lists.

**Recipients / migration**
- Recipients are people who submitted forms on revenueripple.org. We are changing ESP from GetResponse to SES for that same permission-based list.
- We will **not** mail the migrated list until this request is approved. Current sending is sandbox tests to our own `@revenueripple.org` inboxes plus any new opt-ins we can deliver after production access.

**Volume and compliance**
- Start at 50–200/day with a hard application cap (`EMAIL_DAILY_SEND_CAP`). Ramp only if bounce and complaint rates stay low.
- Every message includes List-Unsubscribe / List-Unsubscribe-Post, a one-click unsubscribe URL, and our postal mailing address.
- Configuration set `revenue-ripple-prod-email-cfg` sends bounce, complaint, and reject events to SNS → Lambda, which suppresses the contact in our database. SES account-level suppression is enabled for BOUNCE and COMPLAINT.

Please let us know if you need any additional information.

---

## Phase 4 — After AWS approves production access

1. Confirm SES account dashboard shows production access enabled (not only “200 remaining” sandbox quota).
2. `SES_PRODUCTION_CONFIRMED=true python scripts/email/import_csv_restart.py path/to/contacts.csv` (paused).
3. Seed yourself again at cap 5 if needed, then `--activate` with cap **50**.
4. `EMAIL_MODE=aws` and `EMAIL_SEND_ENABLED=true` on Render. Re-apply terraform-practice `stacks/revenue-ripple/prod` with `email_send_enabled = true` and `email_from_address` matching Render.
5. Reset email sends. **Three days later** the due-worker hands off to `dmd_course_26` step 0 (lesson 1).
6. If someone replies "don't restart," pause them in Admin → Email enrollments.
7. Ramp `EMAIL_DAILY_SEND_CAP` 50 → 200.

Do **not** run `import_enrollments.py` expecting a GR resume. That path is legacy.

## Phase 5 — Cleanup

Admin → Email enrollments is the source of truth. New opt-ins: indoctrination → 26 lessons.
