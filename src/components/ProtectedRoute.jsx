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

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, session, initialized } = useAuth();
  const location = useLocation();

  // Debug logging for troubleshooting
  console.log("ProtectedRoute:", {
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    loading,
    initialized,
    requireAdmin,
    path: location.pathname,
    hasSession: !!session,
  });

  // Show loading spinner while auth is initializing
  if (!initialized || loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated (no session or user)
  if (!session || !user) {
    console.log("No authenticated session found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required admin role
  if (requireAdmin) {
    console.log("Checking admin access:", {
      userRole: user.role,
      isAdmin: user.role === "admin",
    });

    if (user.role !== "admin") {
      console.log("User does not have admin role, showing access denied");
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
  }

  // Wrap children in error boundary for safety
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
