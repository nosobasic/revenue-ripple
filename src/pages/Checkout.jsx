import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import PayPalButton from '../components/PayPalButton';
import { STRIPE_CONFIG, API_ENDPOINTS, logger } from '../config/constants';
import './checkout.css';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLIC_KEY);

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PAYMENT_INTENT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((error) => {
        setClientSecret(null);
        logger.error('Stripe error:', error);
      });
  }, []);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1>Complete Your Purchase</h1>
        <p className="checkout-description">
          You're just one step away from accessing premium features. Complete your payment to get started.
        </p>
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        ) : (
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', color: '#2563eb', fontWeight: 600 }}>
              Stripe checkout is currently unavailable. Please use PayPal below.
            </div>
            <PayPalButton />
          </div>
        )}
      </div>
    </div>
  );
} 