import React, { useState, useEffect, useRef } from 'react';
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const initializationRef = useRef(false);

  console.log('AdminSimple: User:', user);
  console.log('AdminSimple: AuthLoading:', authLoading);
  console.log('AdminSimple: DataLoaded:', dataLoaded);

  useEffect(() => {
    // Only initialize once when we have a confirmed admin user
    if (!authLoading && user?.role === 'admin' && !initializationRef.current) {
      console.log('AdminSimple: Initializing data...');
      initializationRef.current = true;
      fetchDashboardData();
      fetchUsers();
    }
  }, [authLoading, user?.role, user?.id]); // Use user.id instead of whole user object

  // Add a separate effect to handle user state changes
  useEffect(() => {
    if (authLoading) {
      console.log('AdminSimple: Auth is loading...');
      return;
    }

    if (!user) {
      console.log('AdminSimple: No user found, resetting state...');
      initializationRef.current = false;
      setDataLoaded(false);
      setStats([]);
      setUsers([]);
      return;
    }

    if (user.role !== 'admin') {
      console.log('AdminSimple: User is not admin, resetting state...');
      initializationRef.current = false;
      setDataLoaded(false);
      return;
    }

    console.log('AdminSimple: Valid admin user confirmed');
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('AdminSimple: Fetching dashboard data...');

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

      setDataLoaded(true);
      console.log('AdminSimple: Dashboard data loaded successfully');

    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('AdminSimple: Fetching users...');
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

      console.log('AdminSimple: Users loaded successfully');

    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Handle refresh data manually
  const handleRefreshData = () => {
    console.log('AdminSimple: Manual refresh triggered');
    fetchDashboardData();
    fetchUsers();
  };

  // Show loading while auth is still loading or if we don't have user data
  if (authLoading || (!user && !authLoading === false)) {
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
          <button 
            onClick={handleRefreshData}
            className="admin-nav-item"
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left',
              marginTop: '20px',
              opacity: '0.7'
            }}
          >
            🔄 Refresh Data
          </button>
          
          {/* Navigation Test Buttons */}
          <div style={{ 
            marginTop: '30px', 
            paddingTop: '20px', 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            opacity: '0.7'
          }}>
            <div style={{ marginBottom: '10px', color: '#94a3b8' }}>Navigation Test:</div>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="admin-nav-item"
              style={{ 
                background: 'none', 
                border: 'none', 
                width: '100%', 
                textAlign: 'left',
                fontSize: '12px',
                padding: '5px 10px'
              }}
            >
              → Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/admin'}
              className="admin-nav-item"
              style={{ 
                background: 'none', 
                border: 'none', 
                width: '100%', 
                textAlign: 'left',
                fontSize: '12px',
                padding: '5px 10px'
              }}
            >
              ← Back to Admin
            </button>
          </div>
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
            <button 
              onClick={() => setError(null)}
              style={{ 
                marginLeft: '10px', 
                background: 'transparent', 
                border: 'none', 
                color: '#b91c1c',
                cursor: 'pointer' 
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <header className="admin-header">
              <h1 className="admin-title">Dashboard Overview</h1>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {dataLoaded && (
                  <span style={{ 
                    background: '#dcfce7', 
                    color: '#15803d', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    ✅ Data Loaded
                  </span>
                )}
                <button 
                  onClick={handleRefreshData}
                  style={{
                    padding: '6px 12px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" style={{ display: 'inline-block' }}></div>
                <span style={{ marginLeft: 10 }}>Loading dashboard data...</span>
              </div>
            )}
            
            {!loading && !dataLoaded && stats.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p>No data loaded yet. Click "Refresh Data" to load dashboard information.</p>
              </div>
            )}

            {/* Debug Information */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '16px', 
              borderRadius: '8px', 
              marginTop: '20px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Debug Information:</h4>
              <div><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</div>
              <div><strong>User Email:</strong> {user?.email || 'Not loaded'}</div>
              <div><strong>User Role:</strong> {user?.role || 'Not loaded'}</div>
              <div><strong>Data Initialized:</strong> {initializationRef.current ? 'Yes' : 'No'}</div>
              <div><strong>Data Loaded:</strong> {dataLoaded ? 'Yes' : 'No'}</div>
              <div><strong>Stats Count:</strong> {stats.length}</div>
              <div><strong>Users Count:</strong> {users.length}</div>
              <div><strong>Component Loading:</strong> {loading ? 'Yes' : 'No'}</div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <header className="admin-header">
              <h1 className="admin-title">User Management</h1>
              <button 
                onClick={handleRefreshData}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔄 Refresh Users
              </button>
            </header>
            
            <div className="user-management">
              <div className="user-header">
                <h2 className="activity-title">Users ({users.length})</h2>
              </div>
              
              {users.length > 0 ? (
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
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No users loaded. Click "Refresh Users" to load user data.</p>
                </div>
              )}
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