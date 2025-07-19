import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

// Role-based redirect logic
const getRoleBasedDashboard = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'member':
      return '/dashboard/member';
    case 'reseller':
    case 'affiliate':
      return '/dashboard/reseller';
    case 'pro_reseller':
      return '/dashboard/pro';
    default:
      return '/dashboard/member';
  }
};

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  allowedRoles = null,
  redirectToDashboard = false 
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("revenue-ripple-auth-token");

  // Debug logging
  console.log("ProtectedRoute:", {
    user,
    loading,
    requireAdmin,
    allowedRoles,
    redirectToDashboard,
    path: location.pathname,
  });

  // Show a loading spinner while auth state is loading
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based dashboard redirect (for /dashboard route)
  if (redirectToDashboard && location.pathname === '/dashboard') {
    const roleDashboard = getRoleBasedDashboard(user.role);
    console.log(`Redirecting ${user.role} user to ${roleDashboard}`);
    return <Navigate to={roleDashboard} replace />;
  }

  // Check if user has required admin role
  if (requireAdmin) {
    console.log("Checking admin role:", {
      userRole: user?.role,
      isAdmin: user?.role === "admin",
    });

    if (user?.role !== "admin") {
      console.log("User is not admin, showing access denied");
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
          <p>Current role: {user.role}</p>
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
  }

  // Check allowed roles if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("User role not allowed:", {
      userRole: user.role,
      allowedRoles
    });
    
    // Redirect to appropriate dashboard instead of showing error
    const roleDashboard = getRoleBasedDashboard(user.role);
    return <Navigate to={roleDashboard} replace />;
  }

  // Wrap children in error boundary for safety
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
