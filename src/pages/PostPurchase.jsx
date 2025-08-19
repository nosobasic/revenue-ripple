import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PostPurchase() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="container mx-auto px-6 pt-24" style={{ textAlign: 'center' }}>
				<h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Want us to set it up with you + run a full audit?</h1>
				<p style={{ color: '#4b5563', marginBottom: 16 }}>White-glove setup and leak audit for faster ROI signals.</p>
				<Link to="/pro-quiz" className="cta-button">Take the Pro Quiz</Link>
			</div>
		</div>
	);
}


