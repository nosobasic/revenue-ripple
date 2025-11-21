import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaPlus, FaStar, FaCalendar, FaUser, FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const SuccessStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeatured, setShowFeatured] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [showFeatured]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        featured: showFeatured.toString()
      });

      const response = await fetch(`/api/success-stories?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setStories(data.stories || []);
      } else {
        console.error('Error fetching stories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Success Stories</h1>
              <p className="text-gray-600">Be inspired by the achievements of our community members</p>
            </div>
            <Link
              to="/community/submit-story"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Share Your Story
            </Link>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-2" />
                <span className="font-medium text-gray-900">Featured Stories Only</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFeatured}
                  onChange={(e) => setShowFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaTrophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showFeatured ? 'No featured stories yet' : 'No success stories yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {showFeatured 
                ? 'Check back later for featured success stories.'
                : 'Be the first to share your success story!'
              }
            </p>
            {!showFeatured && (
              <Link
                to="/community/submit-story"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Share Your Story
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {story.image_url && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${story.users?.name || 'User'}&background=10b981&color=fff`}
                        alt={story.users?.name || 'User'}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{story.users?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{formatDate(story.created_at)}</p>
                      </div>
                    </div>
                    {story.is_featured && (
                      <FaStar className="text-yellow-500" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {story.story}
                  </p>

                  {story.outcome && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Outcome:</h4>
                      <p className="text-sm text-green-700">{story.outcome}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaHeart className="mr-1" />
                      <span>Inspiring</span>
                    </div>
                    <Link
                      to={`/community/success-stories/${story.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-center text-white">
          <FaTrophy className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Share Your Success</h2>
          <p className="text-lg mb-6 opacity-90">
            Your story could inspire others to achieve their goals. Share your journey and help build our community.
          </p>
          <Link
            to="/community/submit-story"
            className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <FaPlus className="mr-2" />
            Submit Your Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
