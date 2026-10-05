import { Link } from 'react-router-dom';
import './checkout.css';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export default function ThankYou() {
  const [status, setStatus] = useState("");
  const refUserId = localStorage.getItem('affiliate_ref');
  const memberRole = localStorage.getItem('memberRole');
  const memberId = localStorage.getItem('memberId');
  const customerEmail = localStorage.getItem('customerEmail')

  const commissionPercent = 0.5; // 0.5%
  const baseAmount = 47;
  const amount = (commissionPercent / 100) * baseAmount;

  // const commission = (0.5 / 100) * 47;

  useEffect(() => {
    // Always start at top so users read instructions in order
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    if (redirectStatus) {
      setStatus(redirectStatus);
    }
  }, []);

  // The verified backend webhook handles membership and commissions.

  return (
    <div className="checkout-container">
      <div className="checkout-content" style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Thank You!</h1>
        <p className="checkout-description" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Your subscription activates after payment verification.<br />
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