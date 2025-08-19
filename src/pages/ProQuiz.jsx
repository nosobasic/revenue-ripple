import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { emit } from '../utils/analytics';

export default function ProQuiz() {
	const navigate = useNavigate();
	const [answers, setAnswers] = useState({ mrr: '', adSpend: '', team: '', stack: '', leak: '', timeline: '', dm: '' });

	const update = (key) => (e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }));

	const handleSubmit = (e) => {
		e.preventDefault();
		emit('pro_quiz_completed', answers);
		const qualified = (Number(answers.mrr) >= 10000) || (Number(answers.adSpend) >= 3000) || answers.team === '3+';
		navigate(qualified ? '/pro-apply' : '/thank-you');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="container mx-auto px-6 pt-24">
				<h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Pro Quiz</h1>
				<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
					<label>Monthly Recurring Revenue (USD)
						<input value={answers.mrr} onChange={update('mrr')} placeholder="e.g., 12000" className="input" />
					</label>
					<label>Monthly Ad Spend (USD)
						<input value={answers.adSpend} onChange={update('adSpend')} placeholder="e.g., 5000" className="input" />
					</label>
					<label>Team size
						<select value={answers.team} onChange={update('team')} className="input">
							<option value="">Select</option>
							<option value="1-2">1-2</option>
							<option value="3+">3+</option>
						</select>
					</label>
					<label>Current stack
						<input value={answers.stack} onChange={update('stack')} placeholder="e.g., GA4, Meta, HubSpot" className="input" />
					</label>
					<label>Biggest leak
						<input value={answers.leak} onChange={update('leak')} placeholder="e.g., attribution, LTV, churn" className="input" />
					</label>
					<label>Timeline to fix
						<select value={answers.timeline} onChange={update('timeline')} className="input">
							<option value="">Select</option>
							<option value="7-14">7-14 days</option>
							<option value="30-45">30-45 days</option>
						</select>
					</label>
					<label>Decision-maker?
						<select value={answers.dm} onChange={update('dm')} className="input">
							<option value="">Select</option>
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
					</label>
					<button className="cta-button" type="submit">Submit</button>
				</form>
			</div>
		</div>
	);
}


