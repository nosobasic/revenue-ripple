import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { authenticatedFetch } from '../lib/authenticatedFetch';

export default function VisibilityPilot() {
  const [message, setMessage] = useState('Checking your pilot access…');
  useEffect(() => {
    let active = true;
    authenticatedFetch('/api/visibility-pilot/status').then(async response => {
      if (response.status === 403) return 'This preparation pilot is currently limited to the owner account. Your existing free learning remains available.';
      if (response.status === 401) return 'Please sign in again to verify your pilot access.';
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json();
      if (data.status !== 'preparing' || data.scans_enabled !== false) throw new Error('unexpected status');
      return data.message;
    }).then(text => { if (active) setMessage(text); }).catch(() => {
      if (active) setMessage('Pilot status is temporarily unavailable. Live scans are not enabled. Please try again later.');
    });
    return () => { active = false; };
  }, []);
  return <><SEO title="AI visibility pilot preparation" noIndex /><Navbar /><main className="max-w-3xl mx-auto px-6 py-16">
    <p className="text-blue-700 font-semibold mb-3">OWNER PILOT · PREPARATION</p>
    <h1 className="text-4xl font-bold mb-6">AI visibility, with evidence.</h1>
    <p role="status" className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">{message}</p>
    <p className="mb-5">The planned snapshot checks three questions using web-search-enabled AI API responses and turns the observations into three prioritized actions. It will show the source links and time of each check.</p>
    <p className="mb-6">It is a limited sample of those responses, not a ranking score, a measurement of all AI products, or a promise that your brand will be mentioned. Results can change between checks. No live results are available in this preparation release.</p>
    <button disabled className="bg-slate-200 text-slate-600 rounded-lg px-5 py-3 mb-6 cursor-not-allowed">Live scans not available yet</button>
    <div className="flex flex-wrap gap-5"><Link className="text-blue-700 underline" to="/dashboard">Continue learning</Link><Link className="text-blue-700 underline" to="/membership">View the planned offer</Link></div>
  </main></>;
}
