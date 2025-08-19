import { useMemo, useState } from 'react';
import { emit } from '../../utils/analytics';

export default function ROICalculator() {
  const [inputs, setInputs] = useState({
    leadValue: 200,
    assetsPerMonth: 4,
    baselineVisibility: 5,
    targetVisibility: 15
  });

  const result = useMemo(() => {
    const { leadValue, assetsPerMonth, baselineVisibility, targetVisibility } = inputs;
    const deltaVisibility = Math.max(0, targetVisibility - baselineVisibility) / 100;
    const incrementalLeads = Math.round(assetsPerMonth * deltaVisibility * 10);
    const incrementalRevenue = incrementalLeads * leadValue;
    const monthlyCoreCost = 197;
    const paybackDays = Math.max(1, Math.ceil((monthlyCoreCost / Math.max(1, incrementalRevenue)) * 30));
    return { incrementalLeads, incrementalRevenue, paybackDays };
  }, [inputs]);

  function onCalculate() {
    emit('roi_calculated', { ...inputs, ...result });
  }

  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
      <h3 style={{ marginTop: 0, color: '#111827' }}>ROI Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <NumberField label="Avg lead value ($)" value={inputs.leadValue} onChange={(v) => setInputs(i => ({ ...i, leadValue: v }))} />
        <NumberField label="Assets per month" value={inputs.assetsPerMonth} onChange={(v) => setInputs(i => ({ ...i, assetsPerMonth: v }))} />
        <NumberField label="Baseline visibility %" value={inputs.baselineVisibility} onChange={(v) => setInputs(i => ({ ...i, baselineVisibility: v }))} />
        <NumberField label="Target visibility %" value={inputs.targetVisibility} onChange={(v) => setInputs(i => ({ ...i, targetVisibility: v }))} />
      </div>
      <div style={{ marginTop: 12, color: '#374151' }}>
        Incremental leads/mo: <strong>{result.incrementalLeads}</strong> · Incremental revenue/mo: <strong>${result.incrementalRevenue}</strong> · Payback: <strong>{result.paybackDays} days</strong>
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: '#6b7280' }}>
        Why Core is cheaper than stacking point tools: tighter integration and auto-heal reduce hidden ops costs.
      </div>
      <button onClick={onCalculate} style={{ marginTop: 12, background: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: 999, fontWeight: 600 }}>Recalculate</button>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem' }} />
    </label>
  );
}


