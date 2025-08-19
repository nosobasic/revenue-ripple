import { Link } from 'react-router-dom';
import './checkout.css';

export default function ThankYou() {
  return (
    <div className="checkout-container">
      <div className="checkout-content" style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Thank You!</h1>
        <p className="checkout-description" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Your payment was successful and your subscription is now active.<br />
          Welcome to Revenue Ripple! 🚀
        </p>
        <Link to="/dashboard" className="cta-button" style={{ marginRight: '1rem' }}>
          Go to Dashboard
        </Link>
        <Link to="/post-purchase" className="cta-button" style={{ marginRight: '1rem' }}>
          Get White-Glove Setup →
        </Link>
        <Link to="/" className="cta-button cta-secondary">
          Back to Home
        </Link>
        <div style={{ marginTop: '1.25rem', color: '#4b5563' }}>
          <a href="https://github.com/dontewillis/revenue-ripple" target="_blank" rel="noreferrer">Repo</a> • <Link to="/onboarding">Join the 7-Day ROI Plan</Link>
        </div>
      </div>
    </div>
  );
} 