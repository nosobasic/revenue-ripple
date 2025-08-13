import React from 'react';
import Navbar from '../components/Navbar';
import { useTier } from '../lib/tier.js';

const TEMPLATES = [
	{ id: 't1', title: 'Coach Authority Post', type: 'post', tier: 'core', summary: 'Short authority-building LinkedIn post' },
	{ id: 't2', title: 'Local Biz Promo Email', type: 'email', tier: 'growth', summary: 'Email campaign for local offer' },
	{ id: 't3', title: 'Ecom Retargeting Ad', type: 'ad', tier: 'partner', summary: 'High-ROAS retargeting ad copy' }
];

export default function DFY() {
	const { tier } = useTier();
	function canAccess(t) {
		if (t.tier === 'core') return true;
		if (t.tier === 'growth') return tier !== 'core';
		if (t.tier === 'partner') return tier === 'partner';
		return false;
	}
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-semibold mb-4">DFY Content Library</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{TEMPLATES.map(t => (
						<div key={t.id} className="p-4 bg-white rounded border">
							<p className="font-medium">{t.title}</p>
							<p className="text-gray-700 text-sm">{t.summary} · {t.type}</p>
							{canAccess(t) ? (
								<button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Insert into editor</button>
							) : (
								<p className="mt-2 text-gray-500">Upgrade required</p>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
