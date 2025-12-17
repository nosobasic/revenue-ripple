import React, { useState } from 'react';

export default function FAQAccordion({ faqs }) {
  const [open, setOpen] = useState(null);
  if (!faqs || faqs.length === 0) return null;

  return (
    <div style={{
      marginTop: '2rem',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      background: '#ffffff',
      overflow: 'hidden'
    }}>
      {faqs.map((f, idx) => (
        <div key={idx} style={{
          borderTop: idx > 0 ? '1px solid #e5e7eb' : 'none'
        }}>
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
          >
            <span style={{
              fontWeight: 500,
              color: '#1f2937',
              fontSize: '1rem'
            }}>{f.q}</span>
            <span style={{
              color: '#6b7280',
              fontSize: '1.25rem',
              fontWeight: 300
            }}>{open === idx ? '−' : '+'}</span>
          </button>
          {open === idx && (
            <div style={{
              padding: '0 1.5rem 1.5rem',
              color: '#374151',
              lineHeight: '1.6',
              fontSize: '0.9375rem',
              background: '#ffffff'
            }}>
              {f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


