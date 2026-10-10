import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safeReturnTo } from '../utils/loginRouting';

export default function SignedOutRoute({ children }) {
  const { user, session, loading, authError, refreshUserData } = useAuth();
  const location = useLocation();
  if (loading) return <p>Checking your account…</p>;
  if (authError) return <div role="alert">{authError}<button onClick={refreshUserData}>Retry account check</button></div>;
  if (session && user) return <Navigate to={safeReturnTo(location.state?.from)} replace />;
  return children;
}
