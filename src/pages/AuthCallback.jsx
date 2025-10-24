import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasRedirected) return;
      
      try {
        // Wait a moment for Supabase to fully process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          // Get the stored redirect path or default to checkout
          const redirectPath = localStorage.getItem('oauth-redirect-path') || '/checkout?product=membership';
          localStorage.removeItem('oauth-redirect-path');
          
          console.log('OAuth callback - redirecting to:', redirectPath);
          setHasRedirected(true);
          
          // Navigate to the intended destination
          navigate(redirectPath, { replace: true });
        } else if (!loading) {
          // No session and not loading anymore - something went wrong
          console.error('No session found after OAuth callback');
          navigate('/register', { replace: true });
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
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
          margin: 0
        }}>
          This will only take a moment...
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

