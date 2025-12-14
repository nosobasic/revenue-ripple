import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import { useEffect, useState } from "react";
import React from "react";

// ErrorBoundary component to catch errors in child components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "red", padding: 20 }}>
          Something went wrong: {this.state.error?.message || "Unknown error"}
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading component to prevent white screen
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

export default function ProtectedRoute({ children, requireAdmin = false, requirePayment = false }) {
  const { user, loading } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const token = localStorage.getItem("revenue-ripple-auth-token");

  // Show a loading spinner while auth state is loading
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check payment status if required (but allow admin access)
  // IMPORTANT: Check user.has_paid directly from the user object
  // This ensures we're checking the actual database value, not stale hook data
  if (requirePayment && !isAdmin) {
    // Check has_paid directly - must be explicitly true
    const hasPaid = user?.has_paid === true;
    
    // If user hasn't paid, redirect to checkout
    if (!hasPaid) {
      // Store intended path for redirect after checkout
      if (location.pathname !== '/checkout' && location.pathname !== '/membership-success') {
        sessionStorage.setItem('intended-path', location.pathname);
      }
      return <Navigate to="/checkout?product=membership" state={{ from: location }} replace />;
    }
    // If user has paid, allow access (don't redirect)
  }

  // Check if user has required role
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ 
        color: "red", 
        padding: 20, 
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
        <h2>Access Denied</h2>
        <p>You do not have admin privileges to access this page.</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Wrap children in error boundary for safety
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
