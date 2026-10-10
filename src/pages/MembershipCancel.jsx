import { Link } from 'react-router-dom';

export default function MembershipCancel() {
  return <main className="auth-container"><div className="auth-box">
    <h1>Checkout canceled</h1>
    <p>You returned from checkout. This page does not cancel a subscription or change your existing account access.</p>
    <p>If you are unsure whether a payment completed, check your receipt or contact support before starting another purchase.</p>
    <p><Link to="/dashboard">Return to learning</Link> · <Link to="/membership">Membership &amp; program status</Link></p>
  </div></main>;
}
