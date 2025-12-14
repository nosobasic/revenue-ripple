import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiBase } from '../../config/constants';
import EngagementBadge from './EngagementBadge';
import EngagementProgress from './EngagementProgress';
import EngagementStreak from './EngagementStreak';

const EngagementDashboard = () => {
  const { user } = useAuth();
  const [engagement, setEngagement] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch engagement score
        const scoreResponse = await fetch(`${getApiBase()}/api/engagement/score?user_id=${user.id}`);
        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          setEngagement(scoreData);
        }

        // Fetch recent history
        const historyResponse = await fetch(`${getApiBase()}/api/engagement/history?user_id=${user.id}&limit=10`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData.events || []);
        }
      } catch (error) {
        console.error('Error fetching engagement data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#64748b' }}>Loading engagement dashboard...</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      briefing_opened: '📄 Opened Briefing',
      briefing_read: '📖 Read Briefing',
      module_viewed: '🎥 Viewed Module',
      module_completed: '✅ Completed Module',
      ai_interaction: '🤖 AI Interaction',
      daily_login: '🔐 Daily Login',
    };
    return labels[eventType] || eventType;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
        Your Engagement Dashboard
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Current Status</div>
          <EngagementBadge size="large" showLabel={true} />
        </div>

        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Score</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
            {engagement?.score || 0}
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Last Activity</div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
            {engagement?.last_event_at ? formatDate(engagement.last_event_at) : 'No activity yet'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <EngagementProgress />
      </div>

      {/* Streak */}
      <div style={{ marginBottom: '2rem' }}>
        <EngagementStreak />
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
          Recent Activity
        </h2>
        {history.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No recent activity. Start engaging to see your activity here!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>
                    {getEventTypeLabel(event.event_type)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {formatDate(event.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementDashboard;

