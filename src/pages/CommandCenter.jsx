import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';
import './CommandCenter.css';
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
    <div className="command-center">
      {/* Animated Background Elements */}
      <div className="animated-background">
        <div className="bg-element bg-purple"></div>
        <div className="bg-element bg-blue"></div>
        <div className="bg-element bg-pink"></div>
      </div>

      <Navbar />
      
      {/* Urgency Banner */}
      <div className="urgency-banner">
        <FaFire className="fire-icon" />
        🔥 LIMITED TIME: Only {spotsLeft} Founding Member Spots Left! 🔥
      </div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
            <div className="founding-member-badge">
              <FaCrown className="crown-icon" />
              FOUNDING MEMBER ACCESS
            </div>
            <h1 className="hero-title">
              Fix What's Broken. Launch With Confidence.
            </h1>
            <h2 className="hero-subtitle">
              AI-Powered DevOps Dashboard for Online Business Owners
            </h2>
            <p className="hero-description">
              Sick of broken automations, email flows that ghost leads, and funnels that flop with no warning?
              <br />
              <span className="highlight-text">
                This is the all-in-one control panel built by an entrepreneur who got tired of guessing.
              </span>
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div className="hero-cta">
            <button 
              onClick={() => setShowVideo(true)}
              className="demo-button"
            >
              <FaPlay className="play-icon" /> Watch Demo
            </button>
            <div className="join-button-container">
              <button 
                onClick={handleJoinNow}
                className="join-button"
              >
                <FaRocket className="rocket-icon" /> 
                <span className="join-text">
                  <span>Join Now</span>
                  <span className="price">$997 Early Access</span>
                </span>
              </button>
              <div className="hot-badge">
                HOT
              </div>
            </div>
            <div className="spots-left-badge">
              <FaExclamationTriangle className="warning-icon" />
              Only {spotsLeft} spots left
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item guarantee">
              <FaCheckCircle className="check-icon" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="trust-item access">
              <FaUsers className="users-icon" />
              <span>Founding Member Access</span>
            </div>
            <div className="trust-item support">
              <FaHeadset className="headset-icon" />
              <span>Setup Support Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <FaBolt className="bolt-icon" />
              POWERFUL FEATURES
            </div>
            <h2 className="section-title">
              What You Get
            </h2>
            <p className="section-description">
              Everything you need to take control of your business operations and never worry about broken automations again.
            </p>
          </div>
          
          <div className="features-grid">
            {/* AI-Powered Monitoring */}
            <div className="feature-card monitoring">
              <div className="feature-icon">
                <FaBrain />
              </div>
              <h3 className="feature-title">AI-Powered Monitoring</h3>
              <p className="feature-description">
                Your funnels, emails, webhooks, and automations—tracked in real-time. Get GPT summaries like:
              </p>
              <div className="feature-example">
                <p className="example-text">
                  "Your webinar flow hasn't triggered since July 18th. Suggest checking Zap #4."
                </p>
              </div>
            </div>

            {/* Built-In Agent Toolkit */}
            <div className="feature-card toolkit">
              <div className="feature-icon">
                <FaTools />
              </div>
              <h3 className="feature-title">Built-In Agent Toolkit</h3>
              <p className="feature-description">
                3+ ready-to-use AI Agents that work 24/7:
              </p>
              <ul className="agent-list">
                <li className="agent-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Broken Flow Detector</span>
                </li>
                <li className="agent-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Lead Falloff Catcher</span>
                </li>
                <li className="agent-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Failed Webhook Auto-Retry</span>
                </li>
              </ul>
            </div>

            {/* Funnel Validator */}
            <div className="feature-card validator">
              <div className="feature-icon">
                <FaFlask />
              </div>
              <h3 className="feature-title">Funnel Validator</h3>
              <p className="feature-description">
                Test your funnel before launch. Know what's missing, broken, or misfiring before you waste another ad dollar.
              </p>
              <div className="feature-benefit">
                <p className="benefit-text">
                  🎯 Save thousands on failed launches
                </p>
              </div>
            </div>

            {/* DFY Setup */}
            <div className="feature-card setup">
              <div className="feature-icon">
                <FaHeadset />
              </div>
              <h3 className="feature-title">Optional DFY Setup</h3>
              <p className="feature-description">
                We'll help you set it up + audit your funnel stack for max impact.
              </p>
              <div className="premium-badge">
                <FaCrown className="crown-icon" />
                Included in Premium
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="bonuses-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge bonuses">
              <FaGift className="gift-icon" />
              FREE BONUSES
            </div>
            <h2 className="section-title">
              🧲 Bonuses
            </h2>
            <p className="section-description">
              These bonuses alone are worth over $2,000. Yours FREE when you join today.
            </p>
          </div>
          
          <div className="bonuses-grid">
            <div className="bonus-card lite">
              <div className="bonus-emoji">🎓</div>
              <h3 className="bonus-title">Revenue Ripple Lite</h3>
              <p className="bonus-description">
                Marketing automations crash course
              </p>
              <div className="bonus-value">
                <p>Value: $497</p>
              </div>
            </div>
            
            <div className="bonus-card templates">
              <div className="bonus-emoji">🧠</div>
              <h3 className="bonus-title">Agent Templates</h3>
              <p className="bonus-description">
                Plug-and-play GPT workflows for business ops
              </p>
              <div className="bonus-value">
                <p>Value: $997</p>
              </div>
            </div>
            
            <div className="bonus-card digest">
              <div className="bonus-emoji">💬</div>
              <h3 className="bonus-title">Slack-Style Daily Digest</h3>
              <p className="bonus-description">
                Get an update every morning on what's changed in your stack
              </p>
              <div className="bonus-value">
                <p>Value: $297</p>
              </div>
            </div>
          </div>
          
          <div className="total-bonus">
            <FaGift className="gift-icon" />
            Total Bonus Value: $1,791
          </div>
        </div>
      </section>

      {/* Limited Offer Section */}
      <section className="limited-offer-section">
        <div className="container">
          <div className="limited-banner">
            <FaExclamationTriangle className="warning-icon" />
            <span>LIMITED TIME OFFER</span>
          </div>
          <h2 className="limited-title">
            🔒 Limited Offer
          </h2>
          <p className="limited-description">
            Only {spotsLeft} founding members get this deal:
          </p>
          
          <div className="offer-grid">
            <div className="offer-item">
              <div className="offer-emoji">✅</div>
              <h3 className="offer-title">Lifetime Premium Access</h3>
              <p className="offer-description">Never pay monthly fees again</p>
              <div className="offer-savings">
                SAVE $2,400/year
              </div>
            </div>
            <div className="offer-item">
              <div className="offer-emoji">✅</div>
              <h3 className="offer-title">3 AI Agents Pre-Installed</h3>
              <p className="offer-description">Ready to use immediately</p>
              <div className="offer-value">
                VALUE $1,500
              </div>
            </div>
            <div className="offer-item">
              <div className="offer-emoji">✅</div>
              <h3 className="offer-title">Setup Support + Onboarding</h3>
              <p className="offer-description">We'll get you up and running</p>
              <div className="offer-value">
                VALUE $500
              </div>
            </div>
            <div className="offer-item">
              <div className="offer-emoji">✅</div>
              <h3 className="offer-title">Future Updates Locked In</h3>
              <p className="offer-description">All new features included</p>
              <div className="offer-value">
                LIFETIME VALUE
              </div>
            </div>
          </div>
          
          <div className="pricing-card">
            <h3 className="pricing-title">Total Value: $6,791</h3>
            <p className="pricing-price">Your Price: $997</p>
            <p className="pricing-savings">You Save: $5,794 (85% OFF)</p>
          </div>
          
          <button 
            onClick={handleJoinNow}
            className="final-cta-button"
          >
            <FaRocket className="rocket-icon" /> 
            <span className="cta-text">
              <span>Join Now for $997</span>
              <span className="cta-subtext">Limited Time Offer</span>
            </span>
          </button>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="guarantee-section">
        <div className="container">
          <div className="guarantee-card">
            <h2 className="guarantee-title">
              🔁 30-Day "I Got You" Guarantee
            </h2>
            <p className="guarantee-text">
              If you don't feel 100% more in control of your ops and funnels in 30 days, we'll refund you. Period.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="audience-section">
        <div className="container">
          <h2 className="audience-title">
            🤝 Who It's For
          </h2>
          
          <div className="audience-grid">
            <div className="audience-item">
              <div className="audience-emoji">👨‍💼</div>
              <h3 className="audience-name">Online Business Owners</h3>
              <p className="audience-description">
                Course creators, and marketers who need reliable automation
              </p>
            </div>
            <div className="audience-item">
              <div className="audience-emoji">🚀</div>
              <h3 className="audience-name">Solo Founders</h3>
              <p className="audience-description">
                Juggling too many tools and need everything in one place
              </p>
            </div>
            <div className="audience-item">
              <div className="audience-emoji">💻</div>
              <h3 className="audience-name">SaaS Developers</h3>
              <p className="audience-description">
                Who hate getting blindsided by broken integrations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="testimonials-title">
            💬 What Founders Are Saying
          </h2>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <FaQuoteLeft className="quote-icon" />
              <div className="testimonial-text">
                <p className="testimonial-quote">
                  "This dashboard told me I had 3 broken flows… and I had no idea. I fixed it in 30 minutes and saved my launch."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    JD
                  </div>
                  <div className="author-info">
                    <p className="author-name">John Doe</p>
                    <p className="author-title">Early Access Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2 className="final-cta-title">
            Ready to Take Control?
          </h2>
          <p className="final-cta-description">
            Join the 100 founding members and never worry about broken automations again.
          </p>
          
          <div className="final-cta-buttons">
            <button 
              onClick={handleJoinNow}
              className="final-join-button"
            >
              <FaRocket /> Join Now – $997 Early Access
            </button>
            <div className="spots-remaining">
              Only 100 spots available
            </div>
          </div>
          
          <p className="final-cta-footer">
            🔒 Secure checkout • 30-day guarantee • Lifetime access
          </p>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Command Center Demo</h3>
              <button 
                onClick={() => setShowVideo(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="video-placeholder">
              <div className="video-content">
                <FaPlay className="play-placeholder" />
                <p className="video-text">Demo video coming soon!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenter; 