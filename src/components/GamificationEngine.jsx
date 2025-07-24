import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

const GamificationEngine = () => {
  const { user } = useAuth();
  
  // Points System Configuration
  const POINT_VALUES = {
    course_completed: 100,
    module_completed: 25,
    quiz_passed: 15,
    perfect_quiz: 25,
    daily_login: 5,
    streak_bonus: 10,
    video_watched: 5,
    guide_read: 10,
    first_course: 50,
    affiliate_signup: 200,
    referral_success: 100,
    challenge_completed: 75
  };

  // Achievement Definitions
  const ACHIEVEMENTS = {
    first_steps: {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Complete your first course module',
      icon: '🎯',
      points: 50,
      condition: (stats) => stats.modules_completed >= 1
    },
    knowledge_seeker: {
      id: 'knowledge_seeker',
      name: 'Knowledge Seeker',
      description: 'Complete 5 courses',
      icon: '📚',
      points: 250,
      condition: (stats) => stats.courses_completed >= 5
    },
    marketing_maven: {
      id: 'marketing_maven',
      name: 'Marketing Maven',
      description: 'Complete 10 courses',
      icon: '🚀',
      points: 500,
      condition: (stats) => stats.courses_completed >= 10
    },
    streak_champion: {
      id: 'streak_champion',
      name: 'Streak Champion',
      description: 'Maintain a 30-day learning streak',
      icon: '🔥',
      points: 300,
      condition: (stats) => stats.current_streak >= 30
    },
    perfectionist: {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Score 100% on 10 quizzes',
      icon: '💎',
      points: 200,
      condition: (stats) => stats.perfect_quizzes >= 10
    },
    early_bird: {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete 10 lessons before 9 AM',
      icon: '🌅',
      points: 150,
      condition: (stats) => stats.early_completions >= 10
    },
    social_learner: {
      id: 'social_learner',
      name: 'Social Learner',
      description: 'Invite 5 friends to join',
      icon: '👥',
      points: 300,
      condition: (stats) => stats.referrals >= 5
    },
    ai_pioneer: {
      id: 'ai_pioneer',
      name: 'AI Pioneer',
      description: 'Complete all AI-related courses',
      icon: '🤖',
      points: 400,
      condition: (stats) => stats.ai_courses_completed >= 3
    }
  };

  // Badge Tiers
  const BADGE_TIERS = {
    bronze: { min: 0, max: 499, name: 'Bronze Scholar', icon: '🥉', color: '#CD7F32' },
    silver: { min: 500, max: 1499, name: 'Silver Expert', icon: '🥈', color: '#C0C0C0' },
    gold: { min: 1500, max: 2999, name: 'Gold Master', icon: '🥇', color: '#FFD700' },
    platinum: { min: 3000, max: 4999, name: 'Platinum Pro', icon: '💎', color: '#E5E4E2' },
    diamond: { min: 5000, max: Infinity, name: 'Diamond Legend', icon: '👑', color: '#B9F2FF' }
  };

  // Award points for user actions
  const awardPoints = async (action, metadata = {}) => {
    if (!user || !POINT_VALUES[action]) return;

    const points = POINT_VALUES[action];
    
    try {
      // Record the point transaction
      const { error } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          action,
          points,
          metadata,
          created_at: new Date().toISOString()
        });

      if (!error) {
        // Update user's total points
        await updateUserPoints(points);
        
        // Check for new achievements
        await checkAchievements();
        
        // Update learning streak
        await updateLearningStreak();
        
        return points;
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  // Update user's total points
  const updateUserPoints = async (pointsToAdd) => {
    const { data: currentUser } = await supabase
      .from('user_gamification')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    const newTotal = (currentUser?.total_points || 0) + pointsToAdd;

    await supabase
      .from('user_gamification')
      .upsert({
        user_id: user.id,
        total_points: newTotal,
        updated_at: new Date().toISOString()
      });
  };

  // Check and award achievements
  const checkAchievements = async () => {
    const userStats = await getUserStats();
    const currentAchievements = await getUserAchievements();
    
    for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip if user already has this achievement
      if (currentAchievements.includes(achievementId)) continue;
      
      // Check if user meets the condition
      if (achievement.condition(userStats)) {
        await awardAchievement(achievementId, achievement);
      }
    }
  };

  // Award a specific achievement
  const awardAchievement = async (achievementId, achievement) => {
    try {
      await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          earned_at: new Date().toISOString()
        });

      // Award achievement points
      await updateUserPoints(achievement.points);

      // Show achievement notification
      showAchievementNotification(achievement);
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  };

  // Get user statistics for achievement checking
  const getUserStats = async () => {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', user.id);

    const { data: streak } = await supabase
      .from('learning_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const coursesCompleted = progress?.filter(p => p.percent_done === 100).length || 0;
    const modulesCompleted = progress?.reduce((sum, p) => sum + (p.modules_completed || 0), 0) || 0;
    const perfectQuizzes = quizResults?.filter(q => q.score === 100).length || 0;

    return {
      courses_completed: coursesCompleted,
      modules_completed: modulesCompleted,
      perfect_quizzes: perfectQuizzes,
      current_streak: streak?.current_streak || 0,
      early_completions: 0, // Would need additional tracking
      referrals: 0, // Would need referral tracking
      ai_courses_completed: progress?.filter(p => 
        p.course_id.includes('ai') && p.percent_done === 100
      ).length || 0
    };
  };

  // Get user's current achievements
  const getUserAchievements = async () => {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    return data?.map(a => a.achievement_id) || [];
  };

  // Update learning streak
  const updateLearningStreak = async () => {
    const today = new Date().toDateString();
    
    const { data: existing } = await supabase
      .from('learning_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = 1;
    let longestStreak = 1;

    if (existing) {
      if (existing.last_activity_date === yesterdayStr) {
        // Continuing streak
        newStreak = existing.current_streak + 1;
      } else if (existing.last_activity_date === today) {
        // Already logged today
        return;
      }
      // If gap > 1 day, streak resets to 1
      
      longestStreak = Math.max(existing.longest_streak, newStreak);
    }

    await supabase
      .from('learning_streaks')
      .upsert({
        user_id: user.id,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      });

    // Award streak bonus points
    if (newStreak > 1) {
      await awardPoints('streak_bonus', { streak_day: newStreak });
    }
  };

  // Create learning challenges
  const createWeeklyChallenge = async () => {
    const challenges = [
      {
        title: 'Speed Learner',
        description: 'Complete 3 modules this week',
        type: 'modules',
        target: 3,
        points: 150,
        expires_at: getWeekEnd()
      },
      {
        title: 'Quiz Master',
        description: 'Score 90%+ on 5 quizzes',
        type: 'quiz_scores',
        target: 5,
        points: 200,
        expires_at: getWeekEnd()
      },
      {
        title: 'Video Binge',
        description: 'Watch 10 training videos',
        type: 'videos',
        target: 10,
        points: 100,
        expires_at: getWeekEnd()
      }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    await supabase
      .from('learning_challenges')
      .insert({
        user_id: user.id,
        ...randomChallenge,
        created_at: new Date().toISOString()
      });
  };

  // Get user's current tier/badge
  const getUserTier = (totalPoints) => {
    for (const [tierId, tier] of Object.entries(BADGE_TIERS)) {
      if (totalPoints >= tier.min && totalPoints <= tier.max) {
        return { id: tierId, ...tier };
      }
    }
    return BADGE_TIERS.bronze;
  };

  // Generate leaderboard
  const getLeaderboard = async (timeframe = 'all_time') => {
    let query = supabase
      .from('user_gamification')
      .select(`
        user_id,
        total_points,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order('total_points', { ascending: false })
      .limit(10);

    if (timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      query = supabase
        .from('point_transactions')
        .select(`
          user_id,
          points,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .gte('created_at', weekAgo.toISOString())
        .order('points', { ascending: false })
        .limit(10);
    }

    const { data } = await query;
    return data || [];
  };

  // Helper functions
  const getWeekEnd = () => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) + 6;
    return new Date(date.setDate(diff)).toISOString();
  };

  const showAchievementNotification = (achievement) => {
    // This would trigger a toast notification or modal
    console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
  };

  return {
    awardPoints,
    checkAchievements,
    updateLearningStreak,
    createWeeklyChallenge,
    getUserTier,
    getLeaderboard,
    getUserStats,
    getUserAchievements,
    ACHIEVEMENTS,
    BADGE_TIERS,
    POINT_VALUES
  };
};

export default GamificationEngine;