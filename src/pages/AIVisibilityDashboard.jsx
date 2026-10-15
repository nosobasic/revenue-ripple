import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import VisibilityTool from '../components/VisibilityTool';
import { authenticatedFetch } from '../lib/authenticatedFetch';
export default function AIVisibilityDashboard() {
  return <div className="min-h-screen bg-slate-50"><SEO title="AI Search Visibility Snapshot" description="Review three API search observations and three practical actions. No ranking guarantees." /><Navbar /><VisibilityTool api={authenticatedFetch} /></div>;
}
