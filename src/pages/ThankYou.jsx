import { Link } from 'react-router-dom';
import './checkout.css';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export default function ThankYou() {
  const [status, setStatus] = useState("");
  const refUserId = localStorage.getItem('affiliate_ref');

  const commissionPercent = 0.5; // 0.5%
  const baseAmount = 47;
  const amount = (commissionPercent / 100) * baseAmount;

  // const commission = (0.5 / 100) * 47;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    if (redirectStatus) {
      setStatus(redirectStatus);
    }
  }, []);

  useEffect(() => {
    if (status === "succeeded" && refUserId) {
      saveCommission();
    }
  }, [status, refUserId]);

  const saveCommission = async () => {
    if (status !== "succeeded" || !refUserId) return;
  
    const commissionPercent = 0.5;   // 0.5%
    const baseAmount = 47;
    const addAmount = (commissionPercent / 100) * baseAmount;
  
    // READ (will return row only if SELECT policy allows)
    const { data: existing, error: selErr } = await supabase
      .from("commissions")
      .select("id, amount, commission")
      .eq("referrer_username", refUserId)
      .maybeSingle();
  
    if (selErr) {
      console.error("Select error:", selErr);
      return;
    }

    console.log("existing",existing)
  
    if (existing) {
      // UPDATE
      const { error: updErr } = await supabase
        .from("commissions")
        .update({
          amount: Number(existing.amount ?? 0) + addAmount.toFixed(2),
          commission: Number(existing.commission ?? 0) + addAmount.toFixed(2),
          status: "active",
        })
        .eq("id", existing.id);
  
      if (updErr) console.error("Update error:", updErr);
    } else {
      // INSERT
      const { error: insErr } = await supabase
        .from("commissions")
        .insert({
          referrer_username: refUserId,
          amount: addAmount.toFixed(2),
          commission: addAmount.toFixed(2),
          tier: "membership",
          email: "affiliate@revenueripple.org", // apni email set karo
          status: "active",
        });
  
      if (insErr) console.error("Insert error:", insErr);
    }
  };
  

  console.log("status====", refUserId, status)
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