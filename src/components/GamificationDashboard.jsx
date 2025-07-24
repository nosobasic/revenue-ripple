import React from 'react';

const GamificationDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Achievement Center
        </h1>
        <p className="text-gray-600">
          Coming soon: Track your progress, earn rewards, and compete with fellow learners
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold mb-2">Gamification Features</h3>
        <p className="text-gray-600">
          This dashboard will show your achievements, points, leaderboards, 
          and learning streaks to keep you motivated.
        </p>
      </div>
    </div>
  );
};

export default GamificationDashboard;