import React, { useEffect, useRef, useState } from 'react';
import { authenticatedFetch } from '../lib/authenticatedFetch';

// Bound the whole operation, including Supabase session lookup and body parsing.
// Aborting the browser request cannot prove the server did not create a portal.
async function billingRequest(path, options, signal) {
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(new Error('Billing request interrupted'));
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    return await Promise.race([
      authenticatedFetch(path, { ...options, signal }).then(async response => ({ ok: response.ok, data: await response.json() })),
      aborted,
    ]);
  } finally { signal.removeEventListener('abort', onAbort); }
}

export default function MembershipBilling({ userId }) {
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [opening, setOpening] = useState(false);
  const generation = useRef(0);
  const busy = useRef(false);
  const portalRequest = useRef(null);
  useEffect(() => {
    const current = ++generation.current;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    busy.current = false;
    setOpening(false);
    setState('loading');
    billingRequest('/api/billing/status', {}, controller.signal)
      .then(({ ok, data }) => {
        if (current !== generation.current) return;
        setState(ok && ['linked', 'not_linked'].includes(data.state) ? data.state : 'unavailable');
      }).catch(() => { if (current === generation.current) setState('unavailable'); }).finally(() => clearTimeout(timeout));
    return () => { generation.current++; clearTimeout(timeout); controller.abort(); portalRequest.current?.abort(); };
  }, [userId, attempt]);

  async function openPortal() {
    if (busy.current || state !== 'linked') return;
    const current = generation.current;
    busy.current = true;
    setOpening(true);
    const controller = new AbortController();
    portalRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const { ok, data } = await billingRequest('/api/billing/portal', { method: 'POST' }, controller.signal);
      if (current !== generation.current) return;
      const url = new URL(data.url);
      if (!ok || data.state !== 'ready' || url.protocol !== 'https:' || url.host !== 'billing.stripe.com' || url.username || url.password) throw new Error('Unavailable');
      window.location.assign(url.href);
    } catch {
      if (current === generation.current) setState('unavailable');
    } finally {
      clearTimeout(timeout);
      if (current === generation.current) { busy.current = false; setOpening(false); }
    }
  }

  return <section className="profile-card" aria-labelledby="billing-heading">
    <h2 id="billing-heading">Membership & billing</h2>
    <div role="status" aria-live="polite">
      {state === 'loading' && <p>Checking your linked billing account…</p>}
      {state === 'linked' && <p>Manage your existing Stripe billing account. Available payment and subscription options are shown in Stripe.</p>}
      {state === 'not_linked' && <p>No verified Stripe billing account is linked to this profile. This does not mean you need to buy your membership again.</p>}
      {state === 'unavailable' && <p>Billing management is unavailable right now. The request may not have completed. Try again or contact support. Your verified account access is unchanged.</p>}
    </div>
    {state === 'linked' && <button className="profile-button" onClick={openPortal} disabled={opening}>{opening ? 'Opening Stripe…' : 'Manage membership in Stripe'}</button>}
    {state === 'unavailable' && <button className="profile-button secondary" onClick={() => setAttempt(value => value + 1)}>Retry billing lookup</button>}
    <p className="profile-note">Returning from Stripe does not itself confirm a payment or change your access. Subscription changes depend on the available Stripe settings.</p>
    <a href="/affiliate-centre/support">Contact support</a>
  </section>;
}
