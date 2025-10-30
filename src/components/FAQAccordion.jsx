import React, { useState } from 'react';

export default function FAQAccordion({ faqs }) {
  const [open, setOpen] = useState(null);
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-8 border border-gray-200 rounded-xl divide-y">
      {faqs.map((f, idx) => (
        <div key={idx}>
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">{f.q}</span>
            <span className="text-gray-500">{open === idx ? '−' : '+'}</span>
          </button>
          {open === idx && (
            <div className="px-5 pb-5 text-gray-700">
              {f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


