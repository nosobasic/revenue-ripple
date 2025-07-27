import React, { useState, useEffect } from 'react';
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
  FaHeadset,
  FaFire,
  FaCrown,
  FaBolt,
  FaEye,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';

const CommandCenter = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Simulate spots being taken
    const interval = setInterval(() => {
      setSpotsLeft(prev => Math.max(prev - Math.floor(Math.random() * 3), 67));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleJoinNow = () => {
    // TODO: Implement checkout logic
    alert('Command Center checkout coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <Navbar />
      
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 text-center font-bold animate-pulse">
        <FaFire className="inline mr-2" />
        🔥 LIMITED TIME: Only {spotsLeft} Founding Member Spots Left! 🔥
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold mb-6 animate-bounce">
              <FaCrown className="inline mr-2" />
              FOUNDING MEMBER ACCESS
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Fix What's Broken. Launch With Confidence.
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-300">
              AI-Powered DevOps Dashboard for Online Business Owners
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Sick of broken automations, email flows that ghost leads, and funnels that flop with no warning?
              <br />
              <span className="text-blue-400 font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                This is the all-in-one control panel built by an entrepreneur who got tired of guessing.
              </span>
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => setShowVideo(true)}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-blue-500 hover:border-blue-400"
            >
              <FaPlay className="group-hover:animate-pulse" /> Watch Demo
            </button>
            <div className="relative">
              <button 
                onClick={handleJoinNow}
                className="group flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black px-12 py-6 rounded-xl text-xl font-black transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-3xl border-4 border-yellow-300 hover:border-yellow-200 animate-pulse"
              >
                <FaRocket className="group-hover:animate-bounce" /> 
                <span className="flex flex-col">
                  <span>Join Now</span>
                  <span className="text-sm">$997 Early Access</span>
                </span>
              </button>
              <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                HOT
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-bold animate-pulse border-2 border-red-400">
              <FaExclamationTriangle className="inline mr-2" />
              Only {spotsLeft} spots left
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2 bg-green-900 bg-opacity-30 px-4 py-2 rounded-full border border-green-500">
              <FaCheckCircle className="text-green-400 animate-pulse" />
              <span className="font-semibold">30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-900 bg-opacity-30 px-4 py-2 rounded-full border border-blue-500">
              <FaUsers className="text-blue-400 animate-pulse" />
              <span className="font-semibold">Founding Member Access</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-900 bg-opacity-30 px-4 py-2 rounded-full border border-purple-500">
              <FaHeadset className="text-purple-400 animate-pulse" />
              <span className="font-semibold">Setup Support Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-bold mb-6">
              <FaBolt className="inline mr-2" />
              POWERFUL FEATURES
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              What You Get
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to take control of your business operations and never worry about broken automations again.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Monitoring */}
            <div className="group bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <div className="text-blue-400 text-5xl mb-6 group-hover:animate-pulse">
                <FaBrain />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI-Powered Monitoring</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your funnels, emails, webhooks, and automations—tracked in real-time. Get GPT summaries like:
              </p>
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-xl border-l-4 border-blue-400 shadow-lg">
                <p className="text-sm text-blue-100 italic leading-relaxed">
                  "Your webinar flow hasn't triggered since July 18th. Suggest checking Zap #4."
                </p>
              </div>
            </div>

            {/* Built-In Agent Toolkit */}
            <div className="group bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-2xl border-2 border-gray-600 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              <div className="text-purple-400 text-5xl mb-6 group-hover:animate-pulse">
                <FaTools />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Built-In Agent Toolkit</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                3+ ready-to-use AI Agents that work 24/7:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3 bg-purple-900 bg-opacity-30 p-3 rounded-lg border border-purple-500">
                  <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                  <span className="font-semibold">Broken Flow Detector</span>
                </li>
                <li className="flex items-center gap-3 bg-purple-900 bg-opacity-30 p-3 rounded-lg border border-purple-500">
                  <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                  <span className="font-semibold">Lead Falloff Catcher</span>
                </li>
                <li className="flex items-center gap-3 bg-purple-900 bg-opacity-30 p-3 rounded-lg border border-purple-500">
                  <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                  <span className="font-semibold">Failed Webhook Auto-Retry</span>
                </li>
              </ul>
            </div>

            {/* Funnel Validator */}
            <div className="group bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-2xl border-2 border-gray-600 hover:border-green-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
              <div className="text-green-400 text-5xl mb-6 group-hover:animate-pulse">
                <FaFlask />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Funnel Validator</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Test your funnel before launch. Know what's missing, broken, or misfiring before you waste another ad dollar.
              </p>
              <div className="bg-gradient-to-r from-green-900 to-green-800 p-4 rounded-xl border border-green-500">
                <p className="text-green-100 text-sm font-semibold">
                  🎯 Save thousands on failed launches
                </p>
              </div>
            </div>

            {/* DFY Setup */}
            <div className="group bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-2xl border-2 border-gray-600 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25">
              <div className="text-yellow-400 text-5xl mb-6 group-hover:animate-pulse">
                <FaHeadset />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Optional DFY Setup</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We'll help you set it up + audit your funnel stack for max impact.
              </p>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold inline-block animate-pulse">
                <FaCrown className="inline mr-1" />
                Included in Premium
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-bold mb-6 animate-pulse">
              <FaGift className="inline mr-2" />
              FREE BONUSES
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              🧲 Bonuses
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These bonuses alone are worth over $2,000. Yours FREE when you join today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 border-2 border-blue-500 hover:border-blue-400">
              <div className="text-6xl mb-6 group-hover:animate-bounce">🎓</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Revenue Ripple Lite</h3>
              <p className="text-blue-100 mb-4">
                Marketing automations crash course
              </p>
              <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg">
                <p className="text-blue-200 text-sm font-semibold">Value: $497</p>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 border-2 border-purple-500 hover:border-purple-400">
              <div className="text-6xl mb-6 group-hover:animate-bounce">🧠</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Agent Templates</h3>
              <p className="text-purple-100 mb-4">
                Plug-and-play GPT workflows for business ops
              </p>
              <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
                <p className="text-purple-200 text-sm font-semibold">Value: $997</p>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/50 border-2 border-green-500 hover:border-green-400">
              <div className="text-6xl mb-6 group-hover:animate-bounce">💬</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Slack-Style Daily Digest</h3>
              <p className="text-green-100 mb-4">
                Get an update every morning on what's changed in your stack
              </p>
              <div className="bg-green-900 bg-opacity-50 p-3 rounded-lg">
                <p className="text-green-200 text-sm font-semibold">Value: $297</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-2xl inline-block font-bold text-xl animate-pulse">
              <FaGift className="inline mr-2" />
              Total Bonus Value: $1,791
            </div>
          </div>
        </div>
      </section>

      {/* Limited Offer Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6 rounded-2xl mb-8 animate-pulse">
            <FaExclamationTriangle className="inline mr-2" />
            <span className="font-bold text-xl">LIMITED TIME OFFER</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🔒 Limited Offer
          </h2>
          <p className="text-2xl mb-12 text-purple-200">
            Only {spotsLeft} founding members get this deal:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="group bg-white bg-opacity-10 p-8 rounded-2xl border-2 border-white border-opacity-30 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:animate-bounce">✅</div>
              <h3 className="text-xl font-bold mb-3 text-white">Lifetime Premium Access</h3>
              <p className="text-purple-200">Never pay monthly fees again</p>
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold mt-3 inline-block">
                SAVE $2,400/year
              </div>
            </div>
            <div className="group bg-white bg-opacity-10 p-8 rounded-2xl border-2 border-white border-opacity-30 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:animate-bounce">✅</div>
              <h3 className="text-xl font-bold mb-3 text-white">3 AI Agents Pre-Installed</h3>
              <p className="text-purple-200">Ready to use immediately</p>
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold mt-3 inline-block">
                VALUE $1,500
              </div>
            </div>
            <div className="group bg-white bg-opacity-10 p-8 rounded-2xl border-2 border-white border-opacity-30 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:animate-bounce">✅</div>
              <h3 className="text-xl font-bold mb-3 text-white">Setup Support + Onboarding</h3>
              <p className="text-purple-200">We'll get you up and running</p>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mt-3 inline-block">
                VALUE $500
              </div>
            </div>
            <div className="group bg-white bg-opacity-10 p-8 rounded-2xl border-2 border-white border-opacity-30 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4 group-hover:animate-bounce">✅</div>
              <h3 className="text-xl font-bold mb-3 text-white">Future Updates Locked In</h3>
              <p className="text-purple-200">All new features included</p>
              <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold mt-3 inline-block">
                LIFETIME VALUE
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-6 rounded-2xl mb-8">
            <h3 className="text-2xl font-bold mb-2">Total Value: $6,791</h3>
            <p className="text-lg">Your Price: $997</p>
            <p className="text-sm opacity-75">You Save: $5,794 (85% OFF)</p>
          </div>
          
          <button 
            onClick={handleJoinNow}
            className="group bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black px-16 py-8 rounded-2xl text-3xl font-black transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-3xl flex items-center gap-4 mx-auto border-4 border-yellow-300 hover:border-yellow-200 animate-pulse"
          >
            <FaRocket className="group-hover:animate-bounce text-4xl" /> 
            <span className="flex flex-col">
              <span>Join Now for $997</span>
              <span className="text-sm opacity-75">Limited Time Offer</span>
            </span>
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