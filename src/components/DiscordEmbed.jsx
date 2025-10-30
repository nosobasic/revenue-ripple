import React from 'react';
import { FaDiscord } from 'react-icons/fa';

const DiscordEmbed = ({ className = "" }) => {
  const handleJoinDiscord = () => {
    window.open('https://discord.gg/q2b6BDtsyr', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`discord-embed ${className}`}>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <FaDiscord className="text-4xl mr-3" />
          <h3 className="text-2xl font-bold">Join Our Discord</h3>
        </div>
        
        <p className="text-center text-indigo-100 mb-6">
          Connect with fellow entrepreneurs, get real-time support, and share your wins in our active Discord community.
        </p>
        
        <div className="text-center">
          <button
            onClick={handleJoinDiscord}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <FaDiscord className="mr-2" />
            Join Discord Community
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm text-indigo-200">
          <p>🎯 Live discussions • 💡 Expert tips • 🚀 Success stories</p>
        </div>
      </div>
    </div>
  );
};

export default DiscordEmbed;
