import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import './PilotHome.css';
export default function Home() {
  const { user } = useAuth();
  return <div className="rr-home"><SEO title="Practical marketing learning and AI visibility" description="Keep learning with Revenue Ripple. Explore the planned evidence-based AI visibility tool, free starter allowance, and $47 monthly membership. Live scans and new purchases are not enabled yet." /><Navbar />
    <main>
      <p className="eyebrow">Revenue Ripple · Learn. Apply. Improve.</p>
      <h1>Build your marketing skills.<br />Make your next move clearer.</h1>
      <p className="intro">Practical learning for your business, with an AI visibility tool in preparation to help turn a small set of search observations into useful next steps.</p>
      <div className="actions"><Link className="button" to={user ? '/dashboard' : '/register'}>{user ? 'Continue learning' : 'Create a free account'}</Link><Link className="button secondary" to="/membership">Explore the planned offer</Link></div>
      <p className="notice"><strong>Available now:</strong> your existing free learning resources. <strong>In preparation:</strong> the owner-only AI visibility pilot. Live scans and new premium purchases are not available yet.</p>
      <section><p className="eyebrow">A practical place to start</p><h2>Learn a skill. Put it to work.</h2><div className="grid">
        <article className="card"><h3>Marketing foundations</h3><p>Explore lessons on email, content, funnels, and reaching the right audience.</p><Link to="/courses">Explore courses</Link></article>
        <article className="card"><h3>AI essentials</h3><p>Build your understanding of AI tools, prompts, and practical business applications.</p><Link to="/dashboard">Open your learning dashboard</Link></article>
        <article className="card"><h3>Evidence you can inspect</h3><p>The planned visibility snapshot checks three questions and presents three prioritized actions, with source links and check times.</p><Link to="/visibility-pilot">View pilot preparation</Link></article>
      </div></section>
      <section><p className="eyebrow">The planned offer</p><h2>Start free. Add ongoing tools when ready.</h2><div className="grid">
        <article className="card"><h3>Free starter</h3><p className="price">$0</p><p>Your existing free learning continues. When scans launch, each account receives one completed three-question scan and three saved actions. One lifetime allowance; no monthly reset.</p></article>
        <article className="card"><h3>Planned premium</h3><p className="price">$47<span style={{fontSize:16,fontWeight:400}}> / month</span></p><p>Training, community, and ongoing tools, including 10 scans per UTC calendar month. Credits reset on the first at 00:00 UTC, separately from the billing date. No rollover.</p><Link to="/membership">Read the offer details</Link></article>
        <article className="card"><h3>Clear limits</h3><p>Purchases are not enabled. No automatic enrollment. New affiliate and paid reseller terms remain under review. A scan is an observation, not a ranking guarantee.</p><Link to="/membership">See access and program status</Link></article>
      </div></section>
      <section><h2>What will an AI visibility scan actually show?</h2><p>Three web-search-enabled AI API responses to a small set of questions, the source links returned, when the checks ran, and actions based on those observations. Results may vary across models, prompts, and time. This is not a measurement of every AI product or a promise of future mentions. No visibility scores or live results are being claimed today.</p></section>
      <section><h2>Your free learning stays available.</h2><p>Keep using the resources already available in your account while the pilot is prepared.</p><div className="actions"><Link className="button" to={user ? '/dashboard' : '/login'}>{user ? 'Go to your dashboard' : 'Sign in to continue'}</Link></div></section>
    </main>
  </div>;
}
