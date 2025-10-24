import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

console.log('🟢 AuthCallback component file loaded');

export default function AuthCallback() {
  console.log('🟡 AuthCallback component rendering');
  console.log('URL at render:', window.location.href);
  console.log('Hash at render:', window.location.hash);
  
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Processing authentication...');
  const [debugLogs, setDebugLogs] = useState(['Component rendered at ' + new Date().toISOString()]);
  
  const addLog = (message) => {
    console.log(message);
    setDebugLogs(prev => [...prev, message]);
  };
  
  console.log('🟠 State initialized, hasRedirected:', hasRedirected);

  useEffect(() => {
    addLog('🔵 useEffect START - ' + new Date().toISOString());
    addLog('Current URL: ' + window.location.href);
    addLog('Hash: ' + window.location.hash);
    
    let mounted = true;
    let authSubscription;

    const handleCallback = async () => {
      addLog('▶️ handleCallback START');
      
      if (hasRedirected) {
        addLog('⚠️ Already redirected, skipping');
        return;
      }

      try {
        setDebugInfo('Detecting OAuth session...');
        addLog('📝 Setting up auth listener...');
        
        authSubscription = supabase.auth.onAuthStateChange((event, session) => {
          addLog('🔔 AUTH EVENT: ' + event + ' | Has session: ' + !!session);
          if (session) {
            addLog('👤 User: ' + session.user?.email);
          }
          
          if (event === 'SIGNED_IN' && session && mounted && !hasRedirected) {
            addLog('✅ SIGNED_IN detected! User: ' + session.user.email);
            
            setHasRedirected(true);
            
            const storedPath = localStorage.getItem('oauth-redirect-path');
            const redirectPath = storedPath || '/checkout?product=membership';
            
            addLog('📍 Redirect to: ' + redirectPath);
            setDebugInfo('Success! Redirecting to ' + redirectPath);
            
            localStorage.removeItem('oauth-redirect-path');
            
            setTimeout(() => {
              addLog('🚀 NAVIGATING NOW to: ' + redirectPath);
              navigate(redirectPath, { replace: true });
            }, 500);
          } else {
            addLog('⏸️ Not redirecting: event=' + event + ' session=' + !!session + ' mounted=' + mounted + ' hasRedirected=' + hasRedirected);
          }
        });
        addLog('✅ Listener set up');

        addLog('🔍 Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        addLog('📊 getSession: error=' + !!error + ' session=' + !!session);
        
        if (error) {
          addLog('❌ ERROR: ' + error.message);
          setDebugInfo('Error: ' + error.message);
          setTimeout(() => {
            addLog('🔄 Redirecting to /register (error)');
            navigate('/register', { replace: true });
          }, 3000);
          return;
        }

        if (session && mounted && !hasRedirected) {
          addLog('✅ SESSION EXISTS! User: ' + session.user.email);
          
          setHasRedirected(true);
          
          const storedPath = localStorage.getItem('oauth-redirect-path');
          const redirectPath = storedPath || '/checkout?product=membership';
          
          addLog('📍 Redirect: ' + redirectPath);
          setDebugInfo('Success! Redirecting to ' + redirectPath);
          
          localStorage.removeItem('oauth-redirect-path');
          
          setTimeout(() => {
            addLog('🚀 NAVIGATING to: ' + redirectPath);
            navigate(redirectPath, { replace: true });
          }, 500);
        } else {
          addLog('⏳ No session yet. Waiting for auth state change...');
          addLog('   session=' + !!session + ' mounted=' + mounted + ' hasRedirected=' + hasRedirected);
          setDebugInfo('Waiting for authentication...');
          
          // Fallback timeout if auth state change doesn't fire
          setTimeout(() => {
            if (!hasRedirected && mounted) {
              addLog('⏰ TIMEOUT (5s) - Final check...');
              supabase.auth.getSession().then(({ data: { session: finalSession }, error: finalError }) => {
                addLog('🔍 Final: session=' + !!finalSession + ' error=' + !!finalError);
                if (finalSession && !hasRedirected) {
                  addLog('✅ Session found! User: ' + finalSession.user?.email);
                  const redirectPath = localStorage.getItem('oauth-redirect-path') || '/checkout?product=membership';
                  localStorage.removeItem('oauth-redirect-path');
                  addLog('🚀 Final redirect: ' + redirectPath);
                  navigate(redirectPath, { replace: true });
                } else {
                  addLog('❌ NO SESSION after timeout');
                  setDebugInfo('Timeout - no session');
                  navigate('/register', { replace: true });
                }
              });
            } else {
              addLog('⏰ Timeout but already handled');
            }
          }, 5000);
        }
      } catch (error) {
        addLog('💥 EXCEPTION: ' + error.message);
        setDebugInfo('Error: ' + error.message);
        setTimeout(() => {
          addLog('🔄 Redirect to /register (exception)');
          navigate('/register', { replace: true });
        }, 3000);
      }
    };

    addLog('🏃 Calling handleCallback...');
    handleCallback();

    return () => {
      addLog('🧹 Cleanup/unmount');
      mounted = false;
      if (authSubscription) {
        authSubscription.subscription?.unsubscribe();
      }
    };
  }, [navigate, hasRedirected, addLog]);

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
          margin: '0 0 1.5rem 0',
          fontWeight: '600'
        }}>
          {debugInfo}
        </p>
        
        {/* ON-SCREEN DEBUG LOGS */}
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Debug Log:
          </h3>
          {debugLogs.map((log, i) => (
            <div key={i} style={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: '#374151',
              marginBottom: '0.25rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {log}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

