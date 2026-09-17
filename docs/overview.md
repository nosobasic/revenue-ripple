# Revenue Ripple OS — Product & Implementation Brief

**Tagline:** *Learn, Automate, and Scale Your Business Without Hiring a Team.*  
**Outcome:** One outcome‑focused product that stacks value until price becomes irrelevant. Users get market visibility, content, automation reliability, and monetization in a single login.

---

## 1) Core Stack (What’s Inside)
1. **AI Marketing Insights**  
   See where you show up in ChatGPT, Perplexity, and other AI surfaces; track competitors; get a prioritized content plan to outrank them.
2. **Done‑for‑You Content Library**  
   Prebuilt campaigns, posts, and email sequences auto‑aligned to your Insights. One‑click personalize → schedule → publish.
3. **AI Command Center**  
   Always‑on monitoring for automations, funnels, and webhooks with GPT summaries and **self‑healing agents** (auto‑retries, rollbacks, playbooks) so issues are fixed before you notice.
4. **Revenue Ripple Learning Platform**  
   Marketing, sales, and automation training that pairs directly with the tools above. Practical, action‑first curriculum.
5. **Affiliate & Reseller Program**  
   Monetize instantly by promoting the same platform you use (affiliate) and, at the top tier, fully resell white‑labeled.

> **Flagship Offer:** The flagship is the bundled experience of **AI Marketing Insights + AI Command Center + Learning Platform + DFY Library**, delivered as a single dashboard and supported by the partner program.

---

## 2) Pricing & Tier Structure (Bundled Model)
Everything ships in one offer. Higher tiers unlock scale features.

| Tier | Who It’s For | Included | Limits |
|---|---|---|---|
| **Core (Flagship)** | Solo operators, coaches, course creators | Full Learning Platform, AI Insights (basic), Command Center (basic), DFY Library starter, Affiliate rights | **Insights:** 1 business, 25 queries/mo. **Command Center:** 1 system, basic down alerts. |
| **Growth** | Agencies, power users | Advanced Insights (multi‑competitor, multi‑business), Command Center Pro agents, DFY Library Pro, white‑label reporting | **Insights:** Unlimited. **Command Center:** multi‑system, advanced agents. |
| **Partner** | Resellers/affiliates | Everything in Growth + reseller rights, white‑label dashboards, pro reseller perks | **Insights:** Unlimited + export formats. **Command Center:** white‑label dashboards. |

**Why this works**  
- Avoids commoditization: nobody else delivers **AI market visibility + self‑healing ops + training** in one login.  
- Clear upsell path: advanced agents, multi‑business, and white‑label naturally justify higher tiers.  
- Simpler backend: bundle‑level entitlements instead of per‑feature spaghetti.

---

## 3) Entitlement Map (Feature Limits)
**AI Insights**  
- Core → `business_limit = 1`, `queries_per_month = 25`  
- Growth → unlimited  
- Partner → unlimited + export formats

**AI Command Center**  
- Core → `systems_limit = 1`, basic down‑alert triggers  
- Growth → multi‑system + advanced triggers & self‑heal scripts  
- Partner → Growth + white‑label dashboards

**Learning Platform**  
- Full access for all **paying** tiers (Core/Growth/Partner).

**Affiliate/Reseller**  
- Core → affiliate rights  
- Growth → affiliate with higher commission %  
- Partner → reseller rights + pro reseller perks

---

## 4) Technical Implementation Plan

### 4.1 Auth & Identity
- Frontend obtains Supabase access token and sends `Authorization: Bearer <token>` for all Insights/Command Center requests.  
- Backend verifies with `SUPABASE_JWT_SECRET` (Supabase → Settings → API → JWT Secret).  
- Admin bypass (optional) can be applied **after** auth is working.

### 4.2 Tier Resolution
- Map `public.users.plan` → `{core|growth|partner}` in code:
```python
PLAN_TO_TIER = {
  "free": "core",
  "membership": "core",
  "affiliate": "core",
  "reseller": "growth",
  "pro_reseller": "partner",
}
```
- Helper: `resolve_tier(user_id) -> tier` (via DB read of `users.plan`).

