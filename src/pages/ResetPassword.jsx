import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import '../pages.css';
import Navbar from '../components/Navbar';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

//   const [accessToken, setAccessToken] = useState("");
//   const [refreshToken, setRefreshToken] = useState("");

  const fullUrl = window.location.href;

  console.log("fullURL=========",fullUrl);

//   console.log("accessToken=", accessToken, "refreshToken=",refreshToken)
  

  useEffect(() => {
    const restoreSessionFromHash = async () => {
      const hash = window.location.hash.substring(1); // remove the #
      const params = new URLSearchParams(hash);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setError('Could not restore session.');
          console.error(error);
        } else {
          console.log('✅ Session restored!', data);
        }
      } else {
        console.warn('⚠️ Tokens missing in URL fragment');
      }

    //   setSessionLoading(false);
    };

    restoreSessionFromHash();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data ,error } = await supabase.auth.updateUser({ password: newPassword });

console.log("DATA", data, "inside try error", error)

      if (error) throw error;

      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
        console.log("Eroorrr", err)
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-box">
        <div className="auth-header">
          <h2 className="auth-title">Reset your password</h2>
        </div>

        <form className="auth-form" onSubmit={handleResetPassword}>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              required
              className="form-input"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              className="form-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Updating password...' : 'Reset'}
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
