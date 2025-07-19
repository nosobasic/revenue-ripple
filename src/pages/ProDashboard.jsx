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
  FaCrown,
  FaUserPlus,
  FaRocket,
  FaPercentage,
  FaCalendarAlt,
  FaClipboard,
  FaEye,
  FaTrendingUp,
  FaAward,
  FaGem,
  FaFire,
  FaDownload,
  FaStar
} from 'react-icons/fa';

export const ProDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    commissionRate: 100,
    clickThroughRate: 0,
    conversionRate: 0,
    averageCommission: 0,
    topPerformingLink: '',
    growth: 0
  });
  const [recentCommissions, setRecentCommissions] = useState([]);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    if (user) {
      setAffiliateLink(`${window.location.origin}/?ref=${user.id}`);
      fetchProStats();
    }
  }, [user]);

  const fetchProStats = async () => {
    try {
      setLoading(true);

      // Fetch commission data
      const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('referrer_username', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      // Calculate comprehensive stats
      const totalEarnings = commissions?.reduce((sum, c) => sum + (c.commission || 0), 0) || 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = commissions?.filter(c => {
        const commissionDate = new Date(c.created_at);
        return commissionDate.getMonth() === currentMonth && commissionDate.getFullYear() === currentYear;
      }).reduce((sum, c) => sum + (c.commission || 0), 0) || 0;

      // Weekly earnings
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyEarnings = commissions?.filter(c => 
        new Date(c.created_at) >= weekAgo
      ).reduce((sum, c) => sum + (c.commission || 0), 0) || 0;

      // Fetch referral clicks
      const { data: clicks, error: clicksError } = await supabase
        .from('referral_clicks')
        .select('*')
        .eq('referrer_username', user.id);

      if (clicksError) throw clicksError;

      // Calculate advanced metrics
      const totalClicks = clicks?.length || 0;
      const totalConversions = commissions?.length || 0;
      const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;
      const averageCommission = totalConversions > 0 ? (totalEarnings / totalConversions).toFixed(2) : 0;

      // Calculate growth (compare this month to last month)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthEarnings = commissions?.filter(c => {
        const commissionDate = new Date(c.created_at);
        return commissionDate.getMonth() === lastMonth && commissionDate.getFullYear() === lastMonthYear;
      }).reduce((sum, c) => sum + (c.commission || 0), 0) || 0;

      const growth = lastMonthEarnings > 0 ? (((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1) : 0;

      setStats({
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        totalReferrals: totalConversions,
        activeReferrals: commissions?.filter(c => c.tier !== 'tripwire').length || 0,
        commissionRate: 100, // Pro resellers get 100%
        clickThroughRate: totalClicks,
        conversionRate: parseFloat(conversionRate),
        averageCommission: parseFloat(averageCommission),
        growth: parseFloat(growth)
      });

      setRecentCommissions(commissions?.slice(0, 8) || []);

      // Generate monthly trend for last 6 months
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthEarnings = commissions?.filter(c => {
          const commissionDate = new Date(c.created_at);
          return commissionDate.getMonth() === month.getMonth() && 
                 commissionDate.getFullYear() === month.getFullYear();
        }).reduce((sum, c) => sum + (c.commission || 0), 0) || 0;
        
        trend.push({
          month: month.toLocaleString('default', { month: 'short' }),
          earnings: monthEarnings
        });
      }
      setMonthlyTrend(trend);

    } catch (error) {
      console.error('Error fetching pro stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    alert('Pro affiliate link copied to clipboard!');
  };

  const quickActions = [
    {
      id: 'share-link',
      title: 'Share Pro Link',
      description: 'Copy your 100% commission link',
      icon: <FaShareAlt />,
      action: copyAffiliateLink,
      color: 'gold'
    },
    {
      id: 'advanced-tools',
      title: 'Pro Marketing Suite',
      description: 'Access premium tools & assets',
      icon: <FaRocket />,
      action: () => navigate('/affiliate-centre/tools'),
      color: 'purple'
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Deep performance insights',
      icon: <FaChartBar />,
      action: () => navigate('/affiliate-centre'),
      color: 'blue'
    },
    {
      id: 'downloads',
      title: 'Download Center',
      description: 'Marketing materials & reports',
      icon: <FaDownload />,
      action: () => navigate('/affiliate-centre/downloads'),
      color: 'green'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading-spinner">Loading your Pro dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard pro-dashboard">
      <ReferralTracker />
      <Navbar />
      <AIAssistantWidget />

      <div className="dashboard-content">
        <div className="dashboard-header pro-header">
          <div className="header-content">
            <h1>
              <FaCrown className="crown-icon" />
              Pro Reseller Dashboard
            </h1>
            <p>Welcome back, {user?.name || 'Pro Reseller'}! You're earning 100% commissions on every sale.</p>
          </div>
          <div className="pro-badge">
            <FaStar /> PRO MEMBER
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h2>
              <FaTrendingUp /> Performance Metrics
            </h2>
            <div className="stats-grid pro-stats">
              <div className="stat-card highlight pro-earnings">
                <FaMoneyBillWave className="stat-icon" />
                <div className="stat-content">
                  <h3>${stats.totalEarnings.toFixed(2)}</h3>
                  <p>Total Earnings</p>
                  <span className="stat-badge">LIFETIME</span>
                </div>
              </div>
              <div className="stat-card">
                <FaCalendarAlt className="stat-icon" />
                <div className="stat-content">
                  <h3>${stats.monthlyEarnings.toFixed(2)}</h3>
                  <p>This Month</p>
                  {stats.growth !== 0 && (
                    <span className={`growth ${stats.growth > 0 ? 'positive' : 'negative'}`}>
                      {stats.growth > 0 ? '+' : ''}{stats.growth}%
                    </span>
                  )}
                </div>
              </div>
              <div className="stat-card">
                <FaFire className="stat-icon" />
                <div className="stat-content">
                  <h3>${stats.weeklyEarnings.toFixed(2)}</h3>
                  <p>This Week</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUsers className="stat-icon" />
                <div className="stat-content">
                  <h3>{stats.totalReferrals}</h3>
                  <p>Total Conversions</p>
                </div>
              </div>
              <div className="stat-card">
                <FaPercentage className="stat-icon" />
                <div className="stat-content">
                  <h3>{stats.conversionRate}%</h3>
                  <p>Conversion Rate</p>
                </div>
              </div>
              <div className="stat-card">
                <FaAward className="stat-icon" />
                <div className="stat-content">
                  <h3>${stats.averageCommission}</h3>
                  <p>Avg Commission</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Quick Actions */}
          <div className="dashboard-section">
            <h2>
              <FaGem /> Pro Tools
            </h2>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <div 
                  key={action.id}
                  className={`quick-action-card pro-action ${action.color}`}
                  onClick={action.action}
                >
                  <div className="action-icon">{action.icon}</div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Affiliate Link */}
          <div className="dashboard-section">
            <h2>
              <FaRocket /> Your Pro Affiliate Link
            </h2>
            <div className="affiliate-link-card pro-link">
              <div className="link-display">
                <FaLink className="link-icon" />
                <input 
                  type="text" 
                  value={affiliateLink} 
                  readOnly 
                  className="link-input"
                />
                <button onClick={copyAffiliateLink} className="copy-button pro-copy">
                  <FaCopy /> Copy Pro Link
                </button>
              </div>
              <div className="link-stats pro-stats-row">
                <span><FaEye /> {stats.clickThroughRate} clicks</span>
                <span><FaUserPlus /> {stats.totalReferrals} conversions</span>
                <span className="commission-highlight">
                  <FaCrown /> {stats.commissionRate}% commission
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="dashboard-section">
            <h2>
              <FaChartBar /> 6-Month Earning Trend
            </h2>
            <div className="trend-chart">
              {monthlyTrend.map((month, index) => (
                <div key={index} className="trend-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${Math.max((month.earnings / Math.max(...monthlyTrend.map(m => m.earnings))) * 100, 5)}%` 
                    }}
                  ></div>
                  <span className="bar-label">{month.month}</span>
                  <span className="bar-value">${month.earnings.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Commissions - Enhanced */}
          <div className="dashboard-section">
            <h2>
              <FaMoneyBillWave /> Recent Pro Commissions
            </h2>
            <div className="commissions-list pro-commissions">
              {recentCommissions.length > 0 ? (
                recentCommissions.map((commission, index) => (
                  <div key={index} className="commission-item pro-commission">
                    <div className="commission-info">
                      <span className="commission-amount">${commission.commission?.toFixed(2)}</span>
                      <span className={`commission-tier ${commission.tier}`}>
                        {commission.tier?.toUpperCase()}
                      </span>
                    </div>
                    <div className="commission-details">
                      <span className="commission-email">{commission.email}</span>
                      <span className="commission-date">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="commission-badge">100%</div>
                  </div>
                ))
              ) : (
                <div className="no-commissions pro-empty">
                  <FaCrown className="empty-icon" />
                  <p>No Pro commissions yet. Start sharing your link to earn 100%!</p>
                  <button onClick={copyAffiliateLink} className="get-started-btn pro-btn">
                    Get Your Pro Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pro Earning Potential */}
          <div className="dashboard-section">
            <h2>
              <FaTrendingUp /> Pro Earning Potential
            </h2>
            <div className="earning-calculator pro-calculator">
              <div className="calc-header">
                <FaCrown /> 100% Commission Rate
              </div>
              <div className="calc-row">
                <span>1 referral/month:</span>
                <span className="earning-amount">$97/month</span>
              </div>
              <div className="calc-row">
                <span>5 referrals/month:</span>
                <span className="earning-amount">$485/month</span>
              </div>
              <div className="calc-row highlight">
                <span>10 referrals/month:</span>
                <span className="earning-amount">$970/month</span>
              </div>
              <div className="calc-row pro-highlight">
                <span>20 referrals/month:</span>
                <span className="earning-amount">$1,940/month</span>
              </div>
              <div className="calc-row max">
                <span>50 referrals/month:</span>
                <span className="earning-amount">$4,850/month</span>
              </div>
            </div>
            <div className="pro-benefits">
              <h4><FaGem /> Pro Benefits</h4>
              <ul>
                <li>100% commission on all sales</li>
                <li>Advanced marketing materials</li>
                <li>Priority customer support</li>
                <li>Exclusive training & resources</li>
                <li>Monthly performance reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;