# QA Scenarios — Revenue Ripple OS SLC

- Core user hits 26th suggestion → returns 403 and shows UpgradeCTA
  - Set `plan=member` for user in `public.users`
  - Call `/insights/api/prompt-suggestions` 26 times
  - Verify 26th call → HTTP 403; UI shows UpgradeCTA with quota message

- Growth user sees multi-competitor + no quota block
  - Set `plan=reseller`
  - `/insights/api/competitors` returns list (200)
  - Suggestions have no quota block beyond 25

- Insight-of-Day cache
  - Call `/insights/api/insight-of-day` twice same day
  - Verify same `suggestion`/`title` returned

- Command Center healthy state
  - Visit `/command-center` with `VITE_USE_FLASK_INSIGHTS=true`
  - Page renders with 0 incidents placeholder

- Onboarding Questionnaire
  - Visit `/onboarding` (to be implemented)
  - Submit answers; verify row in `user_onboarding_profile`
  - Dashboard shows tailored plan card