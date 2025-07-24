import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import GamificationEngine from '../components/GamificationEngine';
import { supabase } from '../supabase/client';

/**
 * Custom hook to integrate gamification and AI features into existing components
 * This hook automatically tracks user actions and awards points
 */
const useGamificationIntegration = () => {
  const { user } = useAuth();
  const gamification = GamificationEngine();

  // Track user engagement for AI analysis
  const trackEngagement = useCallback(async (actionType, contentId, metadata = {}) => {
    if (!user) return;

    try {
      await supabase
        .from('user_engagement')
        .insert({
          user_id: user.id,
          action_type: actionType,
          content_id: contentId,
          metadata,
          session_id: getSessionId()
        });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }, [user]);

  // Award points and track achievement progress
  const awardPointsForAction = useCallback(async (action, metadata = {}) => {
    if (!user) return;

    try {
      const points = await gamification.awardPoints(action, metadata);
      
      // Show point notification if points were awarded
      if (points > 0) {
        showPointNotification(points, action);
      }
      
      return points;
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }, [user, gamification]);

  // Helper functions for common actions
  const onCourseStart = useCallback(async (courseId) => {
    await trackEngagement('course_start', courseId);
    await awardPointsForAction('daily_login'); // Award login points
  }, [trackEngagement, awardPointsForAction]);

  const onModuleComplete = useCallback(async (courseId, moduleId) => {
    await trackEngagement('module_complete', moduleId, { course_id: courseId });
    await awardPointsForAction('module_completed', { course_id: courseId, module_id: moduleId });
  }, [trackEngagement, awardPointsForAction]);

  const onCourseComplete = useCallback(async (courseId) => {
    await trackEngagement('course_complete', courseId);
    await awardPointsForAction('course_completed', { course_id: courseId });
  }, [trackEngagement, awardPointsForAction]);

  const onQuizComplete = useCallback(async (courseId, moduleId, score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    
    await trackEngagement('quiz_complete', `${courseId}-${moduleId}`, {
      score,
      max_score: maxScore,
      percentage
    });

    // Award different points based on performance
    if (percentage === 100) {
      await awardPointsForAction('perfect_quiz', { course_id: courseId, module_id: moduleId });
    } else if (percentage >= 70) {
      await awardPointsForAction('quiz_passed', { course_id: courseId, module_id: moduleId });
    }
  }, [trackEngagement, awardPointsForAction]);

  const onVideoWatch = useCallback(async (courseId, videoId, duration) => {
    await trackEngagement('video_watch', videoId, {
      course_id: courseId,
      duration_seconds: duration
    });
    
    // Award points for watching videos
    if (duration > 30) { // Only if watched for more than 30 seconds
      await awardPointsForAction('video_watched', { 
        course_id: courseId, 
        video_id: videoId,
        duration 
      });
    }
  }, [trackEngagement, awardPointsForAction]);

  const onGuideRead = useCallback(async (guideId, timeSpent) => {
    await trackEngagement('guide_read', guideId, { time_spent: timeSpent });
    
    // Award points for reading guides
    if (timeSpent > 60) { // Only if spent more than 1 minute
      await awardPointsForAction('guide_read', { guide_id: guideId, time_spent: timeSpent });
    }
  }, [trackEngagement, awardPointsForAction]);

  const onAffiliateSignup = useCallback(async () => {
    await trackEngagement('affiliate_signup', 'affiliate_program');
    await awardPointsForAction('affiliate_signup');
  }, [trackEngagement, awardPointsForAction]);

  const onReferralSuccess = useCallback(async (referredUserId) => {
    await trackEngagement('referral_success', 'referral_program', { 
      referred_user_id: referredUserId 
    });
    await awardPointsForAction('referral_success', { referred_user_id: referredUserId });
  }, [trackEngagement, awardPointsForAction]);

  // Get session ID (create if doesn't exist)
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('learning_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('learning_session_id', sessionId);
    }
    return sessionId;
  };

  // Show point notification (you can customize this)
  const showPointNotification = (points, action) => {
    // Create a simple toast notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="text-lg mr-2">🎉</span>
        <span>+${points} points!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Auto-track page views and session time
  useEffect(() => {
    if (!user) return;

    const startTime = Date.now();
    const currentPage = window.location.pathname;

    // Track page view
    trackEngagement('page_view', currentPage, { 
      referrer: document.referrer,
      timestamp: startTime
    });

    // Track session time when user leaves or page unloads
    const handleUnload = () => {
      const sessionTime = Date.now() - startTime;
      if (sessionTime > 5000) { // Only track if spent more than 5 seconds
        trackEngagement('session_end', currentPage, { 
          session_duration: sessionTime,
          timestamp: Date.now()
        });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload(); // Track when component unmounts
    };
  }, [user, trackEngagement]);

  // Update learning streak on daily login
  useEffect(() => {
    if (user) {
      gamification.updateLearningStreak();
    }
  }, [user, gamification]);

  return {
    // Core functions
    trackEngagement,
    awardPointsForAction,
    
    // Specific action handlers
    onCourseStart,
    onModuleComplete,
    onCourseComplete,
    onQuizComplete,
    onVideoWatch,
    onGuideRead,
    onAffiliateSignup,
    onReferralSuccess,
    
    // Utility functions
    showPointNotification,
    getSessionId
  };
};

export default useGamificationIntegration;