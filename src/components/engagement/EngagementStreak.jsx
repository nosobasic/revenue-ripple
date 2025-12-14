import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const EngagementStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const calculateStreak = async () => {
      try {
        // Get all daily_login events for this user, ordered by date
        const { data: events, error } = await supabase
          .from('ve_content_user_events')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('event_type', 'daily_login')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!events || events.length === 0) {
          setStreak(0);
          setLoading(false);
          return;
        }

        // Calculate consecutive days
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < events.length; i++) {
          const eventDate = new Date(events[i].created_at);
          eventDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));

          if (daysDiff === currentStreak) {
            currentStreak++;
          } else if (daysDiff > currentStreak) {
            // Gap in streak
            break;
          }
        }

        setStreak(currentStreak);
      } catch (error) {
        console.error('Error calculating streak:', error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    calculateStreak();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>
        Calculating streak...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>🔥</span>
      <div>
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Login Streak</div>
        <div style={{ fontSize: '1.25rem' }}>{streak} days</div>
      </div>
    </div>
  );
};

export default EngagementStreak;

