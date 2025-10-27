import { useEffect, useRef, useState } from 'react';
import { emit } from '../../utils/analytics';

export default function Counters({ incidentsResolvedWeek = 42, mentionsCapturedWeek = 128 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          emit('counters_viewed');
        }
      });
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      <CounterCard label="Incidents auto-resolved (7d)" target={incidentsResolvedWeek} visible={visible} />
      <CounterCard label="AI mentions captured (7d)" target={mentionsCapturedWeek} visible={visible} />
    </div>
  );
}

function CounterCard({ label, target, visible }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame;
    const duration = 800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(target * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>{count}</div>
      <div style={{ color: '#374151' }}>{label}</div>
    </div>
  );
}

