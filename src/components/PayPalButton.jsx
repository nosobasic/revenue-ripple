import { useEffect, useRef } from 'react';

export default function PayPalButton() {
  const paypalRef = useRef();

  useEffect(() => {
    // Load PayPal SDK script
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AT0hygYRu60DYPA3uK6A32GmVlspeAA-aLbCqCCKdulrPO7ZE3VSuRIJziNp7768YHeu2cY1NHiWo9xa&vault=true&intent=subscription";
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              plan_id: 'P-50X75156CH2853103NAGOUGA'
            });
          },
          onApprove: function(data, actions) {
            window.location.href = '/thank-you';
          }
        }).render('#paypal-button-container');
      }
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="paypal-button-container" ref={paypalRef} />;
} 