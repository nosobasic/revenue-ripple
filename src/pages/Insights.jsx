import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import UpgradeCTA from '../components/UpgradeCTA';
import { insightsClient } from '../api/insightsClient';
import { useTier } from '../lib/tier.js';

export default function InsightsPage() {
	const [insight, setInsight] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const [competitors, setCompetitors] = useState([]);
	const [analytics, setAnalytics] = useState(null);
	const [error, setError] = useState(null);
	const [quotaBlocked, setQuotaBlocked] = useState(false);
	const { tier } = useTier();

	useEffect(() => {
		(async () => {
			try {
				const i = await insightsClient.getInsightOfDay();
				setInsight(i);
			} catch (e) { setError('Failed to load insight'); }
		})();
	}, []);

	async function loadSuggestions() {
		try {
			const res = await insightsClient.getSuggestions();
			setSuggestions(res.items || []);
			console.log('suggestion_requested');
		} catch (e) {
			if (String(e.message).includes('HTTP 403')) {
				setQuotaBlocked(true);
				console.log('suggestion_blocked_quota');
			} else {
				setError('Failed to load suggestions');
			}
		}
	}

	async function loadCompetitors() {
		try {
			const res = await insightsClient.getCompetitors();
			setCompetitors(res.items || []);
		} catch (e) { /* ignore if not allowed */ }
	}

	async function loadAnalytics() {
		try {
			const res = await insightsClient.getAnalytics();
			setAnalytics(res);
		} catch (e) { /* ignore for now */ }
	}

	useEffect(() => {
		loadSuggestions();
		loadCompetitors();
		loadAnalytics();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-semibold mb-4">AI Marketing Insights</h1>
				{error && <div className="mb-3 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

				{/* Insight of the Day */}
				<div className="mb-6 p-4 bg-white rounded shadow">
					<h2 className="text-xl font-medium mb-2">Insight of the Day</h2>
					{insight ? (
						<div>
							<p className="text-gray-800 font-semibold">{insight.title || 'Today\'s Insight'}</p>
							<p className="text-gray-700">{insight.suggestion}</p>
						</div>
					) : (
						<div className="animate-pulse h-12 bg-gray-100 rounded" />
					)}
				</div>

				{/* Suggestions */}
				<div className="mb-6 p-4 bg-white rounded shadow">
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-xl font-medium">Suggestions</h2>
						<button onClick={loadSuggestions} className="text-blue-600">Refresh</button>
					</div>
					{quotaBlocked ? (
						<UpgradeCTA currentTier={tier} blockedReason="Core plan limit reached: 25 suggestions/mo" />
					) : (
						<ul className="space-y-2">
							{suggestions.map(s => (
								<li key={s.id} className="p-3 border rounded">
									<p className="font-medium">{s.title}</p>
									<p className="text-gray-700">{s.prompt}</p>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Competitors */}
				<div className="mb-6 p-4 bg-white rounded shadow">
					<h2 className="text-xl font-medium mb-2">Competitors</h2>
					{competitors?.length ? (
						<table className="w-full text-left">
							<thead>
								<tr><th className="py-1">Name</th><th className="py-1">Strength</th><th className="py-1">Gap</th></tr>
							</thead>
							<tbody>
								{competitors.map((c, idx) => (
									<tr key={idx} className="border-t">
										<td className="py-1">{c.name}</td>
										<td className="py-1">{c.strength}</td>
										<td className="py-1">{c.gap}</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<p className="text-gray-600">No data or not available for your tier.</p>
					)}
				</div>

				{/* Analytics */}
				<div className="mb-12 p-4 bg-white rounded shadow">
					<h2 className="text-xl font-medium mb-2">Analytics</h2>
					{analytics ? (
						<div className="grid grid-cols-3 gap-4">
							<div className="p-3 border rounded">Visits: {analytics.funnel.visits}</div>
							<div className="p-3 border rounded">Optins: {analytics.funnel.optins}</div>
							<div className="p-3 border rounded">Sales: {analytics.funnel.sales}</div>
						</div>
					) : (
						<div className="animate-pulse h-10 bg-gray-100 rounded" />
					)}
				</div>
			</div>
		</div>
	);
}