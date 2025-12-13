import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../hooks/useUserRole';

/**
 * OnboardingGate component ensures users complete checkout before accessing protected content.
 * 
 * Behavior:
 * - If user is loading: show loading state
 * - If user is not authenticated: redirect to login
 * - If user has no subscription and is not admin: redirect to checkout
 * - If user has subscription or is admin: render children
 */
export default function OnboardingGate({ children, requireSubscription = true }) {
  const { user, loading } = useAuth();
  const { requiresCheckout, isAdmin } = useUserRole();
  const location = useLocation();
  const token = localStorage.getItem("revenue-ripple-auth-token");

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking your account status...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If subscription is required and user hasn't paid (and isn't admin), redirect to checkout
  if (requireSubscription && requiresCheckout && !isAdmin) {
    // Store the intended destination so we can redirect back after checkout
    if (location.pathname !== '/checkout') {
      sessionStorage.setItem('intended-path', location.pathname);
    }
    return <Navigate to="/checkout?product=membership" replace />;
  }

  // User has valid access, render children
  return children;
}
