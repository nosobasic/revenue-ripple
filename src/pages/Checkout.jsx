import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import PayPalButton from '../components/PayPalButton';
import { STRIPE_CONFIG, API_ENDPOINTS, logger } from '../config/constants';
import './checkout.css';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLIC_KEY);

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const productParam = searchParams.get('product');
    setProduct(productParam);
    
    // Determine which endpoint to use based on product
    let endpoint = API_ENDPOINTS.PAYMENT_INTENT; // Default to membership
    let requestBody = {};
    
    if (productParam === 'dmd') {
      // For DMD, use the tripwire session endpoint
      endpoint = API_ENDPOINTS.TRIPWIRE_SESSION;
      requestBody = {
        referrer_username: localStorage.getItem('ref_id') || 'none'
      };
    }

    fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((data) => {
        if (productParam === 'dmd') {
          // For DMD, redirect to Stripe checkout session
          if (data.url) {
            window.location.href = data.url;
          } else {
            setClientSecret(null);
            setIsLoading(false);
            logger.error('Failed to create checkout session:', data.error);
          }
        } else {
          // For other products, use payment intent
          setClientSecret(data.clientSecret);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        setClientSecret(null);
        setIsLoading(false);
        logger.error('Stripe error:', error);
      });
  }, [searchParams]);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  const getProductInfo = () => {
    switch (product) {
      case 'dmd':
        return {
          title: 'Digital Marketing Domination',
          description: 'Get instant access to the Digital Marketing Domination ebook for just $7.',
          price: '$7'
        };
      default:
        return {
          title: 'Complete Your Purchase',
          description: 'You\'re just one step away from accessing premium features. Complete your payment to get started.',
          price: '$47'
        };
    }
  };

  const productInfo = getProductInfo();

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1>{productInfo.title}</h1>
        <p className="checkout-description">
          {productInfo.description}
        </p>
        {isLoading ? (
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{ color: '#2563eb', fontWeight: 600 }}>Loading...</div>
          </div>
        ) : clientSecret ? (
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