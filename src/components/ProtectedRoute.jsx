import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavigationUtils } from '../utils/navigationUtils';

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

  // Check if user has access to this route
  if (!NavigationUtils.hasRouteAccess(user, location.pathname, requireAdmin)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = NavigationUtils.getDashboardRoute(user);
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has access
  return children;
};

export default ProtectedRoute;
