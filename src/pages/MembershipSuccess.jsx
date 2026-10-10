import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MembershipSuccess() {
  const { user, loading, authError, refreshUserData } = useAuth();
  return <main className="auth-container"><div className="auth-box">
    <h1>Payment return</h1>
    <p>This return link does not verify a payment or grant membership. Paid access depends on server-confirmed billing records.</p>
    <p>Your existing access remains available. This page cannot verify which transaction paid for it.</p>
    {user && <section aria-label="Verified account status">
      <h2>Current account status</h2>
      <p>Role: {user.role || 'Not recorded'} · Plan: {user.plan || 'Free learning'}</p>
      <p>Recorded payment status: {user.payment_status || 'Not recorded'}</p>
    </section>}
    {authError && <p role="alert">{authError}</p>}
    <button disabled={loading} onClick={refreshUserData}>{loading ? 'Checking account…' : 'Refresh account'}</button>
    <p><Link to="/dashboard">Return to learning</Link> · <Link to="/membership">Membership &amp; program status</Link></p>
  </div></main>;
}
