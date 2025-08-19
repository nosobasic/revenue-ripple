import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import CaseTiles from '../components/Proof/CaseTiles';

export default function ForBuilders() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Your 7-Day Win Plan.</h1>
          <p className="text-slate-600 mt-2">Publish one asset, turn on 3 monitors, and fix one automation leak. Tools do the heavy lifting; training keeps you confident.</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link to="/onboarding" className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">Start OS Core & begin Day 0 setup</Link>
          </div>
        </header>
        <CaseTiles />
      </div>
    </div>
  );
}

