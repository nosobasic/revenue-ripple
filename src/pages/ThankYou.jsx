import { Link } from 'react-router-dom';
import './checkout.css';
import { useEffect, useState } from 'react';
// import { supabase } from '../supabase/client';

export default function ThankYou() {
  const [status, setStatus] = useState("");
  const refUserId = localStorage.getItem('affiliate_ref');

  // const commission = (0.5 / 100) * 47;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    if (redirectStatus) {
      setStatus(redirectStatus);
    }
  }, []);

  console.log("status====", refUserId)
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
        <Link to="/" className="cta-button cta-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 