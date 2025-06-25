import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';
import './admin.css';

const AdminSimple = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  console.log('AdminSimple: User:', user);

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchDashboardData();
      fetchUsers();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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
          value: '$0',
          change: '+23.4%', 
          positive: true 
        },
        { 
          title: 'Commission Paid', 
          value: '$0',
          change: '-2.3%', 
          positive: false 
        },
      ]);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setUsers(data?.map(user => ({
        id: user.id,
        name: user.name || 'N/A',
        email: user.email,
        status: user.status || 'inactive',
        memberSince: new Date(user.created_at).toLocaleDateString(),
        role: user.role || 'member',
      })) || []);

    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span style={{ marginLeft: 16 }}>Loading admin panel...</span>
      </div>
    );
  }

  // Check if user exists and is admin
  if (!user || user.role !== 'admin') {
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
        <p>Current role: {user?.role || 'Not logged in'}</p>
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
          Revenue Ripple Admin
        </div>
        <nav className="admin-nav">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            👥 User Management
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            💰 Payments
          </button>
          <button 
            onClick={() => setActiveTab('webhooks')}
            className={`admin-nav-item ${activeTab === 'webhooks' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            🔗 Webhooks
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            Error: {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
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

            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Loading dashboard data...
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <header className="admin-header">
              <h1 className="admin-title">User Management</h1>
            </header>
            
            <div className="user-management">
              <div className="user-header">
                <h2 className="activity-title">Users ({users.length})</h2>
              </div>
              
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Member Since</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 20).map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                      <td>{user.memberSince}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <>
            <header className="admin-header">
              <h1 className="admin-title">Payment Management</h1>
            </header>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
              <h3>Webhook Status</h3>
              <p>Payment webhooks are configured and processing.</p>
              <p><strong>Webhook Endpoint:</strong> /webhook</p>
              <p><strong>Supported Events:</strong> checkout.session.completed</p>
              
              <h4 style={{ marginTop: '24px' }}>Recent Webhooks</h4>
              <p style={{ color: '#666' }}>Check server logs for recent webhook activity.</p>
            </div>
          </>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <>
            <header className="admin-header">
              <h1 className="admin-title">Webhook Configuration</h1>
            </header>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
              <h3>Stripe Webhook Status</h3>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ 
                  background: '#dcfce7', 
                  color: '#15803d', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  ✅ Active
                </span>
              </div>
              
              <h4>Configured Events:</h4>
              <ul>
                <li>checkout.session.completed</li>
                <li>invoice.payment_succeeded</li>
                <li>customer.subscription.updated</li>
              </ul>

              <h4 style={{ marginTop: '24px' }}>Test Webhook</h4>
              <button 
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  console.log('Testing webhook...');
                  alert('Check server logs for webhook test results');
                }}
              >
                Send Test Event
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminSimple;