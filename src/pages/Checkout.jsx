import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import PayPalButton from '../components/PayPalButton';
import { STRIPE_CONFIG, API_ENDPOINTS, logger } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import './checkout.css';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLIC_KEY);

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [checkoutError, setCheckoutError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const productParam = searchParams.get('product');
    setProduct(productParam);
    
    // DMD is a tripwire product - no authentication required
    // For all other products, require authentication
    if (productParam !== 'dmd' && !user) {
      navigate('/register');
      return;
    }
    
    // Determine which endpoint to use based on product
    let endpoint = API_ENDPOINTS.PAYMENT_INTENT; // Default to membership
    let requestBody = {};
    
    if (productParam === 'dmd') {
      // For DMD, use the tripwire session endpoint
      endpoint = API_ENDPOINTS.TRIPWIRE_SESSION;
      requestBody = {
        referrer_username: localStorage.getItem('ref_id') || 'none'
      };
    } else {
      // For membership, use the membership session endpoint
      endpoint = API_ENDPOINTS.MEMBERSHIP_SESSION;
      requestBody = {
        referrer_username: localStorage.getItem('ref_id') || 'none'
      };
    }

    // Retry logic with exponential backoff
    const attemptFetch = async (attempt = 0) => {
      const maxRetries = 3;
      const timeout = 15000; // 15 second timeout
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (productParam === 'dmd' || productParam === 'membership') {
          // For DMD and membership, redirect to Stripe checkout session
          if (data.url) {
            window.location.href = data.url;
            return; // Exit early - redirecting away
          } else {
            throw new Error(data.error || 'No checkout URL received');
          }
        } else {
          // For other products, use payment intent
          setClientSecret(data.clientSecret);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Checkout API attempt ${attempt + 1} failed:`, error);
        
        // For dmd and membership products, we MUST use Stripe Checkout Session - never show PayPal fallback
        if (productParam === 'dmd' || productParam === 'membership') {
          // Retry if we haven't exceeded max retries
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
            console.log(`Retrying in ${delay}ms...`);
            setRetryCount(attempt + 1);
            
            setTimeout(() => {
              attemptFetch(attempt + 1);
            }, delay);
          } else {
            // All retries failed - show error, NEVER show PayPal fallback
            setIsLoading(false);
            setCheckoutError('Unable to connect to payment processor. Please refresh the page and try again.');
            logger.error('All checkout attempts failed:', error);
            console.error('Failed to create checkout session after', maxRetries, 'attempts');
          }
        } else {
          // For other products (payment intent), can show PayPal fallback
          // Retry if we haven't exceeded max retries
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
            console.log(`Retrying in ${delay}ms...`);
            setRetryCount(attempt + 1);
            
            setTimeout(() => {
              attemptFetch(attempt + 1);
            }, delay);
          } else {
            // All retries failed - show PayPal fallback for non-session products
            setClientSecret(null);
            setIsLoading(false);
            logger.error('All checkout attempts failed:', error);
            console.error('Failed to create checkout session after', maxRetries, 'attempts');
          }
        }
      }
    };
    
    attemptFetch();
  }, [searchParams, user, navigate]);

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
            <div style={{ color: '#2563eb', fontWeight: 600 }}>
              {retryCount > 0 
                ? `Connecting to payment processor... (attempt ${retryCount + 1})`
                : 'Loading payment options...'
              }
            </div>
            {retryCount > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                Please wait, we're ensuring a secure connection...
              </div>
            )}
          </div>
        ) : checkoutError ? (
          // Error state for dmd/membership products (Stripe Checkout Session required)
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', color: '#dc2626', fontWeight: 600 }}>
              {checkoutError}
            </div>
            <button
              onClick={() => {
                setCheckoutError(null);
                setIsLoading(true);
                setRetryCount(0);
                window.location.reload();
              }}
              className="cta-button"
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Retry Payment
            </button>
          </div>
        ) : clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        ) : (
          // PayPal fallback ONLY for non-session products (payment intent)
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', color: '#2563eb', fontWeight: 600 }}>
              Stripe checkout is temporarily unavailable. Please use PayPal below.
            </div>
            <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
              PayPal and credit card payments are still available.
            </div>
            <PayPalButton />
          </div>
        )}
      </div>
    </div>
  );
}