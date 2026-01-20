import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages.css';
import Navbar from '../components/Navbar';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, signInWithOAuth } = useAuth();
  const [searchParams] = useSearchParams();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, firstName, lastName,"member","");
      
      // FREE ACCESS: Redirect directly to dashboard after registration
      navigate('/dashboard', { replace: true });
      
      /* PAYMENT LOGIC - COMMENTED OUT FOR FREE ACCESS
       * Uncomment this section when ready to re-enable paid plans
       *
      const redirectTo = searchParams.get('redirect');
      const planFromUrl = searchParams.get('plan');
      const planFromStorage = sessionStorage.getItem('intended-plan');
      const plan = planFromUrl || planFromStorage;
      sessionStorage.setItem('navigating-to-checkout', 'true');
      
      // Handle plan-specific redirects after registration
      if (redirectTo === 'reseller-checkout') {
        navigate('/reseller-checkout', { replace: true });
      } else if (plan === 'quarterly') {
        // Create quarterly growth session and redirect to Stripe
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/create-quarterly-growth-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referrer_username: null })
          });
          const data = await response.json();
          if (data.url) {
            sessionStorage.removeItem('intended-plan');
            window.location.href = data.url;
            return;
          }
        } catch (error) {
          console.error('Error creating quarterly session:', error);
        }
        navigate('/checkout?product=membership', { replace: true });
      } else if (plan === 'founder') {
        navigate('/founders-checkout', { replace: true });
      } else {
        // Default: redirect to membership checkout
        navigate('/checkout?product=membership', { replace: true });
      }
      
      setTimeout(() => {
        sessionStorage.removeItem('navigating-to-checkout');
        if (redirectTo !== 'reseller-checkout' && plan !== 'founder' && plan !== 'quarterly') {
          sessionStorage.removeItem('intended-plan');
        }
      }, 2000);
      * END OF PAYMENT LOGIC */
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      setError('');
      // FREE ACCESS: Redirect to dashboard after OAuth
      const redirectPath = '/dashboard';
      
      /* PAYMENT LOGIC - COMMENTED OUT FOR FREE ACCESS
       * Uncomment this section when ready to re-enable paid plans
       *
      const redirectTo = searchParams.get('redirect');
      const plan = searchParams.get('plan') || sessionStorage.getItem('intended-plan');
      let redirectPath = '/checkout?product=membership';
      
      if (redirectTo === 'reseller-checkout') {
        redirectPath = '/reseller-checkout';
      } else if (plan === 'quarterly') {
        sessionStorage.setItem('intended-plan', 'quarterly');
        redirectPath = '/checkout?product=membership';
      } else if (plan === 'founder') {
        redirectPath = '/founders-checkout';
      }
      * END OF PAYMENT LOGIC */
      
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
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link to="/login" className="auth-link">
              sign in to your account
            </Link>
          </p>
        </div>

        {/* Social Login Buttons - Show first for easiest signup */}
        <div className="social-auth-buttons" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => handleSocialSignIn('google')}
            disabled={loading}
            className="social-auth-button"
            aria-label="Sign up with Google"
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
          <span className="social-divider-text">Or sign up with email</span>
          <div className="social-divider-line" />
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              className="form-input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              className="form-input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

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
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}