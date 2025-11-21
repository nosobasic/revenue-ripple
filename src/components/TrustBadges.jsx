import React from 'react';

export default function TrustBadges() {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-blue-600" />
        <span>Stripe Secure Checkout</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-emerald-600" />
        <span>PayPal Available</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-gray-700" />
        <span>256-bit Encryption</span>
      </div>
    </div>
  );
}


