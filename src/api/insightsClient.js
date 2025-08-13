import { getAccessToken } from '../lib/supabase.js';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

async function authFetch(path, options = {}) {
	const token = await getAccessToken();
	const headers = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
		...(token ? { Authorization: `Bearer ${token}` } : {})
	};
	const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

export const insightsClient = {
	getInsightOfDay: () => authFetch('/insights/api/insight-of-day'),
	getSuggestions: () => authFetch('/insights/api/prompt-suggestions'),
	getCompetitors: () => authFetch('/insights/api/competitors'),
	getAnalytics: () => authFetch('/insights/api/analytics')
};