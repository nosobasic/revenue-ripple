import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiBase } from '../../config/constants';
import Navbar from '../../components/Navbar';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EngagementDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [atRiskUsers, setAtRiskUsers] = useState([]);
  const [popularContent, setPopularContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch engagement statistics
        const statsResponse = await fetch(`${getApiBase()}/api/engagement/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.segments);
        }

        // Fetch at-risk users
        const atRiskResponse = await fetch(`${getApiBase()}/api/engagement/at-risk-users`);
        if (atRiskResponse.ok) {
          const atRiskData = await atRiskResponse.json();
          setAtRiskUsers(atRiskData.users || []);
        }

        // Fetch popular content
        const contentResponse = await fetch(`${getApiBase()}/api/engagement/popular-content`);
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setPopularContent(contentData.content || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching engagement stats:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#64748b' }}>Loading engagement dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
          Engagement Analytics Dashboard
        </h1>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Hot Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
              {stats?.hot || 0}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Warm Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {stats?.warm || 0}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Cold Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
              {stats?.cold || 0}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>At Risk Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
              {stats?.at_risk || 0}
            </div>
          </div>
        </div>

        {/* Chart of Members by Segment */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>
            Members by Segment
          </h2>
          {stats && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <Bar
                data={{
                  labels: ['Hot', 'Warm', 'Cold', 'At Risk'],
                  datasets: [
                    {
                      label: 'Number of Members',
                      data: [
                        stats.hot || 0,
                        stats.warm || 0,
                        stats.cold || 0,
                        stats.at_risk || 0,
                      ],
                      backgroundColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#3b82f6',
                        '#dc2626',
                      ],
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* At Risk Users List */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
              At Risk Users ({atRiskUsers.length})
            </h2>
            <button
              onClick={() => {
                // Trigger manual recalculation
                fetch(`${getApiBase()}/api/engagement/recalculate`, { method: 'POST' })
                  .then(() => {
                    alert('Recalculation triggered');
                    // Refresh data
                    window.location.reload();
                  })
                  .catch(err => alert('Error: ' + err.message));
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Recalculate Scores
            </button>
          </div>
          {atRiskUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No at-risk users found. Great job! 🎉
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Email</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Score</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskUsers.map((user) => {
                    const formatDate = (dateString) => {
                      if (!dateString) return 'Never';
                      const date = new Date(dateString);
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      });
                    };

                    const daysSince = (dateString) => {
                      if (!dateString) return 'N/A';
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffTime = Math.abs(now - date);
                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays;
                    };

                    const days = daysSince(user.last_seen);

                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', color: '#1e293b' }}>{user.name}</td>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>{user.email}</td>
                        <td style={{ padding: '0.75rem', color: '#dc2626', fontWeight: '600' }}>{user.score}</td>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>
                          {formatDate(user.last_seen)}
                          {days !== 'N/A' && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                              ({days} days ago)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Most Opened Content Items */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Most Opened Content (Past 7 Days)
          </h2>
          {popularContent.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No content opened in the past 7 days.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Title</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>Level</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>Opens</th>
                  </tr>
                </thead>
                <tbody>
                  {popularContent.map((content) => (
                    <tr key={content.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', color: '#1e293b', fontWeight: '500' }}>{content.title}</td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: '#eff6ff',
                          color: '#2563eb',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                        }}>
                          {content.content_type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: content.level === 'member' ? '#fef3c7' : '#e0e7ff',
                          color: content.level === 'member' ? '#d97706' : '#4f46e5',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        }}>
                          {content.level}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: '#1e293b', fontWeight: '600' }}>
                        {content.opens}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Actions */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Manual Actions
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                fetch(`${getApiBase()}/api/engagement/recalculate`, { method: 'POST' })
                  .then(() => alert('Score recalculation triggered'))
                  .catch(err => alert('Error: ' + err.message));
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Recalculate All Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementDashboard;

