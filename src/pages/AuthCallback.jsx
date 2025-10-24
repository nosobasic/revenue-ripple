import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Processing authentication...');

  useEffect(() => {
    console.log('🔵 AuthCallback mounted');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    
    let mounted = true;
    let authSubscription;

    const handleCallback = async () => {
      if (hasRedirected) {
        console.log('⚠️ Already redirected, skipping');
        return;
      }

      try {
        setDebugInfo('Detecting OAuth session...');
        console.log('👂 Setting up auth state listener...');

        // Listen for auth state changes - this is more reliable than checking session
        authSubscription = supabase.auth.onAuthStateChange((event, session) => {
          console.log('🔔 Auth state change:', event);
          console.log('Session:', !!session);
          
          if (event === 'SIGNED_IN' && session && mounted && !hasRedirected) {
            console.log('✅ User signed in via OAuth!');
            console.log('👤 User email:', session.user.email);
            
            setHasRedirected(true);
            
            // Get the stored redirect path or default to checkout
            const storedPath = localStorage.getItem('oauth-redirect-path');
            const redirectPath = storedPath || '/checkout?product=membership';
            
            console.log('📍 Redirect path:', redirectPath);
            setDebugInfo('Success! Redirecting...');
            
            localStorage.removeItem('oauth-redirect-path');
            
            // Small delay to ensure state is saved
            setTimeout(() => {
              console.log('🚀 Navigating to:', redirectPath);
              navigate(redirectPath, { replace: true });
            }, 500);
          }
        });

        // Also do an immediate check in case the session is already there
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setDebugInfo('Authentication error');
          setTimeout(() => navigate('/register', { replace: true }), 2000);
          return;
        }

        if (session && mounted && !hasRedirected) {
          console.log('✅ Session already exists!');
          console.log('👤 User email:', session.user.email);
          
          setHasRedirected(true);
          
          const storedPath = localStorage.getItem('oauth-redirect-path');
          const redirectPath = storedPath || '/checkout?product=membership';
          
          console.log('📍 Redirect path:', redirectPath);
          setDebugInfo('Success! Redirecting...');
          
          localStorage.removeItem('oauth-redirect-path');
          
          setTimeout(() => {
            console.log('🚀 Navigating to:', redirectPath);
            navigate(redirectPath, { replace: true });
          }, 500);
        } else {
          console.log('⏳ No session yet, waiting for auth state change...');
          setDebugInfo('Waiting for authentication...');
          
          // Fallback timeout if auth state change doesn't fire
          setTimeout(() => {
            if (!hasRedirected && mounted) {
              console.log('⏰ Timeout reached, checking one last time...');
              supabase.auth.getSession().then(({ data: { session: finalSession } }) => {
                if (finalSession && !hasRedirected) {
                  console.log('✅ Found session on final check!');
                  const redirectPath = localStorage.getItem('oauth-redirect-path') || '/checkout?product=membership';
                  localStorage.removeItem('oauth-redirect-path');
                  navigate(redirectPath, { replace: true });
                } else {
                  console.log('❌ No session after timeout, redirecting to register');
                  setDebugInfo('Authentication timeout');
                  navigate('/register', { replace: true });
                }
              });
            }
          }, 5000); // 5 second timeout
        }
      } catch (error) {
        console.error('💥 Error in OAuth callback:', error);
        setDebugInfo('Error: ' + error.message);
        setTimeout(() => navigate('/register', { replace: true }), 2000);
      }
    };

    handleCallback();

    // Cleanup
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
          margin: '0 0 1rem 0'
        }}>
          This will only take a moment...
        </p>
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          margin: 0
        }}>
          {debugInfo}
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

