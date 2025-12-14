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
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword, signInWithOAuth } = useAuth();

  // Get the intended redirect path, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

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

    try {
      await resetPassword(email);
      alert('Check your email for password reset instructions');
      setShowForgotPassword(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      setError('');
      // Use the from location or default to dashboard
      const redirectPath = from || '/dashboard';
      await signInWithOAuth(provider, redirectPath);
    } catch (error) {
      setError(error.message || `Failed to sign in with ${provider}`);
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

        {/* Social Login Buttons - Show first for easiest login */}
        {!showForgotPassword && (
          <>
            <div className="social-auth-buttons" style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                disabled={loading}
                className="social-auth-button"
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="social-divider" style={{ marginBottom: '1.5rem' }}>
              <div className="social-divider-line" />
              <span className="social-divider-text">Or sign in with email</span>
              <div className="social-divider-line" />
            </div>
          </>
        )}

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
      {/* Global footer is rendered in App.jsx */}
    </div>
  );
}