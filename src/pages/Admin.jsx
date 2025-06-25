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

// Placeholder components for other sections
const Commissions = () => <h1>Commissions</h1>;
const Content = () => <h1>Content</h1>;
const Analytics = () => <h1>Analytics</h1>;

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
            <DashboardOverview stats={stats} recentActivity={recentActivity} />
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
            element={
              <div style={{ width: '100%', height: '600px' }}>
                <iframe 
                  src="https://dev-ops-modules-wdonte97.replit.app/embed"
                  width="100%" 
                  height="600px"
                  frameBorder="0"
                  style={{ border: 'none', display: 'block' }}
                  allow="web-share"
                  sandbox="allow-scripts allow-same-origin"
                  title="Embedded Widget"
                />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;