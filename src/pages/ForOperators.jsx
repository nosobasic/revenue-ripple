import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import Counters from '../components/Proof/Counters';
import CaseTiles from '../components/Proof/CaseTiles';
import ROICalculator from '../components/ROI/Calculator';

export default function ForOperators() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Ship faster, break less.</h1>
          <p className="text-slate-600 mt-2">Dashboards, incident monitors, and AI visibility—live in 30 minutes.</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link to="/os-core#start" className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">Start OS Core (14-day tools access)</Link>
            <Link to="/command-center" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-full font-semibold">See Command Center demo</Link>
          </div>
          <div className="text-slate-500 text-sm mt-2">Training’s included if you ever want it. No homework required.</div>
        </header>
        <Counters />
        <CaseTiles />
        <ROICalculator />
      </div>
    </div>
  );
}

