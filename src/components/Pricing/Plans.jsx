import { Link } from 'react-router-dom';
import { emit } from '../../utils/analytics';

const plans = [
  {
    id: 'core',
    name: 'OS Core',
    price: '$197/mo',
    tagline: 'Most Popular',
    features: [
      'AI Visibility Tracker (full)',
      'Command Center (standard monitors)',
      'All Training + Templates/Swipe Library',
      '1 seat, 3 integrations',
      'Email support',
      '30-day guarantee'
    ],
    cta: { label: 'Choose Core', to: '/checkout?plan=core' },
    highlighted: true
  },
  {
    id: 'pro',
    name: 'OS Pro',
    price: '$297–$497/mo',
    features: [
      'Everything in Core',
      'Advanced monitors',
      'Priority support',
      'Quarterly strategy call',
      'White-label reports',
      '3–5 seats, 6–10 integrations'
    ],
    cta: { label: 'Choose Pro', to: '/checkout?plan=pro' }
  },
  {
    id: 'lite',
    name: 'AI Visibility Lite',
    price: '$29–$49/mo',
    features: [
      'Limited platforms',
      'Fewer alerts',
      'No Command Center',
      'No courses',
      'Most users upgrade within 14 days'
    ],
    cta: { label: 'Start Lite', to: '/checkout?plan=lite' }
  },
  {
    id: 'education',
    name: 'Education-Only',
    price: '$47/mo',
    features: [
      'Courses + templates only',
      'Turn on automations + visibility with Core'
    ],
    cta: { label: 'Start Education', to: '/checkout?plan=education' }
  }
];

export default function Plans() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
      {plans.map(plan => (
        <div key={plan.id} style={{
          background: 'white',
          border: plan.highlighted ? '2px solid #2563eb' : '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '1.25rem',
          boxShadow: plan.highlighted ? '0 10px 25px rgba(37,99,235,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: '#111827' }}>{plan.name}</h3>
            {plan.tagline && (
              <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>{plan.tagline}</span>
            )}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginTop: 6 }}>{plan.price}</div>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ color: '#374151', marginBottom: 6 }}>• {f}</li>
            ))}
          </ul>
          <Link to={plan.cta.to} onClick={() => emit('plan_cta_clicked', { plan: plan.id })} style={{
            display: 'inline-block',
            marginTop: 12,
            textDecoration: 'none',
            background: '#2563eb',
            color: 'white',
            padding: '0.6rem 1rem',
            borderRadius: 999,
            fontWeight: 600
          }}>
            {plan.cta.label}
          </Link>
        </div>
      ))}
    </div>
  );
}


