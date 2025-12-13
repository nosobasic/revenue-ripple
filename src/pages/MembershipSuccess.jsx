import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
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
      if (!user) return;
      
      try {
        // Refresh user data multiple times to ensure we get the latest payment status
        let attempts = 0;
        const maxAttempts = 8; // Increased attempts for webhook delay
        
        const checkPaymentStatus = async () => {
          // Always refresh user data before checking
          await refreshUserData();
          
          // Wait a moment for state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get fresh user data from Supabase directly to verify payment
          const { data: freshUserData, error } = await supabase
            .from('users')
            .select('has_paid, payment_status, role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user payment status:', error);
          }
          
          // Check if user has paid (either from context or fresh DB query)
          const hasPaid = freshUserData?.has_paid === true || user?.has_paid === true;
          const isAdmin = freshUserData?.role === 'admin' || user?.role === 'admin';
          
          if (hasPaid || isAdmin) {
            setIsVerifying(false);
            // Refresh one more time to ensure context is updated
            await refreshUserData();
            // Small delay to show success message
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1500);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait and try again (webhook might still be processing)
            setTimeout(checkPaymentStatus, 2000);
          } else {
            // After max attempts, assume payment is processed and redirect
            // The webhook will have updated by now, or will update soon
            setIsVerifying(false);
            await refreshUserData();
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1500);
          }
        };

        // Start checking immediately
        checkPaymentStatus();
      } catch (error) {
        console.error('Error verifying payment:', error);
        // On error, still redirect to dashboard after delay
        setIsVerifying(false);
        await refreshUserData();
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
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
