import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user.role !== 'admin') {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = user.role === 'affiliate' || user.role === 'reseller' || user.role === 'pro_reseller' 
      ? '/affiliate-centre' 
      : '/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  // User is authenticated and has access
  return children;
};

export default ProtectedRoute;
