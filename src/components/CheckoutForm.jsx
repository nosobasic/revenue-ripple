import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  // Check for express payment availability
  useEffect(() => {
    if (stripe) {
      // Check Apple Pay availability
      stripe.applePay.isAvailable().then(setApplePayAvailable);
      // Check Google Pay availability  
      stripe.googlePay.isAvailable().then(setGooglePayAvailable);
    }
  }, [stripe]);

  const handleApplePayClick = async () => {
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmApplePayPayment(elements, {
        return_url: `${window.location.origin}/thank-you`,
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err) {
      setErrorMessage('Apple Pay payment failed. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const handleGooglePayClick = async () => {
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmGooglePayPayment(elements, {
        return_url: `${window.location.origin}/thank-you`,
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err) {
      setErrorMessage('Google Pay payment failed. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigate('/thank-you');
    }

    setIsProcessing(false);
  };

  return (
    <div className="checkout-form">
      {/* Express Payment Methods */}
      {(applePayAvailable || googlePayAvailable) && (
        <div className="express-payment-methods mb-6">
          <div className="text-center text-gray-600 mb-4">
            <span className="bg-white px-3">Quick Pay</span>
          </div>
          <div className="flex flex-col gap-3">
            {applePayAvailable && (
              <button
                type="button"
                onClick={handleApplePayClick}
                disabled={isProcessing || !stripe}
                className="apple-pay-button bg-black text-white rounded-lg p-4 flex items-center justify-center gap-3 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Pay with Apple Pay
              </button>
            )}
            {googlePayAvailable && (
              <button
                type="button"
                onClick={handleGooglePayClick}
                disabled={isProcessing || !stripe}
                className="google-pay-button bg-white border border-gray-300 text-gray-700 rounded-lg p-4 flex items-center justify-center gap-3 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Pay with Google Pay
              </button>
            )}
          </div>
          <div className="text-center text-gray-500 text-sm mt-4">
            <span className="bg-white px-3">or</span>
          </div>
        </div>
      )}

      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement />
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
    </div>
  );
} 