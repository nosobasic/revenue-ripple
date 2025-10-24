import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Wait for auth to process
    const handleCallback = async () => {
      // Give Supabase a moment to process the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the stored redirect path or default to checkout
      const redirectPath = localStorage.getItem('oauth-redirect-path') || '/checkout?product=membership';
      localStorage.removeItem('oauth-redirect-path');
      
      // Navigate to the intended destination
      navigate(redirectPath, { replace: true });
    };

    if (user) {
      handleCallback();
    }
  }, [user, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Completing sign in...
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

