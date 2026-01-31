import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { 
  FaRocket, 
  FaEye, 
  FaRobot, 
  FaSearch, 
  FaChartLine, 
  FaCheckCircle, 
  FaBrain, 
  FaLightbulb,
  FaLock,
  FaCrown,
  FaFire,
  FaCrosshairs,
  FaStar
} from 'react-icons/fa';
import '../pages.css';

export default function AIVisibilityTracker() {
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to checkout with AI tracker product context
    navigate('/checkout?product=ai-visibility-tracker');
  };

  const features = [
    {
      icon: FaSearch,
      title: "AI Platform Monitoring",
      description: "Track your business visibility across ChatGPT, Perplexity, Claude, and other major AI platforms"
    },
    {
      icon: FaChartLine,
      title: "Competitor Intelligence",
      description: "See how competitors appear in AI searches and identify gaps in your market positioning"
    },
    {
      icon: FaBrain,
      title: "AI Content Suggestions", 
      description: "Get personalized recommendations for improving your AI discoverability"
    },
    {
      icon: FaCrosshairs,
      title: "Keyword Optimization",
      description: "Optimize your content for AI search algorithms with data-driven insights"
    },
    {
      icon: FaLock,
      title: "Brand Protection",
      description: "Monitor mentions and ensure accurate representation across AI platforms"
    },
    {
      icon: FaLightbulb,
      title: "Strategic Insights",
      description: "Understand how AI models interpret and recommend your business"
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small businesses getting started with AI visibility",
      features: [
        "5 AI platforms monitored",
        "Weekly visibility reports",
        "Basic competitor tracking",
        "Email alerts",
        "Standard support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional", 
      price: "$79",
      period: "/month",
      description: "Comprehensive AI visibility management for growing businesses",
      features: [
        "15+ AI platforms monitored",
        "Daily visibility reports",
        "Advanced competitor analysis",
        "Real-time alerts",
        "AI content optimization",
        "Priority support",
        "Custom keywords tracking"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month", 
      description: "Full-scale AI visibility solution for large organizations",
      features: [
        "All AI platforms monitored",
        "Real-time monitoring",
        "Full competitor intelligence",
        "White-label reports",
        "API access",
        "Dedicated account manager",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="home">
      <SEO 
        title="AI Visibility Tracker"
        description="Track how your business appears in AI chatbots like ChatGPT, Perplexity, and Gemini. The SEO for AI - monitor and boost your visibility."
        url="https://revenueripple.org/ai-visibility-tracker"
      />
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="hero-badge" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <FaFire style={{ marginRight: '0.5rem' }} />
            NEW: AI Visibility Tracker
          </div>
          
          <h1 className="hero-title">
            Are You Invisible to AI?
            <span style={{ display: 'block', color: '#2563eb' }}>
              Track Your Business Across ChatGPT, Perplexity & More
            </span>
          </h1>
          
          <p className="hero-subtitle">
            In 2025, customers find businesses through AI searches, not Google. 
            Our AI Visibility Tracker shows you exactly how AI models see your business 
            and gives you the tools to dominate this new search landscape.
          </p>
          
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={handleGetStarted}
              className="cta-button"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '50px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.25rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              <FaRocket /> Start Free 14-Day Trial
            </button>
            
            <button 
              onClick={() => setShowDemo(true)}
              style={{
                background: 'transparent',
                color: '#2563eb',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontWeight: 600,
                border: '2px solid #2563eb',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              <FaEye style={{ marginRight: '0.5rem' }} />
              Watch Demo
            </button>
          </div>
          
          <div style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.95rem' }}>
            ✅ No credit card required • ✅ Full access during trial • ✅ Cancel anytime
          </div>
        </div>
      </motion.section>

      {/* Problem Section */}
      <motion.section
        style={{ padding: '4rem 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem', color: '#1e293b' }}>
            The Problem: You're Missing 73% of Your Potential Customers
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>AI Is The New Google</h3>
              <p>73% of professionals now use AI for research and recommendations. If you're not visible to AI, you're invisible to most of your market.</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😰</div>
              <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>You're Flying Blind</h3>
              <p>Without visibility tracking, you have no idea how AI models perceive your business or why competitors are being recommended instead of you.</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
              <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Lost Revenue</h3>
              <p>Every day you're not optimized for AI search is revenue walking out the door to competitors who understand the new game.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        style={{ padding: '4rem 0' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', color: '#1e293b' }}>
            Master AI Visibility With These Powerful Features
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                style={{ 
                  background: 'white', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon style={{ 
                  fontSize: '2rem', 
                  color: '#2563eb', 
                  marginBottom: '1rem' 
                }} />
                <h3 style={{ 
                  color: '#1e293b', 
                  marginBottom: '1rem',
                  fontSize: '1.25rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        style={{ padding: '4rem 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
            Choose Your AI Visibility Plan
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }}>
            Start with a 14-day free trial. No credit card required.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                style={{ 
                  background: 'white', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  boxShadow: tier.popular ? '0 8px 25px rgba(37, 99, 235, 0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                  border: tier.popular ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    <FaCrown style={{ marginRight: '0.5rem' }} />
                    MOST POPULAR
                  </div>
                )}
                
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  {tier.name}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    fontSize: '3rem', 
                    fontWeight: 700, 
                    color: '#2563eb' 
                  }}>
                    {tier.price}
                  </span>
                  <span style={{ color: '#64748b' }}>{tier.period}</span>
                </div>
                
                <p style={{ 
                  color: '#64748b', 
                  marginBottom: '2rem',
                  lineHeight: 1.5
                }}>
                  {tier.description}
                </p>
                
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginBottom: '2rem',
                  textAlign: 'left'
                }}>
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      color: '#374151'
                    }}>
                      <FaCheckCircle style={{ 
                        color: '#10b981', 
                        marginRight: '0.75rem',
                        flexShrink: 0
                      }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={handleGetStarted}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: tier.popular ? '#2563eb' : 'transparent',
                    color: tier.popular ? 'white' : '#2563eb',
                    border: tier.popular ? 'none' : '2px solid #2563eb'
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            color: 'white'
          }}>
            Don't Let AI Leave You Behind
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Start tracking your AI visibility today and discover why your competitors 
            are being recommended instead of you.
          </p>
          
          <button 
            onClick={handleGetStarted}
            style={{
              background: 'white',
              color: '#2563eb',
              padding: '1.25rem 3rem',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1.2rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <FaRocket style={{ marginRight: '0.75rem' }} />
            Start Your Free Trial Now
          </button>
          
          <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.8)' }}>
            14-day free trial • No credit card required
          </div>
        </div>
      </motion.section>

      {/* Demo Modal */}
      {showDemo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onClick={() => setShowDemo(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90vw',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>AI Visibility Tracker Demo</h3>
            <p style={{ marginBottom: '2rem', color: '#64748b' }}>
              Watch how our platform reveals your AI visibility and competitor insights
            </p>
            <div style={{
              background: '#f8fafc',
              padding: '3rem 2rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <FaEye style={{ fontSize: '3rem', color: '#2563eb', marginBottom: '1rem' }} />
              <p>Demo video will be embedded here</p>
            </div>
            <button 
              onClick={() => setShowDemo(false)}
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}