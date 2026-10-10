import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { acquisitionForSubmission } from '../utils/acquisitionAttribution';
import { API_ENDPOINTS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import './checkout.css';

const products = {
  membership: { title: 'Membership', endpoint: API_ENDPOINTS.MEMBERSHIP_SESSION },
  quarterly: { title: 'Quarterly Growth', endpoint: API_ENDPOINTS.QUARTERLY_GROWTH_SESSION },
  dmd: { title: 'Digital Marketing Domination', endpoint: API_ENDPOINTS.TRIPWIRE_SESSION },
};

export default function Checkout() {
  const [params] = useSearchParams();
  const location = useLocation();
  const product = params.get('product');
  const offer = Object.hasOwn(products, product) ? products[product] : null;
  const { user, session, loading, authError, refreshUserData } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(null);
  const identity = session?.user?.id;
  useEffect(() => {
    setBusy(false);
    setError('');
    return () => { request.current?.abort(); request.current = null; };
  }, [identity, product]);

  async function continueToPayment() {
    if (request.current || !offer || (product !== 'dmd' && (!user || !session || loading || authError))) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${offer.endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...acquisitionForSubmission(), referrer_username: localStorage.getItem('ref_id') || 'none' }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 503
        ? 'Purchases are currently unavailable. Your existing access is unchanged.'
        : 'Payment setup failed. Your existing access is unchanged. You can retry or return to learning.');
      const destination = new URL(data.url);
      if (destination.protocol !== 'https:' || destination.hostname !== 'checkout.stripe.com') throw new Error('Unable to verify the payment destination. Your existing access is unchanged.');
      if (!controller.signal.aborted && request.current === controller) window.location.assign(destination.href);
    } catch (failure) {
      if (request.current === controller) setError(controller.signal.aborted
        ? 'Payment setup timed out. Your existing access is unchanged.' : failure.message);
    } finally {
      clearTimeout(timer);
      if (request.current === controller) { request.current = null; setBusy(false); }
    }
  }

  if (product !== 'dmd') {
    if (loading) return <p>Verifying your account…</p>;
    if (authError) return <div role="alert">{authError}<button onClick={refreshUserData}>Retry account check</button></div>;
    if (!session || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <main className="checkout-container"><div className="checkout-content">
    <h1>{offer ? `Review ${offer.title} purchase` : 'Purchase unavailable'}</h1>
    {!offer && <p>This purchase option is not available. Check membership &amp; program status for supported offers.</p>}
    <p>Signing in does not require a purchase. Free learning remains available.</p>
    {user && <p>Your existing verified account access is unchanged by this page.</p>}
    {error && <p role="alert">{error}</p>}
    {offer && <><p>Continue only if you intend to make this purchase. Review the price and terms on Stripe before paying.</p>
      <button disabled={busy} onClick={continueToPayment}>{busy ? 'Opening payment options…' : 'Continue to payment'}</button></>}
    <p><Link to="/dashboard">Return to learning</Link> · <Link to="/membership">Membership &amp; program status</Link></p>
  </div></main>;
}
