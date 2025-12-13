import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FaCheckCircle, FaRocket } from 'react-icons/fa';

export default function MembershipSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPaymentAndRedirect = async () => {
      try {
        // Refresh user data to get latest payment status
        if (user) {
          await refreshUserData();
        }

        // Wait a moment for webhook to process (if needed)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Refresh again to ensure we have latest data
        if (user) {
          await refreshUserData();
        }

        // Check if user now has subscription
        // If they do, redirect to dashboard
        // If not, wait a bit more and check again (webhook might be delayed)
        let attempts = 0;
        const maxAttempts = 5;
        
        const checkPaymentStatus = async () => {
          if (user) {
            await refreshUserData();
          }
          
          // Re-check subscription status
          // If user has paid or is admin, go to dashboard
          if (user?.has_paid || user?.role === 'admin') {
            setIsVerifying(false);
            // Small delay to show success message
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait and try again
            setTimeout(checkPaymentStatus, 2000);
          } else {
            // After max attempts, still redirect to dashboard
            // The webhook will update payment status eventually
            setIsVerifying(false);
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          }
        };

        checkPaymentStatus();
      } catch (error) {
        console.error('Error verifying payment:', error);
        // On error, still redirect to dashboard after delay
        setIsVerifying(false);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      }
    };

    verifyPaymentAndRedirect();
  }, [user, navigate, refreshUserData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          background: 'white',
          padding: '3rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Verifying Your Payment...
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                Please wait while we confirm your subscription.
              </p>
            </>
          ) : (
            <>
              <FaCheckCircle style={{ fontSize: '4rem', color: '#10b981', margin: '0 auto 1.5rem' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Welcome to Revenue Ripple!
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Your membership has been activated. You now have access to all premium features.
              </p>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <p style={{ color: '#059669', margin: 0, fontSize: '0.875rem' }}>
                  Redirecting you to your dashboard...
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FaRocket /> Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
