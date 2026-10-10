import React from 'react';
import { Link } from 'react-router-dom';

// First-release account status only. No Stripe/backend request or portal action.
// Replace with verified billing management only after a separately reviewed rollout.
export default function MembershipStatus() {
  return <section className="profile-card profile-links" aria-labelledby="billing-heading">
    <h2 id="billing-heading">Membership & billing</h2>
    <p role="status">Online billing management is not available yet.</p>
    <p>Your existing account access is unchanged. You do not need to buy your membership again.</p>
    <p className="profile-note">Free learning remains available. Your recorded plan is not confirmation of a current Stripe subscription.</p>
    <Link to="/courses">Continue learning</Link>
    <Link to="/affiliate-centre/support">Membership support</Link>
  </section>;
}
