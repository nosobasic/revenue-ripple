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
            element={<DevOpsIntegration />}
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;