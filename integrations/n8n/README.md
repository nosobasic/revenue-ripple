# Discovery and manual outreach

These are adapted copies of the two supplied n8n workflows. Neither workflow publishes a social post or sends an outreach message. Both exports are **inactive** and contain no saved credential bindings. Sheets and Slack destinations use placeholders in these repository templates; choose your own spreadsheet and channel and reconnect only the outputs you want to use. Importing a JSON file does not configure or activate a live workflow.

## Install the database changes

The failed `002` assumed `video_transcripts.video_id` was text; the existing database uses UUID. The corrected `002_acquisition_engine.sql` detects and matches the existing type while preserving the Content Engine table. It supports both UUID and text installations.

If the original `002` failed, run the supplied **Acquisition_Install_Corrected.sql** in Supabase's SQL editor. It combines corrected 002 and new 003 in one transaction. The original 002 used a transaction, so the reported error should have rolled back its changes. If acquisition tables already exist because you successfully installed 002 elsewhere, run **003_acquisition_manual_outreach.sql only**, rather than re-running the installer. Do not delete existing tables or cast Content Engine IDs.

003 adds the opportunity inbox and manual-send recording, enables Reddit in existing posts, and disables the old SQL dispatch functions. The old worker HTTP endpoint returns 410. Calendar dates are manual follow-up reminders.

## Connect n8n

1. Deploy the updated application/API after applying the migration.
2. Add `ACQUISITION_INGEST_SECRET` to the Node/Vercel environment. Use a random secret of at least 32 characters. Keep the existing Supabase configuration. The old worker secret is no longer used.
3. In n8n create a **Header Auth** credential: name `Authorization`, value `Bearer <your import secret>`. Select it on **Import Acquisition Draft**. This credential imports discovery records only; admin authentication is still required to approve or record a send.
4. Create or choose an Acquisition campaign. Copy its UUID from **Acquisition → Settings**. Set it in **Acquisition Configuration** in each workflow; confirm the import URL is your deployed `/api/acquisition/ingest` endpoint.
5. Reconnect the workflows' existing OpenAI/Reddit/Sheets/Slack credentials as needed. Test manually with one input before enabling the Reddit schedule. No live workflows were activated during implementation.

## LinkedIn copy

The supplied export referenced **Start Workflow** and **Read CSV File**, but neither node was included. It did not contain a LinkedIn scraper. The updated copy adds an **Execute Workflow Trigger** accepting rows from your existing scraper or CSV-reading workflow and normalizes those rows before the existing Split Items and message-generation nodes.

Send either individual JSON rows or a `data` array. Fields: `name`, `role`, `company`, `profileUrl` (or the corresponding `Name`, `Role`, `Company`, `Profile URL` columns). A profile URL is required for deduplication.

The existing connection-message prompt is retained with a corrected JSON response instruction to match its existing structured parser. Original profile fields are joined back to the AI response through n8n item linking. Sheets now matches on Profile URL instead of Name, preventing two people with the same name from overwriting each other. Re-imports do not write the Status field, so manually maintained Sheet statuses are preserved.

## Reddit copy

The existing search, qualification, response generation, and lead-magnet matching remain. The ambiguous three-input positional merge has been replaced by sequential AI stages with linked source-item references, so each response retains the correct original post and analysis. The matcher result must be one of the configured active URLs.

**Money Models has been removed**, including its old `/book-giveaway` URL. Only the three DMD and three Membership Mastery variations remain in this workflow. The existing buyer=yes and pain>=3 qualification rules remain. Sheets matches on Post URL to avoid duplicate rows and leaves manually maintained Status values untouched.

## Review and send

Imported prospects appear under **Acquisition → Opportunities**, alongside their original context, AI qualification signals, matched resource, and response draft. These are potential prospects, not acquired funnel leads.

Each discovery reuses an `acquisition_posts` draft and the existing revision/approval system. Repeat runs update last-seen time but preserve drafts, approvals, manual sends, and hidden-inbox decisions. Deduplication is scoped to campaign + platform + normalized source URL; deliberately using another campaign creates a separate campaign opportunity.

Review/edit, submit for approval, approve, then **Copy approved response**. Use **Copy tracked CTA** where relevant and allowed. Send manually on the platform, then record the thread/profile/reply URL with **I sent this manually — record send**. The tracked CTA becomes active once the send is recorded. For a connection note, copy the response by itself to preserve its character limit; the CTA can be used in an appropriate follow-up.

The matched resource URL travels with the existing post, so its tracked CTA redirects to the resource actually selected for that opportunity. Click, funnel lead, and paid-checkout attribution reuse the existing Acquisition tracking system. Hiding an opportunity only hides its inbox card; its draft/history remain in Posts.

## Import contract

`POST /api/acquisition/ingest`, Header Auth as above, one JSON object per request:

```json
{
  "campaign_id": "YOUR_CAMPAIGN_UUID",
  "platform": "reddit",
  "source_url": "https://www.reddit.com/r/marketing/comments/POST_ID",
  "source_title": "Original title",
  "source_text": "Original post context",
  "author": "public handle",
  "community": "marketing",
  "pain_level": 4,
  "intent": "learning",
  "buyer": true,
  "matched_resource_url": "https://www.revenueripple.org/dmd-variation-1",
  "reply": "Helpful response prepared by your workflow",
  "workflow_name": "Reddit analysis and lead magnet matcher"
}
```

LinkedIn uses `platform: linkedin`, a LinkedIn profile URL, optional author/role/company, and `reply` up to 300 characters. Qualification fields and matched resource are optional. Unknown external resource origins are rejected. Import credentials never bypass approval.

These JSON exports were checked structurally and with synthetic Code-node inputs; they still need credential selection and a test execution in your n8n instance. No scraping, Slack notifications, emails, or social messages were sent during implementation.
