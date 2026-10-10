import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MembershipSuccess() {
  const { loading, authError, refreshUserData } = useAuth();
  return <main className="auth-container"><div className="auth-box">
    <h1>Payment return</h1>
    <p>This return link does not verify a payment or grant membership. Paid access depends on server-confirmed billing records.</p>
    <p>Your existing access remains available while payment confirmation is pending.</p>
    {authError && <p role="alert">{authError}</p>}
    <button disabled={loading} onClick={refreshUserData}>{loading ? 'Checking account…' : 'Refresh account'}</button>
    <p><Link to="/dashboard">Return to learning</Link> · <Link to="/membership">Membership &amp; program status</Link></p>
  </div></main>;
}
