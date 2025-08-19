import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Checklist from '../components/Onboarding/Checklist';
import plan from '../data/onboardingPlan.core.json';
import { emit } from '../utils/analytics';
import { supabase } from '../lib/supabase.js';

const QUESTIONS = [
	{ key: 'business_type', label: 'Business type', options: ['Coach', 'Local', 'Ecom', 'SaaS'] },
	{ key: 'goal', label: 'Main goal', options: ['Leads', 'Sales', 'Authority'] },
	{ key: 'channel', label: 'Primary channel', options: ['SEO', 'Social', 'Email', 'Paid'] },
	{ key: 'audience', label: 'Audience', options: ['B2B', 'B2C', 'Mixed'] },
	{ key: 'offers', label: '# of offers', options: ['1', '2-3', '4+'] },
	{ key: 'stack', label: 'Tech stack', options: ['WordPress', 'Shopify', 'Custom', 'Other'] },
	{ key: 'blocker', label: 'Current blocker', options: ['Traffic', 'Conversion', 'Offer', 'Tech'] },
];

export default function Onboarding() {
	const [answers, setAnswers] = useState({});
	const [status, setStatus] = useState('idle');

	async function submit() {
		setStatus('saving');
		const { data: user } = await supabase.auth.getUser();
		const userId = user?.user?.id;
		if (!userId) { setStatus('error'); return; }
		const payload = { user_id: userId, answers, updated_at: new Date().toISOString() };
		await supabase.from('user_onboarding_profile').upsert(payload, { onConflict: 'user_id' });
		console.log('onboarding_completed');
		setStatus('done');
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-semibold mb-4">Onboarding</h1>
				<div className="mb-6">
					<Checklist plan={plan} onComplete={() => emit('onboarding_completed')} />
				</div>
				<div className="space-y-4">
					{QUESTIONS.map(q => (
						<div key={q.key} className="p-4 bg-white rounded border">
							<label className="block mb-2 font-medium">{q.label}</label>
							<select className="border p-2 rounded" value={answers[q.key] || ''} onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}>
								<option value="">Select...</option>
								{q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
							</select>
						</div>
					))}
				</div>
				<div className="mt-6">
					<button disabled={status==='saving'} onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">{status==='saving' ? 'Saving...' : 'Save and Continue'}</button>
					{status==='done' && <span className="ml-3 text-green-700">Saved!</span>}
				</div>
			</div>
		</div>
	);
}
