import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safeReturnTo, clearPurchaseIntent } from '../utils/loginRouting';

export default function AuthCallback() {
  const { user, loading, authError, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const destination = useRef(safeReturnTo(sessionStorage.getItem('oauth-return-to')));
  const redirected = useRef(false);
  useEffect(() => {
    if (loading || authError || redirected.current) return;
    redirected.current = true;
    clearPurchaseIntent();
    navigate(user ? destination.current : '/login', { replace: true });
  }, [user, loading, authError, navigate]);
  return <main className="auth-container"><div className="auth-box">
    <h1>Signing you in</h1>
    {authError ? <><p role="alert">{authError}</p><button onClick={refreshUserData}>Retry account check</button><Link to="/login">Return to sign in</Link></>
      : <p>Verifying your account…</p>}
  </div></main>;
}
