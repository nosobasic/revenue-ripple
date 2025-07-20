import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClearCacheButton from '../components/ClearCacheButton';
import '../pages.css';
import Navbar from '../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuth();

  // Get the intended redirect path, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Check for success message from password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true }); // Redirect to intended page
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset instructions have been sent to your email address');
      setShowForgotPassword(false);
    } catch (error) {
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-box">
        <div className="auth-header">
          <h2 className="auth-title">
            {showForgotPassword ? 'Reset your password' : 'Sign in to your account'}
          </h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link to="/register" className="auth-link">
              create a new account
            </Link>
          </p>
        </div>
        
        {showForgotPassword ? (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email-address">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="auth-link"
              >
                Back to login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            {successMessage && (
              <div className="success-message" style={{ 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                marginBottom: '1rem',
                border: '1px solid #c3e6cb'
              }}>
                {successMessage}
              </div>
            )}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email-address">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="auth-link"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            {/* Debug: Cache clear button for troubleshooting */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#666' }}>
              Having issues? <ClearCacheButton />
            </div>
          </form>
        )}
      </div>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}