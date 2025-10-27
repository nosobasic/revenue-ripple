import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import Counters from '../components/Proof/Counters';
import CaseTiles from '../components/Proof/CaseTiles';
import ROICalculator from '../components/ROI/Calculator';

function ProofSnapshot() {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
      <div style={{ fontWeight: 700, color: '#111827' }}>Before/After snapshot</div>
      <div style={{ color: '#6b7280' }}>Stubbed widget — real data later</div>
    </div>
  );
}

export default function ForMarketers() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Get found by AI assistants.</h1>
          <p className="text-slate-600 mt-2">Track your mentions across ChatGPT, Perplexity & more. Publish one optimized asset today and watch visibility move.</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link to="/os-core#start" className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">Start OS Core (Tracker + Command Center included)</Link>
          </div>
        </header>
        <ProofSnapshot />
        <Counters />
        <CaseTiles />
        <ROICalculator />
      </div>
    </div>
  );
}

