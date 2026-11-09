import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safeReturnTo } from '../utils/loginRouting';

export default function SignedOutRoute({ children }) {
  const { user, session, loading, authError, refreshUserData } = useAuth();
  const location = useLocation();
  if (!loading && !authError && session && user) return <Navigate to={safeReturnTo(location.state?.from)} replace />;
  // Preserve form state and pending handlers while shared auth checks run.
  // Hidden forms cannot be interacted with during verification.
  return <>
    {loading && <p role="status">Checking your account…</p>}
    {!loading && authError && <div role="alert">{authError}<button onClick={refreshUserData}>Retry account check</button></div>}
    <div hidden={loading || Boolean(authError)}>{children}</div>
  </>;
}
