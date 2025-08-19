import Navbar from '../components/Navbar';
import Plans from '../components/Pricing/Plans';
import PricingRibbon from '../components/Common/PricingRibbon';

export default function OsCore() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-slate-900">Revenue Ripple OS — Core</h1>
        <p className="text-slate-600 mt-2">AI Visibility + Command Center + Training + Templates + Support.</p>
        <div id="start" className="mt-6">
          <Plans />
          <div className="mt-4 text-sm text-slate-600">
            <span className="font-semibold">Included in Core:</span> AI Visibility Tracker and Command Center standard monitors.
          </div>
        </div>
        <div className="mt-6">
          <PricingRibbon />
        </div>
      </div>
    </div>
  );
}


