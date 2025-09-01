import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';

export default function FoundersWaitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      await supabase.from('founders_waitlist').insert({ email });
      setStatus('success');
    } catch (e) {
      setError('Could not join waitlist. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          Founders Waitlist
        </motion.h1>
        <p className="checkout-description">Founders slots are sold out. Join the waitlist to be first in line if we open more.</p>

        {status === 'success' ? (
          <div style={{ color: '#065f46' }}>
            You’re on the list! We’ll email you if new slots open.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: '0 auto' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your best email"
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: 8,
                marginBottom: 12
              }}
            />
            <button className="payment-button" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Join Waitlist'}
            </button>
            {error && <div className="payment-error" style={{ marginTop: 8 }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

