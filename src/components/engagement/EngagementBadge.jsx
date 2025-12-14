import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiBase } from '../../config/constants';

const EngagementBadge = ({ size = 'medium', showLabel = true }) => {
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
    return null;
  }

  const segment = engagement.segment || 'cold';
  const score = engagement.score || 0;

  const segmentConfig = {
    hot: {
      emoji: '🔥',
      label: 'Hot',
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
    warm: {
      emoji: '🌡️',
      label: 'Warm',
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    cold: {
      emoji: '❄️',
      label: 'Cold',
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    at_risk: {
      emoji: '⚠️',
      label: 'At Risk',
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
  };

  const config = segmentConfig[segment] || segmentConfig.cold;

  const sizeStyles = {
    small: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      gap: '0.25rem',
    },
    medium: {
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      gap: '0.5rem',
    },
    large: {
      fontSize: '1rem',
      padding: '0.75rem 1rem',
      gap: '0.75rem',
    },
  };

  const style = sizeStyles[size] || sizeStyles.medium;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: style.gap,
        padding: style.padding,
        borderRadius: '9999px',
        backgroundColor: config.bgColor,
        color: config.color,
        fontSize: style.fontSize,
        fontWeight: '600',
        border: `1px solid ${config.color}20`,
      }}
    >
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
      {showLabel && (
        <span style={{ opacity: 0.7, fontSize: '0.85em' }}>
          ({score})
        </span>
      )}
    </div>
  );
};

export default EngagementBadge;

