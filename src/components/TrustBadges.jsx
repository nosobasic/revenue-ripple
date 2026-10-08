import React from 'react';

export default function TrustBadges({ labels = ['Stripe Secure Checkout', 'PayPal Available', '256-bit Encryption'] }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-blue-600" />
        <span>{labels[0]}</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-emerald-600" />
        <span>{labels[1]}</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-gray-700" />
        <span>{labels[2]}</span>
      </div>
    </div>
  );
}


