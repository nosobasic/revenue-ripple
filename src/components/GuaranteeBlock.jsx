import React from 'react';

export default function GuaranteeBlock({ title = '30-Day Money-Back Guarantee', points = [] }) {
  const defaultPoints = points.length ? points : [
    'Try everything risk-free for 30 days',
    'Full refund if it isn’t a fit—no questions asked',
    'Keep any downloads you’ve already received'
  ];

  return (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-green-600">✔</span>
        <h4 className="text-green-800 font-semibold">{title}</h4>
      </div>
      <ul className="list-disc pl-6 text-green-800/90 space-y-1">
        {defaultPoints.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}


