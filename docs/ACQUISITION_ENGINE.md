# Acquisition Engine

## Audit before implementation

The existing Content Engine remains at `/admin/content-engine` and owns:
- `video_transcripts`: imported lesson text, titles, topic tags.
- `content_gaps`: topic coverage and prioritization.
- `generated_videos`: scripts, generation status, Synthesia/Vimeo asset references and history.
- `content_activity_log`: the existing content pipeline's constrained audit events.
- `api/lib/openaiClient.js`: shared AI client and JSON parsing.
- `api/lib/supabaseAdmin.js`: shared server-side database client.
- `api/content/*` and `ContentEngine.jsx`: gap analysis, lesson generation, status, and asset display.

No separate brand-context model or general asset editor was found. The existing Revenue Ripple educator context is extracted into a shared constant without changing the lesson-generation prompt. Acquisition reads generated videos and transcripts by reference; it does not copy assets, generate lessons, render videos, or replace the Content Engine. Acquisition history records promotional variants, not another asset library.

Existing funnel pages submit UTM values to Flask. `email_crm/deliver.py` handles nurture; the verified Stripe webhook handles purchases. Small additive hooks attach acquisition touch references to these existing flows. Existing affiliate tracking remains independent.

## Boundary

Existing Content Engine / active lead magnets + n8n discovery → Acquisition opportunity and response draft → review and approval → manual outreach → tracked CTA → existing funnel → nurture → verified purchase → attribution feedback.

Automatic posting is disabled. n8n imports discoveries and responses from the supplied workflows. Acquisition reuses existing posts, approvals, revisions, campaigns, and tracking; it does not create another content engine. Potential prospects are not counted as acquired leads until they enter a funnel.

## Installation and n8n setup

Apply corrected `002_acquisition_engine.sql` then `003_acquisition_manual_outreach.sql`. The corrected foreign key matches the existing transcript video ID type (text or UUID) without altering Content Engine data. For a failed original install, the delivered `Acquisition_Install_Corrected.sql` combines both changes in one transaction. If 002 already succeeded, apply 003 only.

Use `ACQUISITION_INGEST_SECRET` (32+ random characters) for n8n Header Auth, keeping the existing Supabase/OpenAI settings. `ACQUISITION_PUBLIC_ORIGIN` and `ACQUISITION_ALLOWED_ORIGINS` retain their existing meanings. Enable `ACQUISITION_ATTRIBUTION_ENABLED=true` on Flask only after the migration is installed.

See `integrations/n8n/README.md` for complete import, credential, and workflow instructions. Both adapted workflows are inactive and retain their Sheets/Slack output steps; repository templates use placeholders for account-specific destinations. No live workflow was activated. Money Models is retired and removed from the Reddit matcher.

The LinkedIn export was missing its input nodes; the adapted copy accepts rows from the user's existing scraper/CSV workflow. The Reddit copy fixes the combination of AI results and preserves source-item identity. Both send drafts to `/api/acquisition/ingest`, which cannot approve or send them. The former `/api/acquisition/worker` returns 410, and the old SQL claim/delivery functions reject calls.

## Attribution and funnel coverage

Published posts link to `/api/acquisition/track?p=<post UUID>`. The server reads the matched resource override or approved campaign destination, validates its origin, records a random touch ID, and redirects with source/platform, organic-social medium, campaign UUID, post UUID, topic, and `rr_touch`. Only published posts can generate recorded touches.

The browser preserves first and last recorded touch references for 90 days across same-origin visits, separately from existing affiliate and UTM handling. Direct navigation does not overwrite them. Storage failure does not block the funnel. Cross-device and cross-origin browser histories are not automatically merged.

The Survival Playbook, three Membership Mastery variants, and three DMD variants submit these references with their existing lead forms. Flask records attribution after the existing nurture handoff. References are validated against recorded, recent clicks; leads are deduplicated by normalized email. Failed lead attribution logs `acquisition.lead_attribution_failed` without interrupting nurture. Monitor and reconcile these failures: there is not a durable lead-attribution retry queue in this version.

Existing Stripe checkout entry points also attach touch IDs as session metadata. The verified checkout webhook updates the latest touch used for conversion attribution. The original lead-attribution touches remain fixed at lead capture. A direct purchaser with an eligible click becomes an attributed lead/customer. Paid checkout sessions are deduplicated by session ID, including delayed-payment success callbacks; zero-value trials and unpaid sessions are excluded. Attribution errors at the verified webhook propagate for Stripe retry. The conversion snapshot remains fixed after the first successful insert.

Revenue currently means **gross paid Stripe checkout revenue** in provider minor units, grouped by currency. Renewals, refunds, disputes, PayPal payments, and the separate PaymentIntent-only path are not part of this version's revenue reporting. Customer matching uses checkout email; purchases using a different email require identity resolution beyond this implementation. Enable `checkout.session.async_payment_succeeded` in Stripe event delivery when using delayed payment methods.

## Reporting and observability

Analytics supports first-touch or last-touch models and grouping by channel, campaign, post, topic, content pillar, CTA, and source asset. Date filters apply to the event's UTC timestamp. Social metrics remain explicitly labeled lifetime snapshots. Currency totals are never combined. Leads/customers are distinct within each group; a customer appearing in several groups must not be summed as globally unique. Attribution shows associations, not causal lift. Qualified traffic is currently represented by downstream lead/customer outcomes; n8n pain/intent/buyer signals are visible for human review and do not count as funnel conversions.

`acquisition_revisions` preserves promotional copy history. `acquisition_activity` records state transitions and actors transactionally. Server errors emit structured acquisition logs without request bodies. Alert on endpoint/import failures, missing discovery runs, and lead-attribution failures. Acquisition content generation uses the existing OpenAI client and Revenue Ripple context; its platform-specific prompts adapt source material rather than generate replacement lessons.

The Content Engine's existing endpoints and components remain intact. Its generation prompt text is unchanged; only its opening context string is shared with Acquisition.

## Verification

- `npm run build`
- `node --test tests/acquisition/core.test.mjs`
- `python3 -m unittest discover -s tests/acquisition -p 'test_*.py'`
- `PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node --test tests/acquisition/database.test.mjs` (isolated PostgreSQL-compatible database; install PGlite in a temporary directory)
- `tests/acquisition/ui.html` is an isolated development fixture with synthetic API data; it is not a production route. Full interactive visual verification was blocked by the local browser environment.

Before rollout, test a staging admin token, apply both migrations to staging Supabase, import one discovery from n8n, review/approve its draft, and record a manual send. Follow its tracked CTA and complete a funnel submission and Stripe test checkout. Re-import the same discovery and verify the edited draft is preserved. No production migrations, scraping, messages, or live payments were executed during implementation.

The production build passes with existing repository warnings. The standard ESLint command is blocked by an existing `globals` entry with trailing whitespace; focused lint passes when that entry is normalized in a temporary configuration (no repository lint configuration changes).
