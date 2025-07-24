import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GamificationEngine from './GamificationEngine';
import { 
  FaTrophy, 
  FaFire, 
  FaStar, 
  FaMedal, 
  FaChartLine, 
  FaUsers, 
  FaTarget,
  FaCrown,
  FaGift,
  FaCalendarAlt
} from 'react-icons/fa';

const GamificationDashboard = () => {
  const { user } = useAuth();
  const gamification = GamificationEngine();
  
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    setIsLoading(true);
    try {
      // Load user stats
      const stats = await gamification.getUserStats();
      setUserStats(stats);
      setStreak(stats.current_streak);

      // Load achievements
      const userAchievements = await gamification.getUserAchievements();
      setAchievements(userAchievements);

      // Calculate total points and tier
      const points = calculateTotalPoints(stats);
      setTotalPoints(points);
      const tier = gamification.getUserTier(points);
      setCurrentTier(tier);

      // Load leaderboard
      const leaderboardData = await gamification.getLeaderboard();
      setLeaderboard(leaderboardData);

      // Load challenges (mock data for now)
      setChallenges([
        {
          id: 1,
          title: 'Speed Learner',
          description: 'Complete 3 modules this week',
          progress: 1,
          target: 3,
          points: 150,
          expires: '2 days'
        },
        {
          id: 2,
          title: 'Quiz Master',
          description: 'Score 90%+ on 5 quizzes',
          progress: 3,
          target: 5,
          points: 200,
          expires: '4 days'
        }
      ]);

    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPoints = (stats) => {
    // Calculate points based on user activities
    const coursePoints = stats.courses_completed * gamification.POINT_VALUES.course_completed;
    const modulePoints = stats.modules_completed * gamification.POINT_VALUES.module_completed;
    const quizPoints = stats.perfect_quizzes * gamification.POINT_VALUES.perfect_quiz;
    const streakPoints = stats.current_streak * gamification.POINT_VALUES.streak_bonus;
    
    return coursePoints + modulePoints + quizPoints + streakPoints;
  };

  const getProgressToNextTier = () => {
    if (!currentTier) return { progress: 0, needed: 0 };
    
    const tierEntries = Object.entries(gamification.BADGE_TIERS);
    const currentIndex = tierEntries.findIndex(([key]) => key === currentTier.id);
    
    if (currentIndex === tierEntries.length - 1) {
      return { progress: 100, needed: 0 }; // Already at max tier
    }
    
    const nextTier = tierEntries[currentIndex + 1][1];
    const needed = nextTier.min - totalPoints;
    const progress = Math.min(100, (totalPoints / nextTier.min) * 100);
    
    return { progress, needed: Math.max(0, needed) };
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Points */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Points</p>
              <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
            </div>
            <FaStar className="text-4xl text-blue-200" />
          </div>
        </div>

        {/* Current Tier */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Current Tier</p>
              <p className="text-xl font-bold">{currentTier?.name}</p>
            </div>
            <div className="text-4xl">{currentTier?.icon}</div>
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Learning Streak</p>
              <p className="text-3xl font-bold">{streak} days</p>
            </div>
            <FaFire className="text-4xl text-orange-200" />
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Achievements</p>
              <p className="text-3xl font-bold">{achievements.length}</p>
            </div>
            <FaTrophy className="text-4xl text-green-200" />
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {currentTier && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Progress to Next Tier</h3>
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{currentTier.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{currentTier.name}</span>
                <span className="text-sm text-gray-500">
                  {getProgressToNextTier().needed > 0 
                    ? `${getProgressToNextTier().needed} points needed`
                    : 'Max tier reached!'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressToNextTier().progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(gamification.ACHIEVEMENTS)
            .filter(([id]) => achievements.includes(id))
            .slice(0, 4)
            .map(([id, achievement]) => (
            <div key={id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-semibold text-sm">{achievement.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
              <p className="text-xs text-blue-600 font-medium mt-2">+{achievement.points} pts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(gamification.ACHIEVEMENTS).map(([id, achievement]) => {
          const isEarned = achievements.includes(id);
          return (
            <div 
              key={id} 
              className={`p-6 rounded-lg border-2 transition-all ${
                isEarned 
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className={`text-4xl mb-3 ${isEarned ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <h3 className={`font-bold text-lg ${isEarned ? 'text-yellow-800' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm mt-2 ${isEarned ? 'text-yellow-700' : 'text-gray-400'}`}>
                  {achievement.description}
                </p>
                <div className={`mt-3 text-sm font-medium ${isEarned ? 'text-yellow-600' : 'text-gray-400'}`}>
                  +{achievement.points} points
                </div>
                {isEarned && (
                  <div className="mt-2">
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Earned
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <h3 className="text-xl font-bold flex items-center">
            <FaCrown className="mr-2" />
            Top Learners
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.user_id} 
                className={`flex items-center justify-between p-4 rounded-lg ${
                  entry.user_id === user.id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {entry.profiles?.first_name} {entry.profiles?.last_name}
                      {entry.user_id === user.id && <span className="text-blue-600 ml-2">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-600">{entry.total_points} points</p>
                  </div>
                </div>
                {index < 3 && (
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{challenge.title}</h3>
              <FaTarget className="text-blue-500" />
            </div>
            <p className="text-gray-600 mb-4">{challenge.description}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{challenge.progress}/{challenge.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <FaCalendarAlt className="inline mr-1" />
                Expires in {challenge.expires}
              </div>
              <div className="text-sm font-medium text-blue-600">
                <FaGift className="inline mr-1" />
                +{challenge.points} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'achievements', label: 'Achievements', icon: FaTrophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: FaUsers },
    { id: 'challenges', label: 'Challenges', icon: FaTarget }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading your achievements...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Achievement Center
        </h1>
        <p className="text-gray-600">
          Track your progress, earn rewards, and compete with fellow learners
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'challenges' && renderChallenges()}
      </div>
    </div>
  );
};

export default GamificationDashboard;