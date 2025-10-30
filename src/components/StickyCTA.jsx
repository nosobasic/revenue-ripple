import React from 'react';
import { Link } from 'react-router-dom';

export default function StickyCTA({ to = '/checkout', text = 'Start Now', subtext, visible = true }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="rounded-full shadow-lg bg-white/90 backdrop-blur px-4 py-2 flex items-center gap-3 border border-gray-200">
        <Link
          to={to}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors font-semibold"
        >
          {text}
        </Link>
        {subtext && (
          <span className="text-xs text-gray-600 hidden sm:inline">{subtext}</span>
        )}
      </div>
    </div>
  );
}


