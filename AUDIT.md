# Audit — Revenue Ripple OS (SLC realignment)

## Keeps
- Frontend auth context in `src/context/AuthContext.jsx` and Supabase client in `src/supabase/client.jsx`.
- Existing course pages and training content under `src/pages/*`.
- Command Center landing UI in `src/pages/CommandCenter.jsx` (to be simplified behind feature flag).
- Stripe checkout and webhook flows in `server.py`.

## Refactors
- Add Insights API under `/insights/api/*` with Flask Blueprint: `server/routes/insights.py`.
- Add backend middleware:
  - `server/middleware/auth.py` for Supabase JWT verification via `SUPABASE_JWT_SECRET`.
  - `server/middleware/entitlements.py` for plan→tier mapping, quota helpers, and guards.
- Ensure environment variables:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_USE_FLASK_INSIGHTS`, `VITE_API_BASE_URL`.
  - Backend: `SUPABASE_JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Register insights blueprint in `server.py` and keep CORS consistent.

## Removals
- Legacy “gamified”/marketing-only Command Center upsell states will be reduced once the feature-flagged operational view ships. No immediate file deletions in this pass.

## Migrations
- Create idempotent SQL in `supabase/migrations/2025-08-13-insights.sql` for:
  - `public.insights_usage(user_id, month, prompts_queries, suggestions_queries)` with unique `(user_id, month)`.
  - `public.insight_daily_cache(user_id, business_id, day, suggestion, title, source)` with unique `(user_id, day, business_id)`.
  - Optional RPC `increment_suggestions_queries` for atomic updates.

## Gaps to implement next
- Frontend feature flag gating for Insights and Command Center in nav based on `VITE_USE_FLASK_INSIGHTS`.
- `src/lib/supabase.{ts,js}` helper `getAccessToken()` and `src/api/insightsClient.{ts,js}` that attach `Authorization: Bearer <token>` to all requests.
- Create pages: `/insights`, `/onboarding`, `/dfy`, and add Insight-of-the-Day widget on `/dashboard` with UpgradeCTA.
- Tier hook in `src/lib/tier.ts` to derive `core|growth|partner`.
- Onboarding Questionnaire storage table `user_onboarding_profile` and UI.
