import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import { API_ENDPOINTS } from '../config/constants';

export default function FoundersCheckout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const cap = campaign?.cap ?? 10;
  const sold = campaign?.sold_count ?? 0;
  const left = Math.max(cap - sold, 0);
  const isSoldOut = left <= 0 || campaign?.status === 'sold_out';

  const founderPrice = useMemo(() => ({
    annualUsd: 470, // 10 months x $47, 2 months free
    monthlyUsd: 47
  }), []);

  useEffect(() => {
    let isMounted = true;
    const fetchCampaign = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('founders_campaign')
          .select('*')
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();
        if (!isMounted) return;
        if (dbError) throw dbError;
        setCampaign(data || null);
      } catch (e) {
        // Fallback: still allow attempting checkout; UI will not show counts
        setCampaign(null);
      }
    };
    fetchCampaign();
    const interval = setInterval(fetchCampaign, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCheckout = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (isSoldOut && selectedPlan === 'annual') {
        navigate('/founders-waitlist');
        return;
      }

      if (selectedPlan === 'annual') {
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.FOUNDERS_ANNUAL_SESSION}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer_username: localStorage.getItem('ref_id') || 'none',
          })
        });
        const data = await response.json();
        if (data.sold_out) {
          navigate('/founders-waitlist');
          return;
        }
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error || 'Could not create checkout session.');
      } else {
        // Monthly backup uses existing membership session
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.MEMBERSHIP_SESSION}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer_username: localStorage.getItem('ref_id') || 'none'
          })
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error || 'Could not start monthly checkout.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          Founders Annual Fast Cash Launch
        </motion.h1>
        <p className="checkout-description">
          Lock in your Founder rate, get 2 months free, and claim your Founder badge. Risk-free 60-day refund policy.
        </p>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ border: '2px solid #2563eb', borderRadius: 12, padding: '1rem', textAlign: 'left', background: '#eff6ff' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="radio"
                name="plan"
                value="annual"
                checked={selectedPlan === 'annual'}
                onChange={() => setSelectedPlan('annual')}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#1e40af' }}>
                  Founder Annual Prepay — ${founderPrice.annualUsd} today (10 months, get 2 free)
                </div>
                <div style={{ color: '#1f2937', fontSize: 14 }}>
                  Anchored at $564/year ($47 x 12). Save ${564 - founderPrice.annualUsd} as a Founder. Rate lock guaranteed.
                </div>
                <ul style={{ marginTop: 8, paddingLeft: 18, color: '#1f2937', fontSize: 14 }}>
                  <li>Founder badge + listing</li>
                  <li>Early access to new features</li>
                  <li>Co-build sessions + concierge onboarding sprint</li>
                  <li>2 founder-only coaching calls</li>
                  <li>60-day risk-free refund policy</li>
                </ul>
                <div style={{ marginTop: 8, fontSize: 14, color: isSoldOut ? '#b91c1c' : '#065f46' }}>
                  {campaign ? (
                    isSoldOut ? 'Sold out — join waitlist' : `${sold} sold • ${left} left`
                  ) : (
                    'Limited supply — founders cap in effect'
                  )}
                </div>
              </div>
            </label>
          </div>

          <div style={{ border: '1px solid #d1d5db', borderRadius: 12, padding: '1rem', textAlign: 'left', background: 'white' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="radio"
                name="plan"
                value="monthly"
                checked={selectedPlan === 'monthly'}
                onChange={() => setSelectedPlan('monthly')}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>
                  Monthly — ${founderPrice.monthlyUsd}/mo
                </div>
                <div style={{ color: '#4b5563', fontSize: 14 }}>
                  Keep flexibility. Upgrade to Founder later if slots remain.
                </div>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="payment-error" style={{ marginTop: '1rem' }}>{error}</div>
        )}

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="payment-button"
            aria-label="Proceed to secure checkout"
          >
            {isLoading ? 'Processing...' : (selectedPlan === 'annual' ? 'Secure Founder Annual' : 'Continue with Monthly')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="cta-button cta-secondary"
            aria-label="Go back"
          >
            Back
          </button>
        </div>

        <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: 13 }}>
          🔒 Secure checkout • 60-day money-back guarantee • Encrypted and safe
        </div>
      </div>
    </div>
  );
}

