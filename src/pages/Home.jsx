import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import { 
  FaRocket, 
  FaChartLine, 
  FaUsers, 
  FaHeadset, 
  FaCheckCircle, 
  FaStar, 
  FaGraduationCap, 
  FaHandshake, 
  FaBook, 
  FaQuoteLeft, 
  FaRobot, 
  FaBrain, 
  FaCode,
  FaEye,
  FaTools,
  FaShieldAlt,
  FaDollarSign,
  FaArrowRight,
  FaCrown,
  FaPlay,
  FaFire
} from 'react-icons/fa';
import { MdDashboard, MdInventory, MdPeople } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const [activeProductTab, setActiveProductTab] = useState('education');
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [userIntent, setUserIntent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Debug environment variables
    console.log('Environment Variables:', {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
    });
  }, []);

  const productTabs = [
    {
      id: 'education',
      name: 'Marketing Education',
      icon: FaGraduationCap,
      price: '$47/month',
      description: 'Master marketing with our comprehensive training platform',
      features: [
        '46 comprehensive marketing tutorials',
        '25 expert-led video courses',
        'Continuously updated content',
        'Members-only affiliate program',
        'Dedicated support team'
      ],
      cta: 'Start Learning',
      link: '/checkout',
      badge: 'CORE PLATFORM'
    },
    {
      id: 'ai-tracker',
      name: 'AI Visibility Tracker',
      icon: FaEye,
      price: 'From $29/month',
      description: 'Track your business visibility across AI platforms like ChatGPT',
      features: [
        'Monitor 15+ AI platforms',
        'Competitor intelligence reports',
        'AI content optimization',
        'Real-time visibility alerts',
        'Strategic positioning insights'
      ],
      cta: 'Start Free Trial',
      link: '/ai-visibility-tracker',
      badge: 'NEW LAUNCH'
    },
    {
      id: 'command-center',
      name: 'Command Center',
      icon: FaTools,
      price: 'Starting at $97/month',
      description: 'AI-powered DevOps dashboard for online business owners',
      features: [
        'Monitor all business systems',
        'Automated issue detection',
        'Performance optimization',
        'Revenue tracking dashboard',
        'Business automation tools'
      ],
      cta: 'View Demo',
      link: '/command-center',
      badge: 'PREMIUM TOOL'
    },
    {
      id: 'earn',
      name: 'Affiliate & Reseller',
      icon: FaDollarSign,
      price: '100% Commissions',
      description: 'Earn monthly recurring income promoting our products',
      features: [
        '$47/month per referral',
        '100% commission on sales',
        'Professional marketing materials',
        'Monthly PayPal payments',
        'Comprehensive training included'
      ],
      cta: 'Start Earning',
      link: '/special',
      badge: 'EARN MONEY'
    }
  ];

  const getStartedPaths = [
    {
      goal: 'Learn Marketing',
      description: 'Master digital marketing fundamentals',
      icon: FaGraduationCap,
      color: '#2563eb',
      link: '/checkout',
      recommended: 'education'
    },
    {
      goal: 'Track AI Visibility',
      description: 'Monitor your business across AI platforms',
      icon: FaEye,
      color: '#7c3aed',
      link: '/ai-visibility-tracker',
      recommended: 'ai-tracker'
    },
    {
      goal: 'Automate Business',
      description: 'Set up business monitoring and automation',
      icon: FaTools,
      color: '#059669',
      link: '/command-center',
      recommended: 'command-center'
    },
    {
      goal: 'Earn Income',
      description: 'Start earning with our affiliate program',
      icon: FaDollarSign,
      color: '#dc2626',
      link: '/special',
      recommended: 'earn'
    }
  ];

  const activeProduct = productTabs.find(p => p.id === activeProductTab);

  return (
    <div className="home">
      <ReferralTracker />
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.div 
            className="hero-badge"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '2rem',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaFire style={{ marginRight: '0.5rem' }} />
            🚀 COMPLETE BUSINESS GROWTH ECOSYSTEM
          </motion.div>
          
          <h1 className="hero-title">
            Everything You Need to
            <span style={{ display: 'block', color: '#2563eb' }}>
              Grow Your Business Online
            </span>
          </h1>
          
          <p className="hero-subtitle">
            From marketing education to AI visibility tracking, business automation to earning opportunities - 
            we've built the complete toolkit for modern entrepreneurs.
          </p>
          
          {!user && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                color: '#1e293b', 
                fontSize: '1.4rem', 
                marginBottom: '1.5rem',
                fontWeight: 600
              }}>
                What's your main goal right now?
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {getStartedPaths.map((path, index) => (
                  <motion.div
                    key={path.goal}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={path.link}
                      onClick={() => setActiveProductTab(path.recommended)}
                      style={{
                        display: 'block',
                        padding: '1.5rem',
                        border: `2px solid ${path.color}`,
                        borderRadius: '12px',
                        textDecoration: 'none',
                        background: 'white',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <path.icon style={{ 
                        fontSize: '2rem', 
                        color: path.color, 
                        marginBottom: '0.75rem' 
                      }} />
                      <h4 style={{ 
                        color: '#1e293b', 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        marginBottom: '0.5rem' 
                      }}>
                        {path.goal}
                      </h4>
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '0.9rem', 
                        marginBottom: 0 
                      }}>
                        {path.description}
                      </p>
                      <div style={{
                        marginTop: '0.75rem',
                        color: path.color,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        Get Started <FaArrowRight />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Products Showcase Section */}
      <motion.section
        style={{ padding: '4rem 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            color: '#1e293b' 
          }}>
            Choose Your Growth Path
          </h2>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '1.2rem', 
            color: '#64748b', 
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Each product is designed to solve specific business challenges. 
            Start with one or combine them for maximum growth.
          </p>
          
          {/* Product Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '3rem',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {productTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProductTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '50px',
                  background: activeProductTab === tab.id ? '#2563eb' : 'white',
                  color: activeProductTab === tab.id ? 'white' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <tab.icon />
                {tab.name}
              </button>
            ))}
          </div>
          
          {/* Active Product Details */}
          <motion.div
            key={activeProductTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              maxWidth: '900px',
              margin: '0 auto'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '3rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  background: '#f3f4f6',
                  color: '#374151',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}>
                  {activeProduct.badge}
                </div>
                
                <h3 style={{
                  fontSize: '2rem',
                  color: '#1e293b',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <activeProduct.icon style={{ color: '#2563eb' }} />
                  {activeProduct.name}
                </h3>
                
                <p style={{
                  fontSize: '1.1rem',
                  color: '#64748b',
                  marginBottom: '2rem',
                  lineHeight: 1.6
                }}>
                  {activeProduct.description}
                </p>
                
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                  {activeProduct.features.map((feature, index) => (
                    <li key={index} style={{
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
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  marginBottom: '1rem'
                }}>
                  {activeProduct.price}
                </div>
                
                <Link
                  to={activeProduct.link}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  <FaRocket />
                  {activeProduct.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Success Stories Section */}
      <motion.section
        style={{ padding: '4rem 0' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            color: '#1e293b' 
          }}>
            Join 10,000+ Successful Entrepreneurs
          </h2>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '1.1rem', 
            color: '#64748b', 
            marginBottom: '3rem' 
          }}>
            See how our community is transforming their businesses
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                name: "Sarah Johnson",
                role: "Digital Marketing Consultant",
                image: "/assets/images/images/profile-pic1.png",
                quote: "Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates.",
                product: "Marketing Education"
              },
              {
                name: "David Thompson", 
                role: "Affiliate Marketer",
                image: "/assets/images/images/profile-pic4.png",
                quote: "The affiliate program is a game-changer! Not only am I learning valuable skills, but I'm also earning while implementing what I learn.",
                product: "Affiliate Program"
              },
              {
                name: "Alex Foster",
                role: "Business Owner",
                image: "/assets/images/images/profile-pic8.png",
                quote: "The Command Center helps me monitor everything in one place. I caught a major issue before it cost me thousands in lost revenue.",
                product: "Command Center"
              }
            ].map((testimonial, index) => (
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
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} style={{ color: '#fbbf24', marginRight: '0.25rem' }} />
                  ))}
                </div>
                
                <p style={{
                  color: '#374151',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.quote}"
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <h4 style={{
                      color: '#1e293b',
                      fontSize: '1rem',
                      fontWeight: 600,
                      marginBottom: '0.25rem'
                    }}>
                      {testimonial.name}
                    </h4>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem'
                    }}>
                      {testimonial.role}
                    </p>
                    <p style={{
                      color: '#2563eb',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      Using: {testimonial.product}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              onClick={() => setShowTestimonialModal(true)}
              style={{
                background: 'transparent',
                color: '#2563eb',
                border: '2px solid #2563eb',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaQuoteLeft />
              Read More Success Stories
            </button>
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
        }}
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
            Ready to Transform Your Business?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join thousands of successful entrepreneurs who have already transformed 
            their businesses with our complete growth ecosystem.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/checkout"
              style={{
                background: 'white',
                color: '#2563eb',
                padding: '1.25rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <FaRocket />
              Start with Marketing Education
            </Link>
            
            <Link
              to="/ai-visibility-tracker"
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1.25rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <FaEye />
              Try AI Visibility Tracker
            </Link>
          </div>
          
          <div style={{
            marginTop: '2rem',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.95rem'
          }}>
            ✅ 30-day money-back guarantee • ✅ No long-term contracts • ✅ Cancel anytime
          </div>
        </div>
      </motion.section>

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowTestimonialModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              maxWidth: '700px',
              width: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTestimonialModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#4b5563',
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2563eb' }}>What Our Community Says</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Additional testimonials */}
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The complete ecosystem approach is genius. Instead of using 10 different tools, I have everything I need in one place."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic2.png" alt="Profile of Gloria Chen" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Gloria Chen</h4>
                    <p>E-commerce Entrepreneur</p>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The AI Visibility Tracker showed me I was completely invisible to ChatGPT. Fixed that and my referrals doubled!"</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic3.png" alt="Profile of Paul Rodriguez" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Paul Rodriguez</h4>
                    <p>Agency Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}