import { useEffect, useMemo, useState } from 'react';
import { emit } from '../../utils/analytics';

/**
 * @param {{ plan: any, onComplete?: ()=>void }} props
 */
export default function Checklist({ plan, onComplete }) {
  const [gates, setGates] = useState({});

  const allGates = useMemo(() => {
    const set = new Set();
    plan.days.forEach(d => d.gates?.forEach(g => set.add(g)));
    plan.trialUnlockGate?.forEach(g => set.add(g));
    return Array.from(set);
  }, [plan]);

  useEffect(() => {
    const initial = {};
    allGates.forEach(g => { initial[g] = false; });
    setGates(initial);
  }, [allGates]);

  const completion = useMemo(() => {
    const total = plan.days.length;
    const completed = plan.days.filter(d => d.gates?.every(g => isGateMet(gates, g))).length;
    const percent = Math.round((completed / total) * 100);
    const trialUnlocked = plan.trialUnlockGate?.every(g => isGateMet(gates, g));
    return { completed, total, percent, trialUnlocked };
  }, [plan, gates]);

  useEffect(() => {
    if (completion.trialUnlocked) {
      emit('trial_unlocked');
    }
  }, [completion.trialUnlocked]);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{plan.title}</h2>
        <ProgressBar percent={completion.percent} />
        <div style={{ color: '#6b7280', marginTop: 6 }}>{completion.completed}/{completion.total} days gated complete</div>
        {!completion.trialUnlocked && (
          <div style={{ marginTop: 6, color: '#b45309', fontWeight: 600 }}>Free trial unlocks after Day 0 gates are done</div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {plan.days.map((day) => (
          <div key={day.day} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
            <div style={{ color: '#111827', fontWeight: 700 }}>Day {day.day}: {day.title}</div>
            <ul style={{ paddingLeft: 18, color: '#374151' }}>
              {day.tasks.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
            <div style={{ marginTop: 8 }}>
              {day.gates?.map((g) => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <input type="checkbox" checked={!!gates[g]} onChange={(e) => {
                    const next = { ...gates, [g]: e.target.checked };
                    setGates(next);
                    emit('onboarding_step_completed', { step: day.day, gate: g });
                    if (onComplete && plan.days.every(d => d.gates?.every(gg => isGateMet(next, gg)))) onComplete();
                  }} />
                  <span style={{ color: '#111827' }}>{humanizeGate(g)}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div style={{ height: 10, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: '#2563eb' }} />
    </div>
  );
}

function humanizeGate(key) {
  return key.replace(/_/g, ' ').replace(/>=/g, ' ≥ ');
}

function isGateMet(gates, gateExpr) {
  if (gateExpr.includes('>=')) {
    const [key, raw] = gateExpr.split('>=');
    const needed = Number(raw);
    return (gates[key] || 0) >= needed || gates[gateExpr] === true;
  }
  return !!gates[gateExpr];
}

