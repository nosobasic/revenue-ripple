import { useState } from 'react';
import Navbar from '../components/Navbar';
import { emit } from '../utils/analytics';

export default function ProApply() {
	const [form, setForm] = useState({ name: '', email: '', notes: '' });
	const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

	const submit = (e) => {
		e.preventDefault();
		emit('pro_app_submitted', form);
		window.location.href = '#cal';
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="container mx-auto px-6 pt-24">
				<h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Apply for Pro Setup</h1>
				<form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
					<label>Name
						<input value={form.name} onChange={update('name')} className="input" />
					</label>
					<label>Email
						<input value={form.email} onChange={update('email')} className="input" type="email" />
					</label>
					<label>Notes
						<textarea value={form.notes} onChange={update('notes')} className="input" rows={4} />
					</label>
					<button className="cta-button" type="submit">Submit Application + Book Call</button>
				</form>
				<div id="cal" style={{ marginTop: 24 }}>
					<iframe
						title="Calendly"
						src="https://calendly.com/your-calendly-slug/intro?hide_landing_page_details=1&hide_gdpr_banner=1"
						style={{ minWidth: '320px', height: 700, width: '100%', border: 0 }}
					/>
				</div>
			</div>
		</div>
	);
}


