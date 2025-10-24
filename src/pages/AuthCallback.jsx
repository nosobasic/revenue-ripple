import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    console.log('🔵 AuthCallback mounted');
    console.log('Current URL:', window.location.href);
    console.log('User:', user);
    console.log('Loading:', loading);
    
    const handleCallback = async () => {
      if (hasRedirected) {
        console.log('⚠️ Already redirected, skipping');
        return;
      }
      
      try {
        setDebugInfo('Waiting for auth to settle...');
        console.log('⏳ Waiting 1.5 seconds for Supabase to process...');
        
        // Wait a moment for Supabase to fully process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setDebugInfo('Checking session...');
        console.log('🔍 Checking for session...');
        
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session result:', { session: !!session, error });
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setDebugInfo('Error: ' + error.message);
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          // Get the stored redirect path or default to checkout
          const storedPath = localStorage.getItem('oauth-redirect-path');
          const redirectPath = storedPath || '/checkout?product=membership';
          
          console.log('✅ Session found!');
          console.log('📍 Stored redirect path:', storedPath);
          console.log('📍 Final redirect path:', redirectPath);
          console.log('👤 Session user:', session.user.email);
          
          setDebugInfo('Redirecting to: ' + redirectPath);
          localStorage.removeItem('oauth-redirect-path');
          
          setHasRedirected(true);
          
          // Navigate to the intended destination
          console.log('🚀 Navigating to:', redirectPath);
          navigate(redirectPath, { replace: true });
        } else if (!loading) {
          // No session and not loading anymore - something went wrong
          console.error('❌ No session found after OAuth callback');
          console.log('Loading state:', loading);
          console.log('User state:', user);
          setDebugInfo('No session found - redirecting to register');
          
          // Wait a bit longer and try one more time
          console.log('🔄 Trying one more time after 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession) {
            console.log('✅ Got session on retry!');
            const redirectPath = localStorage.getItem('oauth-redirect-path') || '/checkout?product=membership';
            localStorage.removeItem('oauth-redirect-path');
            navigate(redirectPath, { replace: true });
          } else {
            console.log('❌ Still no session, giving up');
            navigate('/register', { replace: true });
          }
        }
      } catch (error) {
        console.error('💥 Error in OAuth callback:', error);
        setDebugInfo('Error: ' + error.message);
        navigate('/register', { replace: true });
      }
    };

    handleCallback();
  }, [user, loading, navigate, hasRedirected]);

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

