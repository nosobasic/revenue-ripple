import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import Navbar from '../components/Navbar';
import '../pages.css';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if we have a valid session with password reset token
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AuthService.getSession();
        if (!session) {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (error) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await AuthService.updatePassword(newPassword);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password updated successfully! Please log in with your new password.' 
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <Navbar />
        <div className="auth-box">
          <div className="auth-header">
            <h2 className="auth-title">Password Reset Successful! ✅</h2>
            <p className="auth-subtitle">
              Your password has been updated successfully. You will be redirected to the login page in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-box">
        <div className="auth-header">
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">
            Enter your new password below
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleResetPassword}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              required
              className="form-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
          
          <div className="form-group" style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="auth-link"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
