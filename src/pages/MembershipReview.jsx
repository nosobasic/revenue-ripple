import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
export default function MembershipReview() {
  return <><SEO title="Free access and planned membership" /><Navbar /><main className="max-w-3xl mx-auto px-6 py-16">
    <h1 className="text-4xl font-bold mb-6">Learn now. Explore what’s next.</h1>
    <p className="mb-8">Your existing free learning access continues. AI visibility scans are in owner-pilot preparation and are not available yet. New premium purchases are not enabled.</p>
    <section className="border rounded-xl p-6 mb-6"><h2 className="text-2xl font-bold mb-3">Free starter access</h2><p>When scans launch: one completed scan per account, for life, covering three questions with three saved, prioritized actions. This allowance does not reset monthly.</p></section>
    <section className="border rounded-xl p-6 mb-6"><h2 className="text-2xl font-bold mb-3">Planned premium · $47/month</h2><p>Training, community, and ongoing tool access, including 10 AI visibility scans per UTC calendar month. Credits reset at 00:00 UTC on the first of the month, independently of your billing date. No rollover. Your free starter scan does not reduce the paid allowance.</p><p className="mt-3">Failed scans restore their credit. A limit of three attempts per rolling 24 hours applies to both plans. Uncertain provider outcomes may pause retries pending review.</p><p className="font-semibold mt-3">Purchases are not enabled. No automatic enrollment.</p></section>
    <section className="border rounded-xl p-6 mb-6"><h2 className="text-2xl font-bold mb-3">Affiliate and paid reseller programs</h2><p>New enrollment, pricing, commissions, and payout terms remain under review. This release does not introduce a new partner offer or earnings promise.</p></section>
    <Link className="text-blue-700 underline" to="/visibility-pilot">View pilot preparation status</Link>
  </main></>;
}
