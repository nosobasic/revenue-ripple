import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';
import { 
  FaRocket, 
  FaBrain, 
  FaTools, 
  FaFlask, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaUsers, 
  FaQuoteLeft,
  FaPlay,
  FaArrowRight,
  FaStar,
  FaClock,
  FaGift,
  FaHeadset
} from 'react-icons/fa';

const CommandCenter = () => {
  const [showVideo, setShowVideo] = useState(false);

  const handleJoinNow = () => {
    // TODO: Implement checkout logic
    alert('Command Center checkout coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Fix What's Broken. Launch With Confidence.
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-300">
              AI-Powered DevOps Dashboard for Online Business Owners
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Sick of broken automations, email flows that ghost leads, and funnels that flop with no warning?
              <br />
              <span className="text-blue-400 font-semibold">This is the all-in-one control panel built by an entrepreneur who got tired of guessing.</span>
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FaPlay /> Watch Demo
            </button>
            <button 
              onClick={handleJoinNow}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FaRocket /> Join Now – $997 Early Access
            </button>
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
              Limited to 100 spots
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-blue-400" />
              <span>Founding Member Access</span>
            </div>
            <div className="flex items-center gap-2">
              <FaHeadset className="text-purple-400" />
              <span>Setup Support Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            What You Get
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Monitoring */}
            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="text-blue-400 text-4xl mb-4">
                <FaBrain />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Monitoring</h3>
              <p className="text-gray-300 mb-4">
                Your funnels, emails, webhooks, and automations—tracked in real-time. Get GPT summaries like:
              </p>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-gray-300 italic">
                  "Your webinar flow hasn't triggered since July 18th. Suggest checking Zap #4."
                </p>
              </div>
            </div>

            {/* Built-In Agent Toolkit */}
            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="text-purple-400 text-4xl mb-4">
                <FaTools />
              </div>
              <h3 className="text-2xl font-bold mb-4">Built-In Agent Toolkit</h3>
              <p className="text-gray-300 mb-4">
                3+ ready-to-use AI Agents:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400 text-sm" />
                  Broken Flow Detector
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400 text-sm" />
                  Lead Falloff Catcher
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400 text-sm" />
                  Failed Webhook Auto-Retry
                </li>
              </ul>
            </div>

            {/* Funnel Validator */}
            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="text-green-400 text-4xl mb-4">
                <FaFlask />
              </div>
              <h3 className="text-2xl font-bold mb-4">Funnel Validator</h3>
              <p className="text-gray-300 mb-4">
                Test your funnel before launch. Know what's missing, broken, or misfiring before you waste another ad dollar.
              </p>
            </div>

            {/* DFY Setup */}
            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="text-yellow-400 text-4xl mb-4">
                <FaHeadset />
              </div>
              <h3 className="text-2xl font-bold mb-4">Optional DFY Setup</h3>
              <p className="text-gray-300 mb-4">
                We'll help you set it up + audit your funnel stack for max impact.
              </p>
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold inline-block">
                Included in Premium
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            🧲 Bonuses
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-4">Revenue Ripple Lite</h3>
              <p className="text-blue-100">
                Marketing automations crash course
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-xl text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold mb-4">Agent Templates</h3>
              <p className="text-purple-100">
                Plug-and-play GPT workflows for business ops
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-xl text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-4">Slack-Style Daily Digest</h3>
              <p className="text-green-100">
                Get an update every morning on what's changed in your stack
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limited Offer Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            🔒 Limited Offer
          </h2>
          <p className="text-2xl mb-12 text-purple-200">
            Only 100 founding members get this deal:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Lifetime Premium Access</h3>
              <p className="text-purple-200">Never pay monthly fees again</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">3 AI Agents Pre-Installed</h3>
              <p className="text-purple-200">Ready to use immediately</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Setup Support + Onboarding</h3>
              <p className="text-purple-200">We'll get you up and running</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Future Updates Locked In</h3>
              <p className="text-purple-200">All new features included</p>
            </div>
          </div>
          
          <button 
            onClick={handleJoinNow}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-12 py-6 rounded-lg text-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <FaRocket /> Join Now for $997
          </button>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-800 p-12 rounded-xl">
            <h2 className="text-4xl font-bold mb-6">
              🔁 30-Day "I Got You" Guarantee
            </h2>
            <p className="text-2xl text-green-100">
              If you don't feel 100% more in control of your ops and funnels in 30 days, we'll refund you. Period.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            🤝 Who It's For
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-bold mb-4">Online Business Owners</h3>
              <p className="text-gray-300">
                Course creators, and marketers who need reliable automation
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4">Solo Founders</h3>
              <p className="text-gray-300">
                Juggling too many tools and need everything in one place
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-2xl font-bold mb-4">SaaS Developers</h3>
              <p className="text-gray-300">
                Who hate getting blindsided by broken integrations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            💬 What Founders Are Saying
          </h2>
          
          <div className="bg-gray-700 p-12 rounded-xl border border-gray-600">
            <div className="flex items-start gap-4">
              <FaQuoteLeft className="text-4xl text-blue-400 mt-2" />
              <div>
                <p className="text-2xl text-gray-300 mb-6 italic">
                  "This dashboard told me I had 3 broken flows… and I had no idea. I fixed it in 30 minutes and saved my launch."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
                    JD
                  </div>
                  <div>
                    <p className="font-bold text-lg">John Doe</p>
                    <p className="text-gray-400">Early Access Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Take Control?
          </h2>
          <p className="text-2xl mb-12 text-gray-300">
            Join the 100 founding members and never worry about broken automations again.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
            <button 
              onClick={handleJoinNow}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-12 py-6 rounded-lg text-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <FaRocket /> Join Now – $997 Early Access
            </button>
            <div className="bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold">
              Only 100 spots available
            </div>
          </div>
          
          <p className="text-gray-400">
            🔒 Secure checkout • 30-day guarantee • Lifetime access
          </p>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Command Center Demo</h3>
              <button 
                onClick={() => setShowVideo(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FaPlay className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Demo video coming soon!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenter; 