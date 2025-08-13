import { z } from "zod";

// Base URL for same-origin requests
const base = "";

// Zod schemas for response validation
const Prompt = z.object({ 
  id: z.string(), 
  title: z.string().optional(), 
  body: z.string(), 
  created_at: z.string() 
});

const Suggestion = z.object({ 
  id: z.string(), 
  user_id: z.string(), 
  business_id: z.string().nullable().optional(), 
  suggestion: z.string(), 
  score: z.number().nullable().optional(), 
  created_at: z.string() 
});

const Competitor = z.object({ 
  id: z.string(), 
  user_id: z.string(), 
  name: z.string(), 
  industry: z.string(), 
  website: z.string().nullable().optional(), 
  last_seen: z.string(), 
  score: z.number().nullable().optional() 
});

const AnalyticsRow = z.object({ 
  period_start: z.string(), 
  period_end: z.string(), 
  impressions: z.number().nullable().optional(), 
  clicks: z.number().nullable().optional(), 
  conversions: z.number().nullable().optional(), 
  rev: z.number().nullable().optional() 
});

const Analytics = z.object({ 
  rows: z.array(AnalyticsRow), 
  totals: z.object({ 
    impressions: z.number().nullable().optional(), 
    clicks: z.number().nullable().optional(), 
    conversions: z.number().nullable().optional(), 
    rev: z.number().nullable().optional() 
  }) 
});

const DailyInsight = z.object({
  id: z.string(),
  user_id: z.string(),
  business_id: z.string().nullable().optional(),
  day: z.string(),
  title: z.string().optional(),
  suggestion: z.string(),
  source: z.string(),
  created_at: z.string()
});

// Helper function for authenticated requests
async function jfetch(path, token) {
  const res = await fetch(base + path, { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed ${res.status}: ${errorText}`);
  }
  return res.json();
}

// Check if we should use Flask insights or legacy endpoints
const useFlaskInsights = import.meta.env.VITE_USE_FLASK_INSIGHTS === 'true';

export async function fetchDailyInsight(token, { business_id } = {}) {
  if (!useFlaskInsights) {
    // TODO: Implement legacy endpoint fallback
    throw new Error("Legacy daily insight endpoint not implemented yet");
  }
  
  const params = new URLSearchParams();
  if (business_id) params.append('business_id', business_id);
  
  const queryString = params.toString();
  const path = `/insights/api/daily${queryString ? `?${queryString}` : ''}`;
  
  const data = await jfetch(path, token);
  return DailyInsight.parse(data);
}

export async function fetchPrompts(token) {
  if (!useFlaskInsights) {
    // TODO: Implement legacy endpoint fallback
    throw new Error("Legacy prompts endpoint not implemented yet");
  }
  
  const data = await jfetch("/insights/api/prompts", token);
  return z.array(Prompt).parse(data);
}

export async function fetchSuggestions(token, { q, business_id } = {}) {
  if (!useFlaskInsights) {
    // TODO: Implement legacy endpoint fallback
    throw new Error("Legacy suggestions endpoint not implemented yet");
  }
  
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (business_id) params.append('business_id', business_id);
  
  const queryString = params.toString();
  const path = `/insights/api/suggestions${queryString ? `?${queryString}` : ''}`;
  
  const data = await jfetch(path, token);
  return z.array(Suggestion).parse(data);
}

export async function fetchPromptSuggestions(token, { q, business_id } = {}) {
  // Alias for fetchSuggestions for backward compatibility
  return fetchSuggestions(token, { q, business_id });
}

export async function fetchCompetitors(token, { industry, limit } = {}) {
  if (!useFlaskInsights) {
    // TODO: Implement legacy endpoint fallback
    throw new Error("Legacy competitors endpoint not implemented yet");
  }
  
  const params = new URLSearchParams();
  if (industry) params.append('industry', industry);
  if (limit) params.append('limit', limit.toString());
  
  const queryString = params.toString();
  const path = `/insights/api/competitors${queryString ? `?${queryString}` : ''}`;
  
  const data = await jfetch(path, token);
  return z.array(Competitor).parse(data);
}

export async function fetchAnalytics(token, { business_id, from, to, group_by, metrics } = {}) {
  if (!useFlaskInsights) {
    // TODO: Implement legacy endpoint fallback
    throw new Error("Legacy analytics endpoint not implemented yet");
  }
  
  const params = new URLSearchParams();
  if (business_id) params.append('business_id', business_id);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (group_by) params.append('group_by', group_by);
  if (metrics) params.append('metrics', metrics);
  
  const queryString = params.toString();
  const path = `/insights/api/analytics${queryString ? `?${queryString}` : ''}`;
  
  const data = await jfetch(path, token);
  return Analytics.parse(data);
}
