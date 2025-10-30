import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const SubmitStory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    outcome: '',
    image_url: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to submit a story');
      return;
    }

    if (!formData.title.trim() || !formData.story.trim()) {
      alert('Please fill in the title and story fields');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Success story submitted! It will be reviewed before being published.');
        navigate('/community/success-stories');
      } else {
        alert(`Error: ${data.error || 'Failed to submit story'}`);
      }
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Failed to submit story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/community/success-stories')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Success Stories
          </button>
          
          <div className="flex items-center">
            <FaTrophy className="text-4xl text-yellow-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Share Your Success Story</h1>
              <p className="text-gray-600 mt-2">Inspire others by sharing your journey and achievements</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., How I Built My First $10K Business"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Story */}
              <div>
                <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Story *
                </label>
                <textarea
                  id="story"
                  name="story"
                  value={formData.story}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Tell us about your journey, challenges you faced, strategies you used, and what you learned along the way..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Share the details of your success story. What was your starting point? What challenges did you face? How did you overcome them?
                </p>
              </div>

              {/* Outcome */}
              <div>
                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-2">
                  Results & Outcomes
                </label>
                <textarea
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., Increased revenue by 300%, gained 1000+ followers, launched 3 new products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  What specific results did you achieve? Include numbers, metrics, or other measurable outcomes.
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add an image to make your story more engaging. Use a service like Imgur or Google Drive.
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Story Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be authentic and honest about your journey</li>
                <li>• Include specific details and actionable insights</li>
                <li>• Focus on what others can learn from your experience</li>
                <li>• Keep it professional and respectful</li>
                <li>• Stories will be reviewed before publication</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaTrophy className="mr-2" />
                    Submit Story
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitStory;
