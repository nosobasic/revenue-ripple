import React from 'react';
import { Link } from 'react-router-dom';

export default function OfferComparison() {
  const rows = [
    { feature: 'Immediate Access', free: 'Limited', ebook: 'Full ebook', membership: 'All trainings' },
    { feature: 'Guided Path', free: 'Basic', ebook: 'Step-by-step ebook', membership: 'Roadmaps + coaching' },
    { feature: 'Community & Support', free: '—', ebook: '—', membership: 'Yes' },
  ];

  return (
    <div className="mt-10 bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-4 text-sm font-semibold text-gray-700 bg-gray-50">
        <div className="p-4">What you get</div>
        <div className="p-4 text-center">Free</div>
        <div className="p-4 text-center">DMD Ebook ($7)</div>
        <div className="p-4 text-center">Membership ($47/mo)</div>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-4 text-sm border-t border-gray-100">
            <div className="p-4 font-medium text-gray-900">{r.feature}</div>
            <div className="p-4 text-center text-gray-700">{r.free}</div>
            <div className="p-4 text-center text-gray-700">{r.ebook}</div>
            <div className="p-4 text-center text-gray-700">{r.membership}</div>
          </div>
        ))}
      </div>
      <div className="p-4 flex flex-col sm:flex-row gap-3 justify-center bg-gray-50">
        <Link to="/dmd-variation-1" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold text-center hover:bg-blue-700">Get Ebook - $7</Link>
        <Link to="/checkout" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold text-center hover:bg-emerald-700">Join Membership - $47/mo</Link>
      </div>
    </div>
  );
}


