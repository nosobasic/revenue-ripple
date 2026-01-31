import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaComments, FaTrophy, FaDiscord, FaUsers, FaRocket } from 'react-icons/fa';
import SEO from '../components/SEO';
import DiscordEmbed from '../components/DiscordEmbed';

const Community = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const communityFeatures = [
    {
      id: 'forum',
      title: 'Community Forum',
      description: 'Ask questions, share solutions, and get peer feedback from fellow entrepreneurs.',
      icon: FaComments,
      link: '/community/forum',
      color: 'from-blue-500 to-blue-600',
      features: ['Ask coding questions', 'Share solutions', 'Get peer feedback', 'Vote on helpful answers']
    },
    {
      id: 'stories',
      title: 'Success Stories',
      description: 'Share your wins and get inspired by others who have built successful businesses.',
      icon: FaTrophy,
      link: '/community/success-stories',
      color: 'from-green-500 to-green-600',
      features: ['Share your wins', 'Get inspired', 'Case studies', 'Motivation']
    },
    {
      id: 'discord',
      title: 'Discord Community',
      description: 'Real-time chat, live discussions, and instant support from our active community.',
      icon: FaDiscord,
      link: 'https://discord.gg/q2b6BDtsyr',
      color: 'from-indigo-500 to-purple-600',
      features: ['Live discussions', 'Real-time support', 'Expert tips', 'Success stories'],
      external: true
    }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.external) {
      window.open(feature.link, '_blank', 'noopener,noreferrer');
    } else {
      // Internal navigation handled by Link component
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SEO 
        title="Community"
        description="Connect with fellow entrepreneurs, share wins, and get support in the Revenue Ripple community."
        url="https://revenueripple.org/community"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Revenue Ripple Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect, learn, and grow with fellow entrepreneurs who are building the future of digital business.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <FaUsers className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
            <p className="text-gray-600">Active Members</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <FaComments className="text-4xl text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">1,200+</h3>
            <p className="text-gray-600">Forum Discussions</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <FaTrophy className="text-4xl text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">50+</h3>
            <p className="text-gray-600">Success Stories</p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {communityFeatures.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`bg-gradient-to-r ${feature.color} p-6 text-white`}>
                <feature.icon className="text-4xl mb-4" />
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </div>
              
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                
                {feature.external ? (
                  <button
                    onClick={() => handleFeatureClick(feature)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Join Discord Community
                  </button>
                ) : (
                  <Link
                    to={feature.link}
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center"
                  >
                    Explore {feature.title}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Discord CTA Section */}
        <div className="mb-12">
          <DiscordEmbed />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/community/forum"
              className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FaComments className="text-3xl text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Start Discussion</h3>
              <p className="text-sm text-gray-600 text-center">Ask a question or share your experience</p>
            </Link>
            
            <Link
              to="/community/success-stories"
              className="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <FaTrophy className="text-3xl text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Share Success</h3>
              <p className="text-sm text-gray-600 text-center">Tell us about your wins and inspire others</p>
            </Link>
            
            <button
              onClick={() => window.open('https://discord.gg/q2b6BDtsyr', '_blank')}
              className="flex flex-col items-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
            >
              <FaDiscord className="text-3xl text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Join Discord</h3>
              <p className="text-sm text-gray-600 text-center">Connect in real-time with the community</p>
            </button>
            
            <Link
              to="/community/submit-story"
              className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              <FaRocket className="text-3xl text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Submit Story</h3>
              <p className="text-sm text-gray-600 text-center">Share your journey and help others</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
