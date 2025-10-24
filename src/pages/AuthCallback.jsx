import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription;

    const handleCallback = async () => {
      if (hasRedirected) return;

      try {
        // Set up auth state listener for SIGNED_IN event
        authSubscription = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session && mounted && !hasRedirected) {
            setHasRedirected(true);
            
            const storedPath = localStorage.getItem('oauth-redirect-path');
            const redirectPath = storedPath || '/checkout?product=membership';
            localStorage.removeItem('oauth-redirect-path');
            
            // Small delay to ensure state is fully synced
            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 500);
          }
        });

        // Check if session already exists
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/register', { replace: true });
          return;
        }

        if (session && mounted && !hasRedirected) {
          setHasRedirected(true);
          
          const storedPath = localStorage.getItem('oauth-redirect-path');
          const redirectPath = storedPath || '/checkout?product=membership';
          localStorage.removeItem('oauth-redirect-path');
          
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 500);
        } else {
          // Fallback if auth state change doesn't fire within 5 seconds
          setTimeout(() => {
            if (!hasRedirected && mounted) {
              supabase.auth.getSession().then(({ data: { session: finalSession } }) => {
                if (finalSession) {
                  const redirectPath = localStorage.getItem('oauth-redirect-path') || '/checkout?product=membership';
                  localStorage.removeItem('oauth-redirect-path');
                  navigate(redirectPath, { replace: true });
                } else {
                  navigate('/register', { replace: true });
                }
              });
            }
          }, 5000);
        }
      } catch (error) {
        console.error('OAuth callback exception:', error);
        navigate('/register', { replace: true });
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.subscription?.unsubscribe();
      }
    };
  }, [navigate, hasRedirected]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        textAlign: 'center',
        background: 'white',
        padding: '3rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '400px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.5rem'
        }} />
        <h2 style={{ 
          color: '#1f2937', 
          fontSize: '1.5rem', 
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          Setting up your account
        </h2>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1rem',
          margin: '0'
        }}>
          Redirecting you now...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

