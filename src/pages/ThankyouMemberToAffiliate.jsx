import { Link } from 'react-router-dom';
import './checkout.css';
import { useEffect } from 'react';

export default function ThankYou() {  

  useEffect(() => {
    localStorage.setItem("reloadPage", true);
    
    // Always start at top so users read instructions in order
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [])

  return (
    <div className="checkout-container">
      <div className="checkout-content" style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Thank You!</h1>
        <p className="checkout-description" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Your role has been successfully upgraded from "Member" to "Affiliate.<br />
          Welcome to Revenue Ripple! 🚀
        </p>
        <Link to="/dashboard" className="cta-button" style={{ marginRight: '1rem' }}>
          Go to Dashboard
        </Link>
        <Link to="/" className="cta-button cta-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 