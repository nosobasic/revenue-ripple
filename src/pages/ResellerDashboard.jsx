import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client.jsx';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import AIAssistantWidget from '../components/AIAssistantWidget';
import '../pages.css';
import { 
  FaMoneyBillWave, 
  FaChartBar, 
  FaUsers, 
  FaShareAlt, 
  FaLink,
  FaCopy,
  FaTrophy,
  FaUserPlus,
  FaRocket,
  FaPercentage,
  FaCalendarAlt,
  FaClipboard,
  FaEye
} from 'react-icons/fa';

export const ResellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    commissionRate: 50,
    clickThroughRate: 0,
    conversionRate: 0
  });
  const [recentCommissions, setRecentCommissions] = useState([]);
  const [affiliateLink, setAffiliateLink] = useState('');

  useEffect(() => {
    if (user) {
      setAffiliateLink(`${window.location.origin}/?ref=${user.id}`);
      fetchResellerStats();
    }
  }, [user]);

  const fetchResellerStats = async () => {
    try {
      setLoading(true);

      // Fetch commission data
      const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('referrer_username', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      // Calculate stats
      const totalEarnings = commissions?.reduce((sum, c) => sum + (c.commission || 0), 0) || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = commissions?.filter(c => {
        const commissionDate = new Date(c.created_at);
        return commissionDate.getMonth() === currentMonth && commissionDate.getFullYear() === currentYear;
      }).reduce((sum, c) => sum + (c.commission || 0), 0) || 0;

      // Fetch referral clicks
      const { data: clicks, error: clicksError } = await supabase
        .from('referral_clicks')
        .select('*')
        .eq('referrer_username', user.id);

      if (clicksError) throw clicksError;

      // Calculate conversion rate
      const totalClicks = clicks?.length || 0;
      const totalConversions = commissions?.length || 0;
      const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;

      setStats({
        totalEarnings: totalEarnings,
        monthlyEarnings: monthlyEarnings,
        totalReferrals: totalConversions,
        activeReferrals: commissions?.filter(c => c.tier !== 'tripwire').length || 0,
        commissionRate: user.commission_rate || 50,
        clickThroughRate: totalClicks,
        conversionRate: parseFloat(conversionRate)
      });

      setRecentCommissions(commissions?.slice(0, 5) || []);

    } catch (error) {
      console.error('Error fetching reseller stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    alert('Affiliate link copied to clipboard!');
  };

  const quickActions = [
    {
      id: 'share-link',
      title: 'Share Your Link',
      description: 'Copy and share your affiliate link',
      icon: <FaShareAlt />,
      action: copyAffiliateLink,
      color: 'blue'
    },
    {
      id: 'upgrade-pro',
      title: 'Upgrade to Pro',
      description: 'Unlock higher commissions',
      icon: <FaRocket />,
      action: () => navigate('/pro-reseller-upsell'),
      color: 'gold'
    },
    {
      id: 'affiliate-tools',
      title: 'Marketing Tools',
      description: 'Access banners and copy',
      icon: <FaClipboard />,
      action: () => navigate('/affiliate-centre/tools'),
      color: 'green'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Track your performance',
      icon: <FaChartBar />,
      action: () => navigate('/affiliate-centre'),
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading your reseller dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <ReferralTracker />
      <Navbar />
      <AIAssistantWidget />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Reseller Dashboard</h1>
          <p>Welcome back, {user?.name || 'Reseller'}! Track your earnings and grow your business.</p>
        </div>

        {/* Stats Overview */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h2>Your Performance</h2>
            <div className="stats-grid">
              <div className="stat-card highlight">
                <FaMoneyBillWave className="stat-icon" />
                <div className="stat-content">
                  <h3>${stats.totalEarnings.toFixed(2)}</h3>
                  <p>Total Earnings</p>
                </div>
              </div>
              <div className="stat-card">
                <FaCalendarAlt className="stat-icon" />
                <div className="stat-content">
                  <h3>${stats.monthlyEarnings.toFixed(2)}</h3>
                  <p>This Month</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUsers className="stat-icon" />
                <div className="stat-content">
                  <h3>{stats.totalReferrals}</h3>
                  <p>Total Referrals</p>
                </div>
              </div>
              <div className="stat-card">
                <FaPercentage className="stat-icon" />
                <div className="stat-content">
                  <h3>{stats.conversionRate}%</h3>
                  <p>Conversion Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <div 
                  key={action.id}
                  className={`quick-action-card ${action.color}`}
                  onClick={action.action}
                >
                  <div className="action-icon">{action.icon}</div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Affiliate Link */}
          <div className="dashboard-section">
            <h2>Your Affiliate Link</h2>
            <div className="affiliate-link-card">
              <div className="link-display">
                <FaLink className="link-icon" />
                <input 
                  type="text" 
                  value={affiliateLink} 
                  readOnly 
                  className="link-input"
                />
                <button onClick={copyAffiliateLink} className="copy-button">
                  <FaCopy /> Copy
                </button>
              </div>
              <div className="link-stats">
                <span><FaEye /> {stats.clickThroughRate} clicks</span>
                <span><FaUserPlus /> {stats.totalReferrals} conversions</span>
                <span><FaPercentage /> {stats.commissionRate}% commission</span>
              </div>
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="dashboard-section">
            <h2>Recent Commissions</h2>
            <div className="commissions-list">
              {recentCommissions.length > 0 ? (
                recentCommissions.map((commission, index) => (
                  <div key={index} className="commission-item">
                    <div className="commission-info">
                      <span className="commission-amount">${commission.commission?.toFixed(2)}</span>
                      <span className="commission-tier">{commission.tier?.toUpperCase()}</span>
                    </div>
                    <div className="commission-details">
                      <span className="commission-email">{commission.email}</span>
                      <span className="commission-date">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-commissions">
                  <p>No commissions yet. Start sharing your link to earn!</p>
                  <button onClick={copyAffiliateLink} className="get-started-btn">
                    Get Your Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Earning Potential */}
          <div className="dashboard-section">
            <h2>Earning Potential</h2>
            <div className="earning-calculator">
              <div className="calc-row">
                <span>1 referral/month:</span>
                <span className="earning-amount">$47/month</span>
              </div>
              <div className="calc-row">
                <span>5 referrals/month:</span>
                <span className="earning-amount">$235/month</span>
              </div>
              <div className="calc-row highlight">
                <span>10 referrals/month:</span>
                <span className="earning-amount">$470/month</span>
              </div>
              <div className="calc-row">
                <span>20 referrals/month:</span>
                <span className="earning-amount">$940/month</span>
              </div>
            </div>
            <div className="upgrade-suggestion">
              <FaTrophy className="trophy-icon" />
              <div>
                <h4>Upgrade to Pro Reseller</h4>
                <p>Get 100% commissions on every sale + bonus features</p>
                <button 
                  onClick={() => navigate('/pro-reseller-upsell')}
                  className="upgrade-btn"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerDashboard;