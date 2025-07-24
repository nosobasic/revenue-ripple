import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AIPersonalizationEngine from './AIPersonalizationEngine';
import { FaRobot, FaChartLine, FaBrain, FaTarget, FaClock, FaTrophy } from 'react-icons/fa';

const SmartLearningDashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [learningInsights, setLearningInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const aiEngine = AIPersonalizationEngine();

  useEffect(() => {
    if (user) {
      loadPersonalizedDashboard();
    }
  }, [user]);

  const loadPersonalizedDashboard = async () => {
    setIsLoading(true);
    try {
      // Generate AI recommendations
      const recs = await aiEngine.generateRecommendations(user);
      setRecommendations(recs);

      // Get learning insights
      const insights = await aiEngine.analyzeLearningBehavior(user);
      setLearningInsights(insights);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'next_level': return <FaTarget className="text-blue-500" />;
      case 'skill_gap': return <FaBrain className="text-purple-500" />;
      case 'trending': return <FaChartLine className="text-green-500" />;
      default: return <FaRobot className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Personalizing your learning experience...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Personalized Learning Journey
        </h1>
        <p className="text-gray-600">
          AI-powered recommendations based on your learning patterns and goals
        </p>
      </div>

      {/* Learning Insights Overview */}
      {learningInsights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaClock className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg. Session Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(learningInsights.averageSessionTime)}m
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaChartLine className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(learningInsights.completionRate * 100)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaBrain className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Strong Areas</p>
                <p className="text-lg font-semibold text-gray-900">
                  {learningInsights.contentPreferences?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FaTrophy className="text-yellow-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Learning Streak</p>
                <p className="text-2xl font-bold text-gray-900">7 days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center mb-6">
          <FaRobot className="text-blue-500 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg capitalize">
                      {rec.course.replace('-', ' ')}
                    </h3>
                    <p className="text-gray-600 mt-1">{rec.reason}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 mr-4">
                        Confidence: {Math.round(rec.confidence * 100)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Start Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path Visualization */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Personalized Learning Path</h2>
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {recommendations.slice(0, 5).map((rec, index) => (
            <div key={index} className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-lg min-w-[200px] text-center">
                <h4 className="font-semibold capitalize">{rec.course.replace('-', ' ')}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.type}</p>
              </div>
              {index < 4 && (
                <div className="text-blue-400 text-2xl mx-2">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartLearningDashboard;