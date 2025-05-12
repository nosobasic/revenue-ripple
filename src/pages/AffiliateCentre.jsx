import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function AffiliateCentre() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    commissionRate: '50%'
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const affiliateLink = `${baseUrl}/?ref=${user?.id}`;

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink).then(() => {
      alert('Affiliate link copied to clipboard!');
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user's role and commission rate
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, commission_rate')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // Fetch commissions
        const { data: commissions, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('referrer_username', user.id);

        if (commissionsError) throw commissionsError;

        const totalEarnings = commissions.reduce((sum, row) => sum + row.commission, 0);
        const totalSales = commissions.length;

        setStats({
          totalEarnings: `$${totalEarnings.toFixed(2)}`,
          totalSales,
          commissionRate: `${userData.commission_rate || 50}%`
        });

        const recentActivity = commissions
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
          .map((entry) => ({
            type: "commission",
            message: `Commission earned: $${entry.commission.toFixed(2)} from ${entry.tier.toUpperCase()}`,
            timestamp: new Date(entry.timestamp).toLocaleString()
          }));

        setActivity(recentActivity);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Affiliate & Reseller Centre</h1>
          <p className="dashboard-welcome">Welcome, {user?.email}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="main-content">
          {/* Welcome Message */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">🌟</div>
              <h2>Welcome to the Team</h2>
            </div>
            <div className="section-content">
              <div className="welcome-message">
                <p>Thanks for being part of the team — whether you're crushing it as an affiliate or leveling up as a reseller, you're a key part of what we're building.</p>
                <p>Below, you'll find a breakdown of your referrals, commissions, and sales activity.</p>
                <p>Keep sharing the word and bringing people into the ecosystem — your effort doesn't go unnoticed.</p>
                <p>With you on board, growth isn't just possible — it's inevitable.</p>
                <p>Let's keep scaling. 🚀</p>
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">📊</div>
              <h2>Performance Overview</h2>
            </div>
            <div className="section-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalEarnings}</div>
                  <div className="stat-label">Total Earnings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalSales}</div>
                  <div className="stat-label">Total Sales</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.commissionRate}</div>
                  <div className="stat-label">Commission Rate</div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">⚡</div>
              <h2>Quick Actions</h2>
            </div>
            <div className="section-content">
              <div className="grid-layout">
                <div className="course-item">
                  <h3>Generate Affiliate Link</h3>
                  <div className="course-details">
                    <p>Create and copy your unique affiliate link to start promoting.</p>
                    <button className="cta-button" onClick={copyAffiliateLink}>Copy Link</button>
                  </div>
                </div>
                <div className="course-item">
                  <h3>View Marketing Materials</h3>
                  <div className="course-details">
                    <p>Access banners, email templates, and promotional content.</p>
                    <Link to="/affiliate-centre/tools" className="cta-button">View Materials</Link>
                  </div>
                </div>
                <div className="course-item">
                  <h3>Track Performance</h3>
                  <div className="course-details">
                    <p>Monitor clicks, conversions, and earnings in real-time.</p>
                    <Link to="/affiliate-centre/payouts" className="cta-button">View Analytics</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="side-content">
          {/* Navigation Menu */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">📋</div>
              <h2>Navigation</h2>
            </div>
            <div className="section-content">
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/tools" className="cta-link">
                    <span className="item-icon">🛠️</span>
                    Marketing Tools
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/training" className="cta-link">
                    <span className="item-icon">📚</span>
                    Training & Guides
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/payouts" className="cta-link">
                    <span className="item-icon">💰</span>
                    Earnings & Payouts
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/support" className="cta-link">
                    <span className="item-icon">💬</span>
                    Support & FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">🔄</div>
              <h2>Recent Activity</h2>
            </div>
            <div className="section-content">
              <div className="activity-list">
                {activity.map((item, idx) => (
                  <div key={idx} className="activity-item">
                    <span className="activity-icon payment">💰</span>
                    <div>
                      <span>{item.message}</span><br />
                      <small style={{ color: '#888' }}>{item.timestamp}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}