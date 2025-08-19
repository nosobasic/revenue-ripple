export default function CaseTiles() {
  const tiles = [
    { title: 'Local Service Biz', delta: '+32% leads in 21 days', note: 'Turned on 4 monitors, fixed 2 leaks' },
    { title: 'E‑commerce', delta: '+18% AOV in 30 days', note: 'Visibility content + checkout monitor' },
    { title: 'Agency', delta: '2.4x proposal win rate', note: 'Published 3 optimized assets' }
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
      {tiles.map((t) => (
        <div key={t.title} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
          <div style={{ color: '#111827', fontWeight: 700 }}>{t.title}</div>
          <div style={{ color: '#16a34a', fontWeight: 800, fontSize: 18, marginTop: 4 }}>{t.delta}</div>
          <div style={{ color: '#6b7280', marginTop: 6 }}>{t.note}</div>
        </div>
      ))}
    </div>
  );
}