### 4.3 Data Model (Supabase)
- **insights_usage**  
  `id uuid pk`, `user_id uuid not null fk → public.users(id) on delete cascade`, `month date not null`, `prompts_queries int default 0`, `suggestions_queries int default 0`, `created_at timestamptz default now()`, **unique**(`user_id`,`month`).
- **insight_daily_cache**  
  `id uuid pk`, `user_id uuid not null fk → public.users(id) on delete cascade`, `business_id uuid null`, `day date not null`, `title text null`, `suggestion text not null`, `source text`, `created_at timestamptz default now()`, **unique**(`user_id`,`day`,`business_id`).
- Keep existing learning/affiliate tables; no changes required for Phase 1.

### 4.4 API Contracts (Flask)
Base path: `/insights/api`

- **GET `/insight-of-day`** → returns cached or newly generated daily insight.
```json
{
  "day": "2025-08-13",
  "title": "Best channel to double CTR",
  "suggestion": "Ship a comparison post targeting <keyword>...",
  "source": "generated|top_suggestion",
  "tier": "core|growth|partner"
}
```

- **GET `/prompt-suggestions`** → list of suggestions (quota‑aware for Core).
- **GET `/competitors`** → competitor set and gaps.
- **GET `/analytics`** → funnel metrics summary.

**Errors**: `401` (no/invalid token), `403` (tier blocked), `429` (Core over quota).

### 4.5 Quota Enforcement (server)
- On suggestion endpoints, compute `month = date_trunc('month', now())`, read/update `insights_usage`.  
- Block Core when `suggestions_queries >= 25`, return `403` with upgrade hint payload.

### 4.6 Frontend Work (Cursor tasks)
- **Feature flag:** `VITE_USE_FLASK_INSIGHTS=true` gates the new UI.  
- **Navigation:** Add **Insights** and **Command Center** to the main nav.  
- **Pages:**
  - `/insights` page with: Insight‑of‑Day card, Suggestions list, Competitors table, Analytics summary.  
  - `/command-center` page with: System status, incident feed, recommended fixes (stub if needed).  
  - Update dashboard widget to surface today’s insight + quick actions.
- **Entitlement guard:** a hook `useTier()` to resolve `core|growth|partner` and show upgrade CTAs when blocked.  
- **Empty states & skeletons:** deterministic, copy provided below.

---

## 5) Copy for Marketing & UI

### 5.1 Positioning (Hero)
**Revenue Ripple OS**  
*Learn, Automate, and Scale Your Business Without Hiring a Team.*  
Run your business from one AI‑powered command hub — **market insights**, **self‑healing automations**, and **training** in one login.

**CTA:** Start Free → Upgrade when you need scale

### 5.2 Benefits Bullets
- Know exactly what to publish to outrank competitors.
- Fix automation issues automatically (before customers notice).
- Stop context switching — content, insights, and ops in one place.

### 5.3 Upgrade CTAs (when gated)
- **Core → Growth:** “Unlock multi‑business tracking and pro agents.”  
- **Growth → Partner:** “White‑label dashboards and reseller rights.”

---

## 6) Analytics & QA
**Events**: `insights_viewed`, `suggestion_requested`, `suggestion_blocked_quota`, `incident_resolved`, `upgrade_clicked`.  
**QA**: 
- Core user: 26th suggestion → `403` with upgrade CTA.  
- Growth user: unlimited suggestions; multi‑competitor visible.  
- Insight‑of‑Day returns the same suggestion for same user/day (cache hit).  
- Command Center shows status cards even with 0 incidents (healthy state).

---

## 7) Rollout Plan
1. Implement tier mapping + auth verification.  
2. Ship `/insight-of-day`, `/prompt-suggestions`, `/competitors`, `/analytics`.  
3. Add `/command-center` UI with stubs, then wire real data.  
4. Replace legacy tier spaghetti with Core/Growth/Partner guards.  
5. Merge `donte_test` → main once QA passes.

---

## 8) Appendix — Developer Notes
- **Env:** `SUPABASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`, `SUPABASE_JWT_SECRET`, `VITE_USE_FLASK_INSIGHTS`.
- **CORS:** Allow `Authorization` header from app origin if API is cross‑origin.
- **Migrations:** Insights tables are additive; no destructive changes needed.

