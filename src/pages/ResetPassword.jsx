import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import Navbar from '../components/Navbar';
import '../pages.css';
=======
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import '../pages.css';
import Navbar from '../components/Navbar';
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
=======
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // This will automatically parse the URL fragments and set the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Invalid or expired reset link.');
          return;
        }

        // If no session from URL, try to get it from the hash
        if (!data.session) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              setError('Failed to establish session from reset link.');
            }
          }
        }
      } catch (err) {
        console.error('Auth setup error:', err);
        setError('Failed to process reset link.');
      }
    };

    handleAuthCallback();
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
<<<<<<< HEAD
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
=======
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No authenticated user found. Please check your reset link.');
    }
      const { data ,error } = await supabase.auth.updateUser({ password: newPassword });

console.log("DATA", data, "inside try error", error)

      if (error) throw error;
if(data.user){
  
      alert('Password updated successfully. Redirecting to login...');
      localStorage.removeItem('revenue-ripple-auth-token');
      navigate('/login')
}
    } catch (err) {
        console.log("Eroorrr", err)
      setError(err.message || 'Failed to update password.');
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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

=======
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-box">
        <div className="auth-header">
<<<<<<< HEAD
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
=======
          <h2 className="auth-title">Reset your password</h2>
        </div>

        <form className="auth-form" onSubmit={handleResetPassword}>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
            <input
              id="new-password"
              name="newPassword"
              type="password"
              required
              className="form-input"
<<<<<<< HEAD
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
=======
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
            />
          </div>

          <div className="form-group">
<<<<<<< HEAD
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>
=======
            <label htmlFor="confirm-password">Confirm Password</label>
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              className="form-input"
<<<<<<< HEAD
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
=======
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
>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
