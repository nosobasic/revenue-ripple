import { useState, useEffect } from 'react';
import { Link, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import {
  RiDashboardLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiBarChartLine,
  RiUserAddLine,
  RiSearchLine,
  RiFilterLine,
} from 'react-icons/ri';
import {
  FaUserPlus,
  FaMoneyBillWave,
  FaClipboardCheck,
} from 'react-icons/fa';
import './admin.css';
import { useAuth } from '../context/AuthContext';

// Import components for dashboard widgets (these may need to be created or imported from correct location)
// import { DashboardIntegration, DashboardHeader, KPIWidget } from '../components/KPITrackerAgent';

// Dashboard Overview Component
const DashboardOverview = ({ stats, recentActivity }) => (
  <>
    <header className="admin-header">
      <h1 className="admin-title">Dashboard Overview</h1>
    </header>

    {/* Stats Grid */}
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-title">{stat.title}</div>
          <div className="stat-value">{stat.value}</div>
          <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
            {stat.change}
          </div>
        </div>
      ))}
    </div>

    {/* Recent Activity */}
    <div className="recent-activity">
      <div className="activity-header">
        <h2 className="activity-title">Recent Activity</h2>
      </div>
      <div className="activity-list">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-icon ${activity.type}`}>
              {activity.type === 'signup' && <FaUserPlus />}
              {activity.type === 'payment' && <FaMoneyBillWave />}
              {activity.type === 'commission' && <FaClipboardCheck />}
            </div>
            <div className="activity-content">
              <div className="activity-text">{activity.text}</div>
              <div className="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

// EditUserModal component
const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ ...user });

  useEffect(() => {
    setForm({ ...user });
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="name" value={form.name || ''} onChange={handleChange} />
          <label>Email</label>
          <input name="email" value={form.email || ''} onChange={handleChange} />
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="affiliate">Affiliate</option>
            <option value="reseller">Reseller</option>
            <option value="pro_reseller">Pro Reseller</option>
          </select>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="action-btn edit-btn">Save</button>
            <button type="button" className="action-btn delete-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, searchTerm, setSearchTerm, filterStatus, setFilterStatus, handleRoleChange, handleStatusChange, onEditUser }) => (
  <>
    <header className="admin-header">
      <h1 className="admin-title">User Management</h1>
    </header>
    <div className="user-management">
      <div className="user-header">
        <h2 className="activity-title">User Management</h2>
        <div className="user-controls">
          <div className="search-wrapper">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <RiFilterLine className="filter-icon" />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button className="add-user-btn">
            <RiUserAddLine />
            Add User
          </button>
        </div>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Member Since</th>
            <th>Earnings</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.status}
                  onChange={e => handleStatusChange(user.id, e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td>{user.memberSince}</td>
              <td>{user.earnings}</td>
              <td>
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="affiliate">Affiliate</option>
                  <option value="reseller">Reseller</option>
                  <option value="pro_reseller">Pro Reseller</option>
                </select>
              </td>
              <td>
                <div className="user-actions">
                  <button className="action-btn edit-btn" onClick={() => onEditUser(user)}>Edit</button>
                  <button className="action-btn delete-btn">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

// Enhanced Commissions Component with detailed tracking
const Commissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCommissions: 0,
    monthlyCommissions: 0,
    averageCommission: 0,
    totalPayouts: 0,
    pendingPayouts: 0
  });
  const [topReferrers, setTopReferrers] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCommissionsData();
  }, [filterPeriod, filterStatus]);

  const fetchCommissionsData = async () => {
    try {
      setLoading(true);

      // Build query based on filters
      let query = supabase
        .from('commissions')
        .select(`
          *,
          users:referrer_username (name, email)
        `)
        .order('created_at', { ascending: false });

      // Apply period filter
      if (filterPeriod === 'month') {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        query = query.gte('created_at', monthStart.toISOString());
      } else if (filterPeriod === 'week') {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        query = query.gte('created_at', weekStart.toISOString());
      }

      const { data: commissionsData, error } = await query;

      if (error) throw error;

      setCommissions(commissionsData || []);

      // Calculate stats
      const totalCommissions = commissionsData?.reduce((sum, c) => sum + (c.commission || 0), 0) || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyCommissions = commissionsData?.filter(c => {
        const commissionDate = new Date(c.created_at);
        return commissionDate.getMonth() === currentMonth && commissionDate.getFullYear() === currentYear;
      }).reduce((sum, c) => sum + (c.commission || 0), 0) || 0;

      const averageCommission = commissionsData?.length > 0 ? totalCommissions / commissionsData.length : 0;

      setStats({
        totalCommissions,
        monthlyCommissions,
        averageCommission,
        totalPayouts: totalCommissions, // For now, assume all are paid
        pendingPayouts: 0
      });

      // Calculate top referrers
      const referrerStats = {};
      commissionsData?.forEach(commission => {
        const referrer = commission.referrer_username;
        if (!referrerStats[referrer]) {
          referrerStats[referrer] = {
            username: referrer,
            totalCommission: 0,
            totalReferrals: 0,
            averageCommission: 0
          };
        }
        referrerStats[referrer].totalCommission += commission.commission || 0;
        referrerStats[referrer].totalReferrals += 1;
      });

      // Convert to array and calculate averages
      const topReferrersArray = Object.values(referrerStats)
        .map(referrer => ({
          ...referrer,
          averageCommission: referrer.totalReferrals > 0 ? referrer.totalCommission / referrer.totalReferrals : 0
        }))
        .sort((a, b) => b.totalCommission - a.totalCommission)
        .slice(0, 10);

      setTopReferrers(topReferrersArray);

    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutAction = async (commissionId, action) => {
    try {
      // Update commission status in database
      const { error } = await supabase
        .from('commissions')
        .update({ 
          status: action === 'mark_paid' ? 'paid' : 'pending',
          paid_at: action === 'mark_paid' ? new Date().toISOString() : null
        })
        .eq('id', commissionId);

      if (error) throw error;

      // Refresh data
      fetchCommissionsData();
      alert(`Commission ${action === 'mark_paid' ? 'marked as paid' : 'marked as pending'} successfully!`);
    } catch (error) {
      console.error('Error updating commission:', error);
      alert('Failed to update commission status');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loading-spinner">Loading commissions data...</div>
      </div>
    );
  }

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Commission Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </header>

      {/* Commission Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-title">Total Commissions</div>
          <div className="stat-value">${stats.totalCommissions.toFixed(2)}</div>
          <div className="stat-change positive">All time earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Monthly Commissions</div>
          <div className="stat-value">${stats.monthlyCommissions.toFixed(2)}</div>
          <div className="stat-change positive">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Average Commission</div>
          <div className="stat-value">${stats.averageCommission.toFixed(2)}</div>
          <div className="stat-change">Per referral</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Payouts</div>
          <div className="stat-value">${stats.totalPayouts.toFixed(2)}</div>
          <div className="stat-change positive">Completed</div>
        </div>
      </div>

      {/* Top Referrers */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Top Referrers</h2>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {topReferrers.length > 0 ? (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Referrer</th>
                    <th>Total Commissions</th>
                    <th>Referrals</th>
                    <th>Avg Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.map((referrer, index) => (
                    <tr key={referrer.username}>
                      <td>#{index + 1}</td>
                      <td>{referrer.username}</td>
                      <td>${referrer.totalCommission.toFixed(2)}</td>
                      <td>{referrer.totalReferrals}</td>
                      <td>${referrer.averageCommission.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No commission data available
              </p>
            )}
          </div>
        </div>

        {/* Commission Summary */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Commission Summary</h2>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Commission Rate:</strong> 50%
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total Referrers:</strong> {topReferrers.length}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Active Referrers:</strong> {topReferrers.filter(r => r.totalReferrals > 0).length}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Commission Tiers:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                <li>Membership: $23.50 (50% of $47)</li>
                <li>Reseller: $23.50 (50% of $47)</li>
                <li>Pro Reseller: $48.50 (50% of $97)</li>
                <li>Tripwire: $3.50 (50% of $7)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Commissions */}
      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Recent Commissions ({commissions.length})</h2>
        </div>
        <div style={{ padding: '1rem 1.5rem' }}>
          {commissions.length > 0 ? (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Referrer</th>
                  <th>Customer Email</th>
                  <th>Tier</th>
                  <th>Sale Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissions.slice(0, 50).map((commission) => (
                  <tr key={commission.id}>
                    <td>{new Date(commission.created_at).toLocaleDateString()}</td>
                    <td>{commission.referrer_username}</td>
                    <td>{commission.email}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: 
                          commission.tier === 'pro_reseller' ? '#fef3c7' :
                          commission.tier === 'reseller' ? '#dbeafe' :
                          commission.tier === 'membership' ? '#ecfdf5' : '#fef2f2',
                        color:
                          commission.tier === 'pro_reseller' ? '#92400e' :
                          commission.tier === 'reseller' ? '#1e40af' :
                          commission.tier === 'membership' ? '#047857' : '#991b1b'
                      }}>
                        {commission.tier?.toUpperCase()}
                      </span>
                    </td>
                    <td>${commission.amount?.toFixed(2)}</td>
                    <td>${commission.commission?.toFixed(2)}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: commission.status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: commission.status === 'paid' ? '#15803d' : '#92400e'
                      }}>
                        {commission.status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {commission.status !== 'paid' && (
                          <button
                            onClick={() => handlePayoutAction(commission.id, 'mark_paid')}
                            className="action-btn edit-btn"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handlePayoutAction(commission.id, 'mark_pending')}
                          className="action-btn delete-btn"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          Pending
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No commissions found for the selected filters
            </p>
          )}
        </div>
      </div>
    </>
  );
};

// Enhanced Analytics Component with funnel analytics
const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    pageViews: [],
    conversionFunnel: {},
    trainingProgress: [],
    referralMetrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedPeriod));

      // Fetch referral clicks (page visits)
      const { data: referralClicks, error: clicksError } = await supabase
        .from('referral_clicks')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (clicksError) throw clicksError;

      // Fetch conversions (commissions)
      const { data: conversions, error: conversionsError } = await supabase
        .from('commissions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (conversionsError) throw conversionsError;

      // Fetch training progress
      const { data: trainingData, error: trainingError } = await supabase
        .from('user_progress')
        .select('*')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString());

      if (trainingError) throw trainingError;

      // Calculate conversion funnel
      const totalClicks = referralClicks?.length || 0;
      const uniqueVisitors = new Set(referralClicks?.map(click => click.user_agent)).size || 0;
      const totalConversions = conversions?.length || 0;
      const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

      // Group conversions by tier
      const conversionsByTier = conversions?.reduce((acc, conversion) => {
        const tier = conversion.tier || 'unknown';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {}) || {};

      // Page views analysis
      const pageViewsAnalysis = referralClicks?.reduce((acc, click) => {
        const page = click.landing_page || '/';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {}) || {};

      // Training completion rates
      const trainingAnalysis = trainingData?.reduce((acc, progress) => {
        const courseId = progress.course_id;
        if (!acc[courseId]) {
          acc[courseId] = { total: 0, completed: 0, avgProgress: 0 };
        }
        acc[courseId].total += 1;
        acc[courseId].avgProgress += progress.percent_done || 0;
        if ((progress.percent_done || 0) >= 100) {
          acc[courseId].completed += 1;
        }
        return acc;
      }, {}) || {};

      // Calculate averages for training
      Object.keys(trainingAnalysis).forEach(courseId => {
        const course = trainingAnalysis[courseId];
        course.avgProgress = course.total > 0 ? (course.avgProgress / course.total).toFixed(1) : 0;
        course.completionRate = course.total > 0 ? ((course.completed / course.total) * 100).toFixed(1) : 0;
      });

      setAnalyticsData({
        pageViews: Object.entries(pageViewsAnalysis).map(([page, views]) => ({ page, views })),
        conversionFunnel: {
          totalClicks,
          uniqueVisitors,
          totalConversions,
          conversionRate,
          conversionsByTier
        },
        trainingProgress: Object.entries(trainingAnalysis).map(([courseId, data]) => ({
          courseId,
          ...data
        })),
        referralMetrics: {
          totalReferrers: new Set(conversions?.map(c => c.referrer_username)).size || 0,
          avgCommissionPerReferrer: conversions?.length > 0 ? 
            (conversions.reduce((sum, c) => sum + (c.commission || 0), 0) / new Set(conversions.map(c => c.referrer_username)).size).toFixed(2) : 0
        }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loading-spinner">Loading analytics data...</div>
      </div>
    );
  }

  const { conversionFunnel, pageViews, trainingProgress, referralMetrics } = analyticsData;

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Analytics Dashboard</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="filter-select"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </header>

      {/* Conversion Funnel */}
      <div className="recent-activity" style={{ marginBottom: '2rem' }}>
        <div className="activity-header">
          <h2 className="activity-title">Conversion Funnel</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">Total Clicks</div>
              <div className="stat-value">{conversionFunnel.totalClicks}</div>
              <div className="stat-change">Landing page visits</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Unique Visitors</div>
              <div className="stat-value">{conversionFunnel.uniqueVisitors}</div>
              <div className="stat-change">Unique sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversions</div>
              <div className="stat-value">{conversionFunnel.totalConversions}</div>
              <div className="stat-change positive">Sales completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value">{conversionFunnel.conversionRate}%</div>
              <div className="stat-change positive">Click to sale</div>
            </div>
          </div>

          {/* Conversion by Tier */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Conversions by Tier</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(conversionFunnel.conversionsByTier || {}).map(([tier, count]) => (
                <div key={tier} style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{count}</div>
                  <div style={{ color: '#64748b', textTransform: 'capitalize' }}>{tier.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Page Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Page Performance</h2>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {pageViews.length > 0 ? (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pageViews
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 10)
                    .map((page, index) => {
                      const percentage = conversionFunnel.totalClicks > 0 ? 
                        ((page.views / conversionFunnel.totalClicks) * 100).toFixed(1) : 0;
                      return (
                        <tr key={index}>
                          <td>{page.page}</td>
                          <td>{page.views}</td>
                          <td>{percentage}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No page view data available
              </p>
            )}
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Referral Performance</h2>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total Active Referrers:</strong> {referralMetrics.totalReferrers}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Avg Commission per Referrer:</strong> ${referralMetrics.avgCommissionPerReferrer}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total Referral Revenue:</strong> ${conversionFunnel.totalConversions * 47 || 0}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Commission Efficiency:</strong> 
              {conversionFunnel.totalClicks > 0 ? 
                ((conversionFunnel.totalConversions / conversionFunnel.totalClicks) * 100).toFixed(1) : 0}% 
              conversion rate
            </div>
          </div>
        </div>
      </div>

      {/* Training Analytics */}
      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Training Module Analytics</h2>
        </div>
        <div style={{ padding: '1rem 1.5rem' }}>
          {trainingProgress.length > 0 ? (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Total Enrolled</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                  <th>Avg Progress</th>
                </tr>
              </thead>
              <tbody>
                {trainingProgress.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseId}</td>
                    <td>{course.total}</td>
                    <td>{course.completed}</td>
                    <td>
                      <span style={{
                        color: parseFloat(course.completionRate) > 50 ? '#10b981' : '#ef4444'
                      }}>
                        {course.completionRate}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '50px',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${course.avgProgress}%`,
                            height: '100%',
                            background: '#3b82f6',
                            borderRadius: '4px'
                          }}></div>
                        </div>
                        {course.avgProgress}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No training progress data available
            </p>
          )}
        </div>
      </div>
    </>
  );
};

// Placeholder components for other sections
const Content = () => <h1>Content</h1>;

// DevOps Integration Component
const DevOpsIntegration = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [devopsData, setDevopsData] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApiKeys();
    fetchDevopsData();
    
    // Set up real-time sync every 30 seconds
    const interval = setInterval(fetchDevopsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const response = await fetch('/api/devops/keys', {
        headers: {
          'x-user-id': userData.user.id
        }
      });
      const result = await response.json();
      if (response.ok) {
        setApiKeys(result.keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const createApiKey = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      const response = await fetch('/api/devops/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          name: newKeyName || 'DevOps Integration Key'
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        // Show the API key once
        alert(`API Key Generated:\n${result.api_key}\n\nSave this key securely - it won't be shown again!`);
        setNewKeyName('');
        setShowCreateKey(false);
        fetchApiKeys();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Error creating API key');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevopsData = async () => {
    try {
      setSyncStatus('syncing');
      
      // This would typically use your API key to fetch from DevOps module
      // For now, we'll simulate the data structure
      const mockDevopsData = {
        timestamp: new Date().toISOString(),
        integrationStatus: 'connected',
        lastSync: new Date().toISOString(),
        metrics: {
          deployments: 12,
          uptime: '99.9%',
          responseTime: '245ms',
          errorRate: '0.1%'
        },
        recentEvents: [
          { type: 'deployment', message: 'Production deployment successful', time: '2 minutes ago' },
          { type: 'alert', message: 'High CPU usage detected', time: '15 minutes ago' },
          { type: 'deployment', message: 'Staging deployment completed', time: '1 hour ago' }
        ]
      };
      
      setDevopsData(mockDevopsData);
      setSyncStatus('success');
    } catch (error) {
      console.error('Error fetching DevOps data:', error);
      setSyncStatus('error');
    }
  };

  const syncDataToDevops = async () => {
    try {
      setSyncStatus('syncing');
      
      // Sync user data
      const userResponse = await fetch('/api/devops/sync/users', {
        headers: { 'x-api-key': 'your-api-key-here' } // Would use actual key
      });
      
      // Sync revenue data
      const revenueResponse = await fetch('/api/devops/sync/revenue', {
        headers: { 'x-api-key': 'your-api-key-here' }
      });
      
      // Sync commission data
      const commissionResponse = await fetch('/api/devops/sync/commissions', {
        headers: { 'x-api-key': 'your-api-key-here' }
      });
      
      if (userResponse.ok && revenueResponse.ok && commissionResponse.ok) {
        setSyncStatus('success');
        fetchDevopsData(); // Refresh the display
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error syncing to DevOps:', error);
      setSyncStatus('error');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header className="admin-header">
        <h1 className="admin-title">DevOps Integration</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="action-btn edit-btn"
            onClick={syncDataToDevops}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Data'}
          </button>
          <button 
            className="action-btn edit-btn"
            onClick={fetchDevopsData}
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Integration Status */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-title">Integration Status</div>
          <div className="stat-value" style={{ 
            color: devopsData?.integrationStatus === 'connected' ? '#10b981' : '#ef4444' 
          }}>
            {devopsData?.integrationStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
          <div className="stat-change">
            Last sync: {devopsData?.lastSync ? new Date(devopsData.lastSync).toLocaleString() : 'Never'}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Sync Status</div>
          <div className="stat-value" style={{
            color: syncStatus === 'success' ? '#10b981' : 
                   syncStatus === 'error' ? '#ef4444' : '#6b7280'
          }}>
            {syncStatus === 'success' ? 'Success' : 
             syncStatus === 'error' ? 'Error' : 
             syncStatus === 'syncing' ? 'Syncing' : 'Idle'}
          </div>
          <div className="stat-change">
            Real-time monitoring active
          </div>
        </div>

        {devopsData?.metrics && (
          <>
            <div className="stat-card">
              <div className="stat-title">Deployments</div>
              <div className="stat-value">{devopsData.metrics.deployments}</div>
              <div className="stat-change positive">This month</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">System Uptime</div>
              <div className="stat-value">{devopsData.metrics.uptime}</div>
              <div className="stat-change positive">Last 30 days</div>
            </div>
          </>
        )}
      </div>

      {/* API Key Management */}
      <div className="recent-activity" style={{ marginBottom: '2rem' }}>
        <div className="activity-header">
          <h2 className="activity-title">API Key Management</h2>
          <button 
            className="add-user-btn"
            onClick={() => setShowCreateKey(true)}
          >
            Generate New Key
          </button>
        </div>
        
        {showCreateKey && (
          <div style={{ 
            padding: '1rem', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Key Name:
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="DevOps Integration Key"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="action-btn edit-btn"
                onClick={createApiKey}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Key'}
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => setShowCreateKey(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Permissions</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>{key.permissions?.join(', ') || 'None'}</td>
                <td>{new Date(key.created_at).toLocaleDateString()}</td>
                <td>{key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: key.is_active ? '#10b981' : '#ef4444',
                    color: 'white'
                  }}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="action-btn delete-btn">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DevOps Metrics */}
      {devopsData?.metrics && (
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">DevOps Metrics</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <h4>Response Time</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {devopsData.metrics.responseTime}
              </div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <h4>Error Rate</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {devopsData.metrics.errorRate}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {devopsData?.recentEvents && (
        <div className="recent-activity" style={{ marginTop: '2rem' }}>
          <div className="activity-header">
            <h2 className="activity-title">Recent DevOps Events</h2>
          </div>
          <div className="activity-list">
            {devopsData.recentEvents.map((event, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${event.type}`}>
                  {event.type === 'deployment' && '🚀'}
                  {event.type === 'alert' && '⚠️'}
                  {event.type === 'success' && '✅'}
                </div>
                <div className="activity-content">
                  <div className="activity-text">{event.message}</div>
                  <div className="activity-time">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Admin dashboard page for users with the 'admin' role
const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // DevOps API Key state and generator
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [generatingKeys, setGeneratingKeys] = useState(false);

  const generateDevOpsKeys = async () => {
    setGeneratingKeys(true);
    try {
      const res = await fetch('http://localhost:5001/devops/generate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setApiKey(data.api_key);
      setWebhookSecret(data.webhook_secret);
    } catch (error) {
      console.error('Error generating DevOps API keys:', error);
    }
    setGeneratingKeys(false);
  };

  // Debug log to help trace admin access issues
  useEffect(() => {
    console.log('Admin.jsx: Current state:', {
      user: user ? { id: user.id, role: user.role, email: user.email } : null,
      authLoading,
      dashboardLoading
    });
  }, [user, authLoading, dashboardLoading]);

  useEffect(() => {
    // Only fetch dashboard data if user is loaded and is admin
    if (!authLoading && user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Only fetch filtered users if user is loaded and is admin
    if (!authLoading && user && user.role === 'admin') {
      fetchFilteredUsers();
    }
  }, [searchTerm, filterStatus, user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      setError(null);

      // Fetch total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Fetch active users count
      const { count: activeUsers, error: activeError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) {
        console.error('Error fetching active users count:', activeError);
      }

      // Fetch monthly revenue from subscriptions table
      const { data: revenueData, error: revenueError } = await supabase
        .from('subscriptions')
        .select('amount')
        .gte('subscribed_at', new Date(new Date().setDate(1)).toISOString());

      if (revenueError) {
        console.error('Error fetching revenue data:', revenueError);
      }

      const monthlyRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Fetch commission data
      const { data: commissionData, error: commissionError } = await supabase
        .from('commissions')
        .select('amount')
        .gte('created_at', new Date(new Date().setDate(1)).toISOString());

      if (commissionError) {
        console.error('Error fetching commission data:', commissionError);
      }

      const commissionPaid = commissionData?.reduce((sum, commission) => sum + (commission.amount || 0), 0) || 0;

      // Set stats
      setStats([
        { 
          title: 'Total Users', 
          value: totalUsers?.toString() || '0',
          change: '+12.5%', 
          positive: true 
        },
        { 
          title: 'Active Members', 
          value: activeUsers?.toString() || '0',
          change: '+8.1%', 
          positive: true 
        },
        { 
          title: 'Monthly Revenue', 
          value: `$${monthlyRevenue.toLocaleString()}`,
          change: '+23.4%', 
          positive: true 
        },
        { 
          title: 'Commission Paid', 
          value: `$${commissionPaid.toLocaleString()}`,
          change: '-2.3%', 
          positive: false 
        },
      ]);

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) {
        console.error('Error fetching activity data:', activityError);
      }

      setRecentActivity(activityData?.map(activity => ({
        id: activity.id,
        type: activity.type || 'general',
        text: activity.description || 'No description',
        time: new Date(activity.created_at).toLocaleTimeString(),
      })) || []);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchFilteredUsers = async () => {
    try {
      setError(null);

      let query = supabase
        .from('users')
        .select('*');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data?.map(user => ({
        id: user.id,
        name: user.name || 'N/A',
        email: user.email,
        status: user.status || 'inactive',
        memberSince: new Date(user.created_at).toLocaleDateString(),
        earnings: `$${user.total_earnings || 0}`,
        role: user.role || 'member',
      })) || []);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    fetchFilteredUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId);
    fetchFilteredUsers();
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (updatedUser) => {
    await supabase
      .from('users')
      .update({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      })
      .eq('id', updatedUser.id);
    setIsEditModalOpen(false);
    fetchFilteredUsers();
  };

  // Show loading spinner if auth is still loading
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span style={{ marginLeft: 16 }}>Loading admin panel...</span>
      </div>
    );
  }

  // Show access denied if user is not an admin (this should be handled by ProtectedRoute, but double-check)
  if (user.role !== 'admin') {
    return (
      <div style={{ 
        color: 'red', 
        padding: 20, 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h2>Access Denied</h2>
        <p>You do not have admin privileges to access this page.</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          Revenue Ripple
        </div>
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <RiDashboardLine size={20} />
            Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`admin-nav-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <RiUserLine size={20} />
            User Management
          </Link>
          <Link 
            to="/admin/commissions" 
            className={`admin-nav-item ${location.pathname === '/admin/commissions' ? 'active' : ''}`}
          >
            <RiMoneyDollarCircleLine size={20} />
            Commissions
          </Link>
          <Link 
            to="/admin/content" 
            className={`admin-nav-item ${location.pathname === '/admin/content' ? 'active' : ''}`}
          >
            <RiFileTextLine size={20} />
            Content
          </Link>
          <Link 
            to="/admin/analytics" 
            className={`admin-nav-item ${location.pathname === '/admin/analytics' ? 'active' : ''}`}
          >
            <RiBarChartLine size={20} />
            Analytics
          </Link>
          <Link 
            to="/admin/widgets" 
            className={`admin-nav-item ${location.pathname === '/admin/widgets' ? 'active' : ''}`}
          >
            Dashboard Widgets
          </Link>
          <Link 
            to="/admin/embedded-widget" 
            className={`admin-nav-item ${location.pathname === '/admin/embedded-widget' ? 'active' : ''}`}
          >
            Embedded Widget
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Routes>
          <Route path="/" element={
            <>
              <DashboardOverview stats={stats} recentActivity={recentActivity} />
              <div style={{ marginTop: '20px', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '10px' }}>DevOps API Key Generator</h2>
                <button 
                  onClick={generateDevOpsKeys}
                  disabled={generatingKeys}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {generatingKeys ? 'Generating...' : 'Generate API Keys'}
                </button>
                {apiKey && (
                  <div style={{ marginTop: '1rem' }}>
                    <p><strong>API Key:</strong> {apiKey}</p>
                    <p><strong>Webhook Secret:</strong> {webhookSecret}</p>
                  </div>
                )}
              </div>
            </>
          } />
          <Route path="users" element={
            <>
              <UserManagement 
                users={users}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                handleRoleChange={handleRoleChange}
                handleStatusChange={handleStatusChange}
                onEditUser={handleEditUser}
              />
              <EditUserModal
                user={editUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveUser}
              />
            </>
          } />
          <Route path="commissions" element={<Commissions />} />
          <Route path="content" element={<Content />} />
          <Route path="analytics" element={<Analytics />} />
          <Route
            path="widgets"
            element={
              <div style={{ padding: '20px' }}>
                <h1>Dashboard Widgets</h1>
                <p>Widget components will be available here once implemented.</p>
                {/* TODO: Import and implement DashboardIntegration, DashboardHeader, KPIWidget components */}
              </div>
            }
          />
          <Route
            path="embedded-widget"
            element={<DevOpsIntegration />}
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;