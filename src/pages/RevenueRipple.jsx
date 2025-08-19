import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StickyCTA from '../components/StickyCTA';
import { emit } from '../utils/analytics';

export default function RevenueRipple() {
	useEffect(() => {
		emit('lp_viewed', { page: 'revenue_ripple' });
	}, []);

	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<div className="container mx-auto px-6 pt-24">
				<section style={{ textAlign: 'center', margin: '2rem 0' }}>
					<h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>ROI visibility + auto-healing in 7 days — guaranteed.</h1>
					<p style={{ fontSize: '1.125rem', color: '#374151', marginTop: '0.75rem' }}>
						Set up in 30 minutes, see ROI signals in 7 days, or don’t pay.
					</p>
					<div style={{ marginTop: '1.25rem' }}>
						<Link to="/checkout" className="cta-button">
							Start for $197
						</Link>
					</div>
				</section>

				<section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, margin: '2rem 0' }}>
					<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
						<h3 style={{ fontWeight: 700 }}>Proof</h3>
						<p>Live counters and anonymized ROI snapshots.</p>
					</div>
					<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
						<h3 style={{ fontWeight: 700 }}>Demo</h3>
						<div style={{ background: '#f3f4f6', height: 200, borderRadius: 8 }} />
					</div>
					<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
						<h3 style={{ fontWeight: 700 }}>Bonus Stack</h3>
						<ul style={{ marginTop: 8 }}>
							<li>Dashboards pack ($197)</li>
							<li>SOP vault ($297)</li>
							<li>Onboarding concierge ($97)</li>
						</ul>
					</div>
					<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
						<h3 style={{ fontWeight: 700 }}>Guarantee</h3>
						<p>See ROI signals in 7 days or pay nothing.</p>
					</div>
				</section>

				<section style={{ margin: '2rem 0' }}>
					<h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Pricing</h2>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
						<div style={{ padding: 16, border: '2px solid #2563eb', borderRadius: 8 }}>
							<h3 style={{ fontWeight: 800 }}>Core</h3>
							<p style={{ fontSize: 24, fontWeight: 800 }}>$197</p>
							<Link to="/checkout" className="cta-button">Start</Link>
						</div>
						<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
							<h3 style={{ fontWeight: 700 }}>Lite</h3>
							<p style={{ fontSize: 20, fontWeight: 700 }}>$29</p>
							<Link to="/checkout" className="cta-button cta-secondary">Try Lite</Link>
						</div>
						<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
							<h3 style={{ fontWeight: 700 }}>Education</h3>
							<p style={{ fontSize: 20, fontWeight: 700 }}>$47</p>
							<Link to="/checkout" className="cta-button cta-secondary">Get Education</Link>
						</div>
					</div>
				</section>
			</div>
			<StickyCTA />
		</div>
	);
}


