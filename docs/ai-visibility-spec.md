# AI Visibility Feature Specification

## Overview

AI Visibility is a feature that helps businesses understand and improve their visibility in AI-powered chatbots and search assistants (ChatGPT, Perplexity, Gemini, Claude, etc.). This is essentially "SEO for AI" - tracking how and when a business appears in AI-generated responses.

**This is distinct from "AI Insights"** (the existing premium briefings/playbooks feature in main branch). AI Visibility focuses specifically on tracking and optimizing presence in AI chatbot responses.

---

## Core Concept

When users ask AI chatbots questions like:
- "What's the best marketing agency in Austin?"
- "Recommend a SaaS tool for email automation"
- "Who are the top coaches for business growth?"

**AI Visibility tracks:**
1. Which prompts/queries trigger mentions of your business
2. How you rank compared to competitors for those queries
3. What content you can create to improve your AI visibility

---

## Key Features

### 1. Prompt Discovery & Tracking
**What it does:** Identifies prompts/queries where a business appears (or should appear) in AI responses.

**Data sources (to be determined):**
- [ ] Manual prompt testing against AI APIs
- [ ] Third-party AI visibility tracking services
- [ ] User-submitted prompts they want to track
- [ ] Industry-specific prompt libraries

**User sees:**
- List of prompts they're appearing for
- List of prompts they're NOT appearing for (opportunities)
- Prompt categories (informational, transactional, comparison, etc.)

### 2. Competitor Benchmarking
**What it does:** Shows how competitors rank for the same prompts.

**User sees:**
- Side-by-side comparison: "You vs Competitors" for key prompts
- Competitor visibility scores
- Gap analysis: "Competitor X appears for these prompts, you don't"

### 3. Visibility Score
**What it does:** Provides an overall score/metric for AI visibility.

**Metrics to consider:**
- Number of prompts appearing for
- Position/prominence in responses
- Frequency of mentions
- Sentiment of mentions

### 4. Content Generation for AI Optimization
**What it does:** Auto-generates content optimized to improve AI visibility.

**Content types:**
- Blog posts structured for AI citation
- FAQ content that matches common prompts
- Schema markup suggestions
- "About" page optimization recommendations

**One-click action:** Generate content → Review → Publish

---

## User Flows

### Flow 1: Initial Setup
1. User enters business name/URL
2. User selects industry/niche
3. User adds 3-5 competitors to track
4. System runs initial visibility scan
5. Dashboard populates with baseline data

### Flow 2: Daily Monitoring
1. User visits AI Visibility dashboard
2. Sees overall visibility score + trend
3. Views top prompts they're appearing for
4. Sees new opportunities (prompts to target)
5. Can drill into competitor comparisons

### Flow 3: Content Optimization
1. User sees prompt they want to rank for
2. Clicks "Boost Visibility" button
3. AI generates optimized content
4. User reviews/edits content
5. User publishes or exports

---

## Technical Questions to Resolve

### Data Collection
- **Q1:** How do we actually detect when a business appears in AI responses?
  - Option A: Periodic API calls to ChatGPT/Gemini/Perplexity with test prompts
  - Option B: Integration with third-party AI visibility tools
  - Option C: Crowdsourced/user-reported data
  - Option D: Web scraping of AI-generated content

### API Costs
- **Q2:** What's the cost model for checking visibility?
  - How many prompts can we test per user per day?
  - Tier-based limits (Core: 10/day, Growth: 50/day, Partner: unlimited?)

### Accuracy
- **Q3:** AI responses are non-deterministic. How do we handle this?
  - Multiple samples per prompt?
  - Confidence scores?
  - Time-based averaging?

### Competitor Data
- **Q4:** How do we get competitor visibility data?
  - Same approach as user's own data
  - Shared database across all users in same niche?

---

## Database Schema (Draft)

```sql
-- Business profiles for AI visibility tracking
CREATE TABLE ai_visibility_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    business_name TEXT NOT NULL,
    business_url TEXT,
    industry TEXT,
    niche_keywords TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts being tracked
CREATE TABLE ai_visibility_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_text TEXT NOT NULL,
    category TEXT, -- informational, transactional, comparison
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visibility results per prompt
CREATE TABLE ai_visibility_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES ai_visibility_profiles(id),
    prompt_id UUID REFERENCES ai_visibility_prompts(id),
    ai_platform TEXT, -- chatgpt, perplexity, gemini
    appears BOOLEAN,
    position INTEGER, -- 1 = first mention, 2 = second, etc.
    snippet TEXT, -- the text where business was mentioned
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitors being tracked
CREATE TABLE ai_visibility_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES ai_visibility_profiles(id),
    competitor_name TEXT NOT NULL,
    competitor_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content for visibility optimization
CREATE TABLE ai_visibility_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES ai_visibility_profiles(id),
    prompt_id UUID REFERENCES ai_visibility_prompts(id),
    content_type TEXT, -- blog, faq, schema, about
    title TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft', -- draft, published, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tier-Based Access

| Feature | Core | Growth | Partner |
|---------|------|--------|---------|
| Prompts tracked | 10 | 50 | Unlimited |
| Competitors tracked | 3 | 10 | Unlimited |
| Visibility checks/day | 5 | 25 | Unlimited |
| Content generation/mo | 5 | 25 | Unlimited |
| Historical data | 7 days | 30 days | 1 year |

---

## Open Questions for Discussion

1. **What's the MVP scope?** Start with just prompt tracking, or include content generation?

2. **Which AI platforms to support first?** ChatGPT only, or multi-platform from day one?

3. **Manual vs Automated?** Should users submit prompts to track, or do we auto-discover?

4. **Integration with existing features?** Does this connect to the AI Insights briefings?

5. **Third-party dependencies?** Are there existing APIs/services we should integrate with?

---

## Next Steps

Once we align on:
- [ ] MVP feature scope
- [ ] Data collection approach
- [ ] Technical architecture decisions

Then we can:
1. Create database migrations
2. Build backend API endpoints
3. Create frontend dashboard
4. Integrate with existing navigation/auth
5. Test and iterate

---

*Document created: 2026-01-22*
*Last updated: 2026-01-22*
