import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
				<section style={{ textAlign: 'center', margin: '2rem 0', padding: '2rem 1rem', background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0ea5e9 100%)', color: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(37, 99, 235, 0.35)' }}>
					<h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1 }}>ROI visibility + auto-healing in 7 days — guaranteed.</h1>
					<p style={{ fontSize: '1.125rem', opacity: 0.95, marginTop: '0.75rem' }}>Set up in 30 minutes, see ROI signals in 7 days, or don’t pay.</p>
					<div style={{ marginTop: '1.25rem', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
						<Link to="/checkout" className="cta-button" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>Start for $197</Link>
						<Link to="#proof" className="cta-button cta-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'white' }}>See Proof</Link>
					</div>
					<div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>Apple Pay & Google Pay supported</div>
				</section>

				<section id="proof" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, margin: '2rem 0' }}>
					<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
						<h3 style={{ fontWeight: 700 }}>Proof</h3>
						<p>Live counters and anonymized ROI snapshots.</p>
					</div>
					<div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
						<h3 style={{ fontWeight: 700 }}>Demo</h3>
						<div style={{ background: '#0f172a', height: 220, borderRadius: 12, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }} />
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
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
						<div style={{ padding: 20, border: '2px solid #2563eb', borderRadius: 12, background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)' }}>
							<h3 style={{ fontWeight: 800 }}>Core</h3>
							<p style={{ fontSize: 28, fontWeight: 900 }}>$197</p>
							<Link to="/checkout" className="cta-button">Start</Link>
						</div>
						<div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12 }}>
							<h3 style={{ fontWeight: 700 }}>Lite</h3>
							<p style={{ fontSize: 22, fontWeight: 800 }}>$29</p>
							<Link to="/checkout" className="cta-button cta-secondary">Try Lite</Link>
						</div>
						<div style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12 }}>
							<h3 style={{ fontWeight: 700 }}>Education</h3>
							<p style={{ fontSize: 22, fontWeight: 800 }}>$47</p>
							<Link to="/checkout" className="cta-button cta-secondary">Get Education</Link>
						</div>
					</div>
				</section>
			</div>
			<StickyCTA />
			<Footer />
		</div>
	);
}


