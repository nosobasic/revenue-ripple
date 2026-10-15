# Production preflight — October 15, 2026

Read-only inspection through the existing signed-in Supabase and Render dashboards. Application candidate remains `d9136de7ec03ed94ae91db838adc75d6459c3ac2`; no push, deployment, database mutation, credential creation, provider call or sending activation performed.

## Verified production results

- Project `gwiqvfvcxcznecbfzlns`, PostgreSQL **15.8**. Consolidated preflight ran successfully; its final result returned four published `playbook` rows and 102 published `premium_briefing` rows, all level `member`. No content bodies were read.
- Render service `srv-d0h1n0h5pdvs73aomq50`, refreshed deployment list: **Live**, last successfully deployed commit **6651a149666c2df04d4480c18bd90200ffad667b**, deployment `dep-db6ek267bikc73cjj920`. The detail page reports deployment success, October 12, 2026, 10:09:12 AM EDT, duration 1m28s. This resolves the previously unknown backend revision.
- CRM delivery policy: one row, enabled=false, minimum/maximum daily cap=50, pacing=1 second. Historical exclusions=**1,494**. Pilot aggregate: one pilot policy, enabled=false, its joined enrollment paused at step 1. Six indoctrination enrollments total; one paused at step 1.
- Visibility: one config row, enabled=false, provider=disabled, budget_micros=0. Infrastructure quota 103 and template staging are prior handoff facts, not re-applied or independently checked here.
- Subscription rows=0; future premium=0; inconsistent future premium=0; founder rows=0; non-admin/non-lifetime historical paid flags=0. These aggregates do not prove there are no purchases in another payment system.
- No rr_retention tables/functions are installed. No email_nurture_policy, email_nurture_bundles or email_nurture_admissions appeared in the targeted catalog query. New nurture SQL remains pending; do not claim nurture is live.

## Content and identity security

The seven historical RLS-error tables (point_transactions, user_achievements, learning_streaks, learning_challenges, ai_recommendations, quiz_results, listing_watch) now have RLS enabled, postgres ownership, and grants only to postgres/service_role. Effective anon/authenticated SELECT=false for each.

`content_items` is postgres-owned with no security_invoker option and grants SELECT to anon/authenticated. Its definition selects every row from ve_content_items, including full_body, with no filter. The base table has RLS enabled but no policies; the owner-executed view bypasses that client restriction. This is a catalog-proven public content exposure path, not a claim that we exported bodies or performed an anonymous row read.

Content view/base column ACLs are absent. Their owner/RLS/options/policy state matches the existing retention migration guard. Existing rr_access and rr_v_access remain service-role-only; no fixture definitions were applied. Current definition MD5s:

| Function | Hosted definition MD5 |
| --- | --- |
| is_admin | 0168e24dc290acb8ab7ad3906dbb5ed4 |
| rr_access | 738456ef3f5edc339a9315f2e448f319 |
| rr_v_access | 4f83bda6040cbaf62b5190bebe9b6e9a |
| rr_v_submit | a222ec7f8e14402393c6b96e0d1f16f6 |
| email_reporting_snapshot | 6a7e5523eefbfa934c668f84484db74c |
| email_capture_optin | 62ecd64b6b4213b32dfc746194012d9a |
| email_begin_send | 544c3390ec026442c0f13c4936daee1c |
| email_claim | 04cb878154a1202a8f53c37335d42fc3 |
| email_due | 2fe6e5c061cec98853132c54a3a7e104 |

is_admin is a SECURITY DEFINER function with empty search_path and checks auth.uid against role=admin. Profile UPDATE still has rr_guard_profile_update and timestamp triggers. Existing functions and triggers are to be preserved.

## Fresh Security Advisor inventory

**1 error, 16 warnings, 56 suggestions** after refreshing the dashboard. Sole error: security-definer view public.content_items.

Six mutable search-path warnings: update_post_upvotes, update_progress_timestamp, update_reply_upvotes, assign_founder_spot_number, update_agent_updated_at_column, update_updated_at_column.

Five permissive-write-policy warnings: affiliate_visits (two), ai_visibility_results, founders_timer_tracking, referral_clicks. These need policy/grant-specific review; no blanket RLS change was made.

Two signed-in SECURITY DEFINER execute warnings: email_reporting_snapshot and is_admin. is_admin's inspected body is identity-scoped; do not blindly revoke required guards merely to silence the linter. Reporting's full body was not re-audited in this pass.

Three configuration warnings: email OTP expiry exceeds one hour, leaked-password protection disabled, PostgreSQL security patches available. No authentication settings or database upgrade was changed.

## Exact remaining approval boundary

The reviewed file `review-sql/paid-retention.sql` still says **NOT APPROVED FOR DEPLOYMENT** and ends ROLLBACK. Prior handoff `../retention-precise-handoff.txt` explicitly calls for one exact SQL+API/UI rollout approval after live drift reconciliation. Browser permission resolved inspection access; it is not by itself that production permission-change approval.

Concrete proposed action: execute that reviewed migration as one transaction with COMMIT in place of its final ROLLBACK, creating four owner-only evidence tables and two authenticated, JWT-scoped SECURITY DEFINER entitlement functions; revoke anonymous content reads/client writes; make content_items security_invoker; add the published member-level playbook/premium_briefing policy. Preserve admin/lifetime, existing rr_access/rr_v_access/reporting and all free education. No evidence rows, credentials, purchases or customer grants are fabricated.

Coordinate with the application release: deploy the reconciled backend with retention readiness off, apply/read back the approved SQL, deploy matching UI, then verify before readiness activation. This entails a brief retention outage. Do not deploy the backend-off step on its own while waiting indefinitely for SQL approval. Rollback closes readiness and retains restrictive DB controls, never restores the public bypass.

Smallest next action: approve this exact production retention SQL permission change and coordinated app/readiness rollout. AI provider spending/activation and automatic CRM sending remain separate closed gates. CRM owner must compare the captured function hashes and install their separately approved nurture SQL before any future sending activation; staged templates alone do not complete that gate.

The 136 Python / 19 Node regression results and 79 retention / 16 visibility SQL assertions from the previous pass remain local evidence only. No new live end-to-end regression or deployment success is claimed.

## Execution note

Supabase displays only the last result of a batch, so additional read-only JSON aggregation queries collected earlier catalog/results without reading application records. One editor replacement initially retained preceding text and caused a syntax error; no mutation was present. Clearing the editor and running the clean read-only query succeeded. Original user tabs and unsaved query were not edited; a separate SQL tab was used and retained for handoff.
