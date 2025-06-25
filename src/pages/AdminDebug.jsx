import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDebug = () => {
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);

  console.log('AdminDebug: Rendering with user:', user);
  console.log('AdminDebug: Auth loading:', authLoading);

  useEffect(() => {
    console.log('AdminDebug: useEffect triggered');
    console.log('AdminDebug: User data:', user);
    console.log('AdminDebug: Auth loading:', authLoading);
  }, [user, authLoading]);

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span>Loading admin panel...</span>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Check if user exists
  if (!user) {
    return (
      <div style={{ 
        minHeight: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h2 style={{ color: 'red' }}>No User Found</h2>
        <p>Please log in to access the admin panel.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Check admin role
  if (user.role !== 'admin') {
    return (
      <div style={{ 
        minHeight: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h2 style={{ color: 'red' }}>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
        <p>Current role: <strong>{user.role}</strong></p>
        <p>User ID: <strong>{user.id}</strong></p>
        <p>Email: <strong>{user.email}</strong></p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Success - user is admin
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      background: '#f1f5f9'
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          Admin Panel Debug
        </h1>
        
        <div style={{ marginBottom: '24px' }}>
          <h3>User Information:</h3>
          <pre style={{ 
            background: '#f8fafc', 
            padding: '12px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '14px'
          }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3>Admin Access Status:</h3>
          <p style={{ color: 'green', fontWeight: 'bold' }}>
            ✅ Admin access confirmed
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h4>Error:</h4>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        <div>
          <h3>Quick Actions:</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => {
                console.log('Testing Supabase connection...');
                setError(null);
              }}
            >
              Test Connection
            </button>
            
            <button 
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/admin'}
            >
              Go to Full Admin
            </button>
            
            <button 
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;