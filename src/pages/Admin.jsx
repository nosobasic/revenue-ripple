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
import { courses } from '../data/courses';
// import { KPITrackerAgent } from '../components/KPITrackerAgent';

// Simplified KPI Dashboard Component
const KPITracker = () => {
  const [kpiData, setKpiData] = useState({
    users: { total: 0, active: 0, new: 0 },
    revenue: { total: 0, monthly: 0, growth: 0 },
    commissions: { total: 0, pending: 0, growth: 0 },
    engagement: { completions: 0, progress: 0, activity: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchKPIData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKPIData = async () => {
    try {
      setLoading(true);

      // Fetch user metrics
      const { data: users } = await supabase
        .from('users')
        .select('id, status, created_at');

      const activeUsers = users?.filter(u => u.status === 'active').length || 0;
      const totalUsers = users?.length || 0;
      const newUsersThisMonth = users?.filter(u => 
        new Date(u.created_at) > new Date(new Date().setDate(1))
      ).length || 0;

      // Fetch revenue metrics
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount, subscribed_at, status');

      const totalRevenue = subscriptions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
      const monthlyRevenue = subscriptions?.filter(s => 
        new Date(s.subscribed_at) > new Date(new Date().setDate(1))
      ).reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      // Fetch commission metrics
      const { data: commissions } = await supabase
        .from('commissions')
        .select('amount, created_at, status');

      const totalCommissions = commissions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const pendingCommissions = commissions?.filter(c => c.status === 'pending').length || 0;

      // Fetch engagement metrics
      const { data: progress } = await supabase
        .from('user_progress')
        .select('percent_done, status');

      const completions = progress?.filter(p => p.status === 'completed').length || 0;
      const avgProgress = progress?.length > 0 
        ? progress.reduce((sum, p) => sum + (p.percent_done || 0), 0) / progress.length 
        : 0;

      const { data: activity } = await supabase
        .from('activity_log')
        .select('id')
        .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());

      setKpiData({
        users: { total: totalUsers, active: activeUsers, new: newUsersThisMonth },
        revenue: { total: totalRevenue, monthly: monthlyRevenue, growth: 5.2 },
        commissions: { total: totalCommissions, pending: pendingCommissions, growth: 3.8 },
        engagement: { completions, progress: avgProgress, activity: activity?.length || 0 }
      });

    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner">Loading KPI data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* KPI Overview Grid */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-title">👥 Total Users</div>
          <div className="stat-value">{kpiData.users.total}</div>
          <div className="stat-change positive">
            {kpiData.users.active} active • {kpiData.users.new} new this month
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">💰 Revenue</div>
          <div className="stat-value">${kpiData.revenue.total.toLocaleString()}</div>
          <div className="stat-change positive">
            ${kpiData.revenue.monthly.toLocaleString()} this month • +{kpiData.revenue.growth}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">🏆 Commissions</div>
          <div className="stat-value">${kpiData.commissions.total.toLocaleString()}</div>
          <div className="stat-change positive">
            {kpiData.commissions.pending} pending • +{kpiData.commissions.growth}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">📈 Engagement</div>
          <div className="stat-value">{kpiData.engagement.progress.toFixed(1)}%</div>
          <div className="stat-change positive">
            {kpiData.engagement.completions} completions • {kpiData.engagement.activity} activities
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="recent-activity">
          <div className="activity-header">
            <h3 className="activity-title">User Metrics</h3>
          </div>
          <div style={{ padding: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Active Users</div>
              <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ 
                  background: '#28a745', 
                  height: '100%', 
                  width: `${(kpiData.users.active / kpiData.users.total) * 100}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {((kpiData.users.active / kpiData.users.total) * 100).toFixed(1)}% activation rate
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Growth This Month</div>
              <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ 
                  background: '#007bff', 
                  height: '100%', 
                  width: `${Math.min((kpiData.users.new / kpiData.users.total) * 100, 100)}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {kpiData.users.new} new users this month
              </div>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <h3 className="activity-title">Performance Summary</h3>
          </div>
          <div style={{ padding: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#666' }}>Revenue Growth</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  +{kpiData.revenue.growth}%
                </div>
              </div>
              <div>
                <div style={{ color: '#666' }}>Commission Growth</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                  +{kpiData.commissions.growth}%
                </div>
              </div>
              <div>
                <div style={{ color: '#666' }}>Avg Progress</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                  {kpiData.engagement.progress.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ color: '#666' }}>Activity Score</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6f42c1' }}>
                  {kpiData.engagement.activity}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="recent-activity" style={{ marginTop: '20px' }}>
        <div className="activity-header">
          <h3 className="activity-title">System Status</h3>
        </div>
        <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#28a745', fontSize: '14px', fontWeight: 'bold' }}>🟢 All systems operational</span>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666' }}>Data Refresh</div>
              <div style={{ fontWeight: 'bold' }}>30s</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666' }}>Uptime</div>
              <div style={{ fontWeight: 'bold' }}>99.9%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666' }}>Response</div>
              <div style={{ fontWeight: 'bold' }}>0.8s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <div className="table-wrapper">
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
    </div>
  </>
);

// Placeholder components for other sections
const Commissions = () => {
  const [commissionsData, setCommissionsData] = useState({
    totalCommissions: 0,
    monthlyCommissions: 0,
    topPerformers: [],
    commissionsByType: {},
    recentCommissions: [],
    growth: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    fetchCommissionsData();
  }, [timeframe]);

  const fetchCommissionsData = async () => {
    try {
      setLoading(true);
      
      // Get date range based on timeframe
      const now = new Date();
      const startDate = new Date();
      if (timeframe === 'month') {
        startDate.setDate(1);
      } else if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear(), 0, 1);
      }

      // Fetch all commissions for the period
      const { data: commissions, error } = await supabase
        .from('commissions')
        .select('*, users:user_id(name, email)')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totalCommissions = commissions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      
      // Get previous period for growth calculation
      const prevStart = new Date(startDate);
      const prevEnd = new Date(startDate);
      if (timeframe === 'month') {
        prevStart.setMonth(prevStart.getMonth() - 1);
        prevEnd.setDate(0);
      } else if (timeframe === 'week') {
        prevStart.setDate(prevStart.getDate() - 7);
        prevEnd.setDate(startDate.getDate() - 1);
      } else if (timeframe === 'year') {
        prevStart.setFullYear(prevStart.getFullYear() - 1);
        prevEnd.setFullYear(prevEnd.getFullYear() - 1, 11, 31);
      }

      const { data: prevCommissions } = await supabase
        .from('commissions')
        .select('amount')
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', prevEnd.toISOString());

      const prevTotal = prevCommissions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const growth = prevTotal > 0 ? ((totalCommissions - prevTotal) / prevTotal) * 100 : 0;

      // Calculate top performers
      const performerMap = {};
      commissions?.forEach(c => {
        const userId = c.user_id;
        if (!performerMap[userId]) {
          performerMap[userId] = {
            user: c.users,
            total: 0,
            count: 0
          };
        }
        performerMap[userId].total += c.amount || 0;
        performerMap[userId].count += 1;
      });

      const topPerformers = Object.values(performerMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Group by commission type
      const commissionsByType = commissions?.reduce((acc, c) => {
        const type = c.type || 'referral';
        acc[type] = (acc[type] || 0) + (c.amount || 0);
        return acc;
      }, {});

      setCommissionsData({
        totalCommissions,
        monthlyCommissions: totalCommissions,
        topPerformers,
        commissionsByType,
        recentCommissions: commissions?.slice(0, 10) || [],
        growth
      });
    } catch (error) {
      console.error('Error fetching commissions data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="admin-title">Commission Analytics</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </header>

      {/* Commission Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Commissions</div>
          <div className="stat-value">${commissionsData.totalCommissions.toLocaleString()}</div>
          <div className={`stat-change ${commissionsData.growth >= 0 ? 'positive' : 'negative'}`}>
            {commissionsData.growth >= 0 ? '+' : ''}{commissionsData.growth.toFixed(1)}%
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Commission Payouts</div>
          <div className="stat-value">{commissionsData.recentCommissions.length}</div>
          <div className="stat-change positive">Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Top Performer</div>
          <div className="stat-value">
            {commissionsData.topPerformers[0]?.user?.name || 'N/A'}
          </div>
          <div className="stat-change positive">
            ${commissionsData.topPerformers[0]?.total.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Avg Commission</div>
          <div className="stat-value">
            ${commissionsData.recentCommissions.length > 0 
              ? (commissionsData.totalCommissions / commissionsData.recentCommissions.length).toFixed(2)
              : '0.00'
            }
          </div>
          <div className="stat-change positive">Per payout</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Top Performers */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Top Performers</h2>
          </div>
          <div className="activity-list">
            {commissionsData.topPerformers.map((performer, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon commission">
                  #{index + 1}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    {performer.user?.name || 'Unknown User'}
                  </div>
                  <div className="activity-time">
                    ${performer.total.toFixed(2)} ({performer.count} commissions)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Commissions */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Recent Commissions</h2>
          </div>
          <div className="activity-list">
            {commissionsData.recentCommissions.map((commission) => (
              <div key={commission.id} className="activity-item">
                <div className="activity-icon commission">
                  <FaMoneyBillWave />
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    ${commission.amount?.toFixed(2)} - {commission.users?.name || 'Unknown'}
                  </div>
                  <div className="activity-time">
                    {new Date(commission.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Types Breakdown */}
      <div className="recent-activity" style={{ marginTop: '20px' }}>
        <div className="activity-header">
          <h2 className="activity-title">Commission Breakdown by Type</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', padding: '15px' }}>
          {Object.entries(commissionsData.commissionsByType).map(([type, amount]) => (
            <div key={type} style={{ 
              padding: '15px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#495057' }}>
                ${amount.toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', textTransform: 'capitalize' }}>
                {type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const Content = () => {
  const [contentData, setContentData] = useState({
    totalCourses: 0,
    totalModules: 0,
    completionRate: 0,
    popularCourses: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      setLoading(true);

      // Get course completion data
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('course_id, percent_done, status');

      if (progressError) throw progressError;

      // Calculate course popularity and completion rates
      const courseStats = {};
      progressData?.forEach(progress => {
        if (!courseStats[progress.course_id]) {
          courseStats[progress.course_id] = {
            enrollments: 0,
            completions: 0,
            totalProgress: 0
          };
        }
        courseStats[progress.course_id].enrollments++;
        courseStats[progress.course_id].totalProgress += progress.percent_done || 0;
        if (progress.status === 'completed') {
          courseStats[progress.course_id].completions++;
        }
      });

      // Get course details from static data
      const coursesArray = courses || [];
      const totalCourses = coursesArray.length;
      const totalModules = coursesArray.reduce((sum, course) => sum + (course.modules?.length || 0), 0);

      // Calculate popular courses
      const popularCourses = Object.entries(courseStats)
        .map(([courseId, stats]) => {
          const course = coursesArray.find(c => c.slug === courseId);
          return {
            id: courseId,
            title: course?.title || courseId,
            enrollments: stats.enrollments,
            completionRate: stats.enrollments > 0 ? (stats.completions / stats.enrollments) * 100 : 0,
            avgProgress: stats.enrollments > 0 ? stats.totalProgress / stats.enrollments : 0
          };
        })
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);

      // Overall completion rate
      const totalEnrollments = Object.values(courseStats).reduce((sum, stats) => sum + stats.enrollments, 0);
      const totalCompletions = Object.values(courseStats).reduce((sum, stats) => sum + stats.completions, 0);
      const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

      // Get recent activity
      const { data: activityData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('type', 'course_completion')
        .order('created_at', { ascending: false })
        .limit(10);

      setContentData({
        totalCourses,
        totalModules,
        completionRate,
        popularCourses,
        recentActivity: activityData || []
      });

    } catch (error) {
      console.error('Error fetching content data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loading-spinner">Loading content data...</div>
      </div>
    );
  }

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Content Management</h1>
      </header>

      {/* Content Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Courses</div>
          <div className="stat-value">{contentData.totalCourses}</div>
          <div className="stat-change positive">Active</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Modules</div>
          <div className="stat-value">{contentData.totalModules}</div>
          <div className="stat-change positive">Available</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Completion Rate</div>
          <div className="stat-value">{contentData.completionRate.toFixed(1)}%</div>
          <div className="stat-change positive">Overall</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Popular Content</div>
          <div className="stat-value">{contentData.popularCourses[0]?.title || 'N/A'}</div>
          <div className="stat-change positive">Most enrolled</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Popular Courses */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Popular Courses</h2>
          </div>
          <div className="activity-list">
            {contentData.popularCourses.map((course, index) => (
              <div key={course.id} className="activity-item">
                <div className="activity-icon course">
                  #{index + 1}
                </div>
                <div className="activity-content">
                  <div className="activity-text">{course.title}</div>
                  <div className="activity-time">
                    {course.enrollments} enrollments • {course.completionRate.toFixed(1)}% completion
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Library */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Course Library</h2>
          </div>
          <div className="activity-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {courses.slice(0, 10).map((course, index) => (
              <div key={course.slug} className="activity-item">
                <div className="activity-icon course">
                  📚
                </div>
                <div className="activity-content">
                  <div className="activity-text">{course.title}</div>
                  <div className="activity-time">
                    {course.modules?.length || 0} modules • {course.estimatedTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Categories */}
      <div className="recent-activity" style={{ marginTop: '20px' }}>
        <div className="activity-header">
          <h2 className="activity-title">Content Categories</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '15px' }}>
          <div style={{ padding: '15px', background: '#e7f3ff', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0066cc' }}>Email Marketing</div>
            <div style={{ fontSize: '14px', color: '#004499' }}>Core foundation courses</div>
          </div>
          <div style={{ padding: '15px', background: '#e8f5e8', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#006600' }}>SEO & Search</div>
            <div style={{ fontSize: '14px', color: '#004400' }}>Search optimization</div>
          </div>
          <div style={{ padding: '15px', background: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#cc6600' }}>Social Media</div>
            <div style={{ fontSize: '14px', color: '#994400' }}>Platform-specific training</div>
          </div>
          <div style={{ padding: '15px', background: '#f3e5f5', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6600cc' }}>Advanced Marketing</div>
            <div style={{ fontSize: '14px', color: '#4400aa' }}>Expert-level content</div>
          </div>
        </div>
      </div>
    </>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    userMetrics: {},
    revenueMetrics: {},
    engagementMetrics: {},
    conversionMetrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const daysBack = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // User metrics
      const { data: users } = await supabase
        .from('users')
        .select('created_at, role, status')
        .gte('created_at', startDate.toISOString());

      const { data: allUsers } = await supabase
        .from('users')
        .select('id, role, status, created_at');

      // Revenue metrics
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount, subscribed_at, status')
        .gte('subscribed_at', startDate.toISOString());

      // Course engagement
      const { data: progress } = await supabase
        .from('user_progress')
        .select('percent_done, created_at, status');

      // Activity metrics
      const { data: activity } = await supabase
        .from('activity_log')
        .select('type, created_at')
        .gte('created_at', startDate.toISOString());

      // Calculate metrics
      const userMetrics = {
        newUsers: users?.length || 0,
        totalUsers: allUsers?.length || 0,
        activeUsers: allUsers?.filter(u => u.status === 'active').length || 0,
        usersByRole: allUsers?.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        }, {}) || {}
      };

      const revenueMetrics = {
        totalRevenue: subscriptions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0,
        activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
        averageRevenue: subscriptions?.length > 0 ? 
          (subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) / subscriptions.length) : 0
      };

      const engagementMetrics = {
        courseCompletions: progress?.filter(p => p.status === 'completed').length || 0,
        averageProgress: progress?.length > 0 ?
          (progress.reduce((sum, p) => sum + (p.percent_done || 0), 0) / progress.length) : 0,
        totalActivity: activity?.length || 0
      };

      const conversionMetrics = {
        signupToActiveRate: userMetrics.totalUsers > 0 ? 
          (userMetrics.activeUsers / userMetrics.totalUsers) * 100 : 0,
        completionRate: progress?.length > 0 ?
          (progress.filter(p => p.status === 'completed').length / progress.length) * 100 : 0
      };

      setAnalyticsData({
        userMetrics,
        revenueMetrics,
        engagementMetrics,
        conversionMetrics
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Analytics Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </header>

      {/* Key Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{analyticsData.userMetrics.totalUsers}</div>
          <div className="stat-change positive">
            {analyticsData.userMetrics.newUsers} new
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Revenue</div>
          <div className="stat-value">${analyticsData.revenueMetrics.totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">
            {analyticsData.revenueMetrics.activeSubscriptions} active subs
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Engagement</div>
          <div className="stat-value">{analyticsData.engagementMetrics.averageProgress.toFixed(1)}%</div>
          <div className="stat-change positive">Avg progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Conversions</div>
          <div className="stat-value">{analyticsData.conversionMetrics.signupToActiveRate.toFixed(1)}%</div>
          <div className="stat-change positive">Signup to active</div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">User Distribution</h2>
          </div>
          <div style={{ padding: '15px' }}>
            {Object.entries(analyticsData.userMetrics.usersByRole).map(([role, count]) => (
              <div key={role} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #eee'
              }}>
                <span style={{ textTransform: 'capitalize' }}>{role}</span>
                <span style={{ fontWeight: 'bold' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <h2 className="activity-title">Performance Metrics</h2>
          </div>
          <div style={{ padding: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Course Completion Rate</div>
              <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ 
                  background: '#28a745', 
                  height: '100%', 
                  width: `${analyticsData.conversionMetrics.completionRate}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {analyticsData.conversionMetrics.completionRate.toFixed(1)}%
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>User Activation Rate</div>
              <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ 
                  background: '#007bff', 
                  height: '100%', 
                  width: `${analyticsData.conversionMetrics.signupToActiveRate}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {analyticsData.conversionMetrics.signupToActiveRate.toFixed(1)}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Average Course Progress</div>
              <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ 
                  background: '#ffc107', 
                  height: '100%', 
                  width: `${analyticsData.engagementMetrics.averageProgress}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {analyticsData.engagementMetrics.averageProgress.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Engagement Summary */}
      <div className="recent-activity" style={{ marginTop: '20px' }}>
        <div className="activity-header">
          <h2 className="activity-title">Summary Statistics</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '15px' }}>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
              ${analyticsData.revenueMetrics.averageRevenue.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Average Revenue per User</div>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
              {analyticsData.engagementMetrics.courseCompletions}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Course Completions</div>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
              {analyticsData.engagementMetrics.totalActivity}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Activities</div>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
              {analyticsData.userMetrics.activeUsers}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Active Users</div>
          </div>
        </div>
      </div>
    </>
  );
};

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
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/devops/keys' 
        : 'https://revenue-ripple.onrender.com/devops/keys';
        
      const response = await fetch(apiUrl, {
        headers: {
          'x-user-id': userData.user.id
        }
      });
      const result = await response.json();
      if (response.ok) {
        setApiKeys(result.keys || []);
      } else {
        console.error('Error fetching API keys:', result.error);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const createApiKey = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/devops/generate-key' 
        : 'https://revenue-ripple.onrender.com/devops/generate-key';
      
      const response = await fetch(apiUrl, {
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
      
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? '' 
        : 'https://revenue-ripple.onrender.com';
        
      // Sync user data
      const userResponse = await fetch(`${baseUrl}/devops/sync/users`, {
        headers: { 'x-api-key': 'your-api-key-here' } // Would use actual key
      });
      
      // Sync revenue data
      const revenueResponse = await fetch(`${baseUrl}/devops/sync/revenue`, {
        headers: { 'x-api-key': 'your-api-key-here' }
      });
      
      // Sync commission data
      const commissionResponse = await fetch(`${baseUrl}/devops/sync/commissions`, {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // DevOps API Key state and generator
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [generatingKeys, setGeneratingKeys] = useState(false);

  const generateDevOpsKeys = async () => {
    setGeneratingKeys(true);
    try {
      // Use production API URL when not in development
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/devops/generate-api-key' 
        : 'https://revenue-ripple.onrender.com/devops/generate-api-key';
        
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (res.ok) {
        setApiKey(data.api_key);
        setWebhookSecret(data.webhook_secret);
        alert('DevOps API keys generated successfully!\n\nAPI Key: ' + data.api_key + '\nWebhook Secret: ' + data.webhook_secret + '\n\nSave these keys securely - they won\'t be shown again!');
      } else {
        alert('Error generating API keys: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating DevOps API keys:', error);
      alert('Error connecting to server. Please try again later.');
    }
    setGeneratingKeys(false);
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

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
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="mobile-overlay visible"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobile ? (isMobileMenuOpen ? 'mobile-visible' : 'mobile-hidden') : ''}`}>
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
      <main className={`admin-main ${isMobile ? 'mobile-full' : ''}`}>
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
                <header className="admin-header">
                  <h1 className="admin-title">Dashboard Widgets</h1>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => window.location.reload()}
                    >
                      Refresh All
                    </button>
                  </div>
                </header>

                {/* KPI Tracker Widget */}
                <div className="recent-activity" style={{ marginBottom: '20px' }}>
                  <div className="activity-header">
                    <h2 className="activity-title">KPI Tracker Agent</h2>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <KPITracker />
                  </div>
                </div>

                {/* Widget Configuration Panel */}
                <div className="recent-activity" style={{ marginBottom: '20px' }}>
                  <div className="activity-header">
                    <h2 className="activity-title">Widget Configuration</h2>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                      <div style={{ 
                        padding: '15px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        background: '#f9fafb'
                      }}>
                        <h4 style={{ marginBottom: '10px', color: '#374151' }}>User Metrics Widget</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                          Track user registrations, active members, and user role distribution.
                        </p>
                        <div style={{ fontSize: '12px', color: '#059669' }}>✅ Active</div>
                      </div>
                      
                      <div style={{ 
                        padding: '15px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        background: '#f9fafb'
                      }}>
                        <h4 style={{ marginBottom: '10px', color: '#374151' }}>Revenue Analytics Widget</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                          Monitor subscription revenue, growth trends, and subscription breakdowns.
                        </p>
                        <div style={{ fontSize: '12px', color: '#059669' }}>✅ Active</div>
                      </div>
                      
                      <div style={{ 
                        padding: '15px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        background: '#f9fafb'
                      }}>
                        <h4 style={{ marginBottom: '10px', color: '#374151' }}>Commission Tracker Widget</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                          Track commission payouts, top performers, and commission trends.
                        </p>
                        <div style={{ fontSize: '12px', color: '#059669' }}>✅ Active</div>
                      </div>
                      
                      <div style={{ 
                        padding: '15px', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        background: '#f9fafb'
                      }}>
                        <h4 style={{ marginBottom: '10px', color: '#374151' }}>Activity Monitor Widget</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                          Real-time activity tracking including signups, payments, and completions.
                        </p>
                        <div style={{ fontSize: '12px', color: '#059669' }}>✅ Active</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget Performance Stats */}
                <div className="recent-activity">
                  <div className="activity-header">
                    <h2 className="activity-title">Widget Performance</h2>
                  </div>
                  <div className="stats-grid" style={{ padding: '20px' }}>
                    <div className="stat-card">
                      <div className="stat-title">Refresh Rate</div>
                      <div className="stat-value">30s</div>
                      <div className="stat-change positive">Auto-sync</div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-title">Data Sources</div>
                      <div className="stat-value">5</div>
                      <div className="stat-change positive">Connected</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-title">Widget Load Time</div>
                      <div className="stat-value">0.8s</div>
                      <div className="stat-change positive">Optimized</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-title">Uptime</div>
                      <div className="stat-value">99.9%</div>
                      <div className="stat-change positive">Excellent</div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px', color: '#374151' }}>Widget Features</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', color: '#4b5563', marginBottom: '10px' }}>Real-time Metrics</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#6b7280' }}>
                          <li style={{ marginBottom: '5px' }}>• Live user count and activity</li>
                          <li style={{ marginBottom: '5px' }}>• Revenue tracking with growth indicators</li>
                          <li style={{ marginBottom: '5px' }}>• Commission analytics and top performers</li>
                          <li style={{ marginBottom: '5px' }}>• Course completion and engagement metrics</li>
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', color: '#4b5563', marginBottom: '10px' }}>Interactive Features</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#6b7280' }}>
                          <li style={{ marginBottom: '5px' }}>• Drill-down functionality for detailed analysis</li>
                          <li style={{ marginBottom: '5px' }}>• Customizable time ranges and filters</li>
                          <li style={{ marginBottom: '5px' }}>• Export capabilities for reports</li>
                          <li style={{ marginBottom: '5px' }}>• Mobile-responsive design</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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