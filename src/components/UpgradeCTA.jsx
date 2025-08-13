import React from 'react';

export default function UpgradeCTA({ currentTier = 'core', blockedReason = '' }) {
	const headline = currentTier === 'core' ? 'Unlock more insights with Growth' : 'Unlock Partner features';
	const copy = blockedReason || (currentTier === 'core'
		? 'You have reached your Core plan limit. Upgrade to Growth for higher quotas and advanced tools.'
		: 'Upgrade to Partner to access white-label features and exports.');
	return (
		<div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#f9fafb' }}>
			<h3 style={{ margin: 0 }}>{headline}</h3>
			<p style={{ margin: '8px 0 12px 0', color: '#4b5563' }}>{copy}</p>
			<a href="/special" style={{ background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>Upgrade now</a>
		</div>
	);
}
