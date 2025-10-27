import { Link } from 'react-router-dom';

export default function PricingRibbon() {
  return (
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <div style={{ fontWeight: 700, color: '#111827' }}>
        Education $47 + Tracker $29 + Command Center $97 = $173+
      </div>
      <div style={{ marginTop: 6 }}>
        <Link to="/os-core#start" style={{ textDecoration: 'none', fontWeight: 700, color: '#2563eb' }}>
          Core is $197/mo — Most choose Core →
        </Link>
      </div>
    </div>
  );
}

