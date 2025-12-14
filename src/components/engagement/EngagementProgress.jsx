import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiBase } from '../../config/constants';

const EngagementProgress = () => {
  const { user } = useAuth();
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchEngagement = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/engagement/score?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setEngagement(data);
        }
      } catch (error) {
        console.error('Error fetching engagement score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngagement();
  }, [user]);

  if (loading || !engagement) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
        Loading engagement...
      </div>
    );
  }

  const score = engagement.score || 0;
  const segment = engagement.segment || 'cold';

  // Calculate progress to next threshold
  const thresholds = {
    at_risk: 0,
    cold: 1,
    warm: 10,
    hot: 30,
  };

  let currentThreshold = thresholds[segment];
  let nextThreshold = thresholds.warm;

  if (segment === 'at_risk') {
    nextThreshold = thresholds.cold;
  } else if (segment === 'cold') {
    nextThreshold = thresholds.warm;
  } else if (segment === 'warm') {
    nextThreshold = thresholds.hot;
  } else {
    // Hot - show progress beyond hot
    currentThreshold = thresholds.hot;
    nextThreshold = thresholds.hot + 20; // Show progress to 50
  }

  const progress = Math.max(0, score - currentThreshold);
  const range = nextThreshold - currentThreshold;
  const percentage = Math.min(100, Math.max(0, (progress / range) * 100));

  const segmentColors = {
    hot: '#ef4444',
    warm: '#f59e0b',
    cold: '#3b82f6',
    at_risk: '#dc2626',
  };

  const color = segmentColors[segment] || segmentColors.cold;

  return (
    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>Engagement Score</span>
          <span style={{ marginLeft: '0.5rem', color: color, fontWeight: '600' }}>
            {score} points
          </span>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Next: {nextThreshold}
        </div>
      </div>
      <div
        style={{
          height: '12px',
          backgroundColor: '#e2e8f0',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
            borderRadius: '6px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
        {segment === 'hot' && '🔥 You\'re on fire! Keep it up!'}
        {segment === 'warm' && '🌡️ You\'re doing great! Keep engaging to reach Hot status.'}
        {segment === 'cold' && '❄️ Get more active to increase your engagement score.'}
        {segment === 'at_risk' && '⚠️ Your engagement is low. Check out new content to get back on track!'}
      </div>
    </div>
  );
};

export default EngagementProgress;

