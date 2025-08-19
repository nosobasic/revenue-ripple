import { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client.jsx';
import { emit } from '../utils/analytics';

export default function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [bump, setBump] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [prSupported, setPrSupported] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Revenue Ripple Core', amount: 19700 },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setPrSupported(true);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      try {
        // Ensure email captured for metadata
        const payerEmail = ev.payerEmail || email;
        if (payerEmail) {
          localStorage.setItem('lead_email', payerEmail);
        }
        if (bump) {
          localStorage.setItem('bump_selected', 'true');
          emit('bump_selected', { selected: true });
        }

        if (clientSecret) {
          const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: ev.paymentMethod.id,
          }, { handleActions: true });

          if (confirmError) {
            ev.complete('fail');
            setErrorMessage(confirmError.message);
          } else {
            ev.complete('success');
            window.location.href = `${window.location.origin}/thank-you`;
          }
        } else {
          ev.complete('fail');
        }
      } catch (err) {
        ev.complete('fail');
      }
    });
  }, [stripe]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!completed) {
        emit('checkout_abandon', { email });
        // stub nurture trigger
        // eslint-disable-next-line no-console
        console.log('Trigger nurture email (stub)');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!completed) {
        emit('checkout_abandon', { email });
      }
    };
  }, [completed, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      if (email) {
        localStorage.setItem('lead_email', email);
        await supabase.from('leads').insert({ email, source: 'checkout', bump_selected: bump });
      }
    } catch (err) {
      // ignore
    }
    if (bump) {
      localStorage.setItem('bump_selected', 'true');
      emit('bump_selected', { selected: true });
    } else {
      localStorage.removeItem('bump_selected');
    }
    emit('checkout_started', { email, bump_selected: bump });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you`,
        payment_method_data: { billing_details: { email } },
      },
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setCompleted(true);
      navigate('/thank-you');
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          className="input"
          style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 6 }}
        />
      </div>

      {paymentRequest && prSupported && (
        <div style={{ margin: '12px 0' }}>
          <PaymentRequestButtonElement options={{ paymentRequest }} />
        </div>
      )}

      <PaymentElement />

      <div style={{ marginTop: 12, textAlign: 'left' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} />
          <span><strong>Add the $37 Dashboards Pack & SOP Vault</strong> — instantly boost visibility.</span>
        </label>
      </div>

      <button 
        disabled={isProcessing || !stripe || !elements} 
        id="submit"
        className="payment-button"
      >
        <span id="button-text">
          {isProcessing ? 'Processing...' : 'Pay now'}
        </span>
      </button>
      {errorMessage && (
        <div className="payment-error">{errorMessage}</div>
      )}
    </form>
  );
} 