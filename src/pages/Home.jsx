import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import { FaRocket, FaChartLine, FaUsers, FaHeadset, FaCheckCircle, FaStar, FaGraduationCap, FaHandshake, FaBook, FaQuoteLeft, FaRobot, FaBrain, FaCode } from 'react-icons/fa';
import { MdDashboard, MdInventory, MdPeople } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './Home.css';

// Add styles for the new learning paths structure
const learningPathsStyles = `
  .learning-paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  @media (max-width: 768px) {
    .learning-paths-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin: 1.5rem 0;
    }
  }
  
  .learning-path-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .learning-path-card {
      padding: 1rem;
      margin: 0 0.5rem;
    }
  }
  
  .learning-path-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .learning-path-card.featured {
    border-color: #2563eb;
    background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
  }
  
  .path-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .path-icon {
    font-size: 2rem;
    color: #2563eb;
    margin-bottom: 0.5rem;
  }
  
  .path-header h3 {
    margin: 0.5rem 0;
    color: #1f2937;
    font-size: 1.25rem;
  }
  
  .path-duration {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }
  
  .featured-badge {
    background: #2563eb;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;
    display: inline-block;
  }
  
  .path-courses {
    margin-bottom: 1.5rem;
  }
  
  .course-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .course-number {
    background: #2563eb;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }
  
  .course-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #1f2937;
  }
  
  .course-info p {
    margin: 0;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .path-cta {
    display: block;
    width: 100%;
    background: #2563eb;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    text-align: center;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .path-cta:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
  
  .path-cta.featured {
    background: #059669;
  }
  
  .path-cta.featured:hover {
    background: #047857;
  }
  
  .all-courses-summary {
    text-align: center;
    margin-top: 3rem;
    padding: 2rem;
    background: #f9fafb;
    border-radius: 12px;
  }
  
  .all-courses-summary h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
  }
  
  .all-courses-summary p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
  
  .value-proposition {
    display: flex;
    justify-content: center;
    gap: 2rem;
    align-items: center;
  }
  
  .total-value {
    color: #6b7280;
    margin: 0;
  }
  
  .membership-price {
    color: #059669;
    font-weight: 600;
    font-size: 1.125rem;
    margin: 0;
  }
  
  .highlight {
    color: #2563eb;
  }
  
  /* Mobile-specific improvements */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 1.75rem !important;
      padding: 0 1.5rem;
      margin-bottom: 1.5rem !important;
      line-height: 1.3 !important;
    }
    
    .hero-subtitle {
      font-size: 1rem !important;
      padding: 0 1.5rem;
      margin-bottom: 2rem !important;
      line-height: 1.6 !important;
    }
    
    .section-title {
      font-size: 1.5rem !important;
      padding: 0 1.5rem;
      margin-bottom: 1rem !important;
    }
    
    .section-subtitle {
      font-size: 1rem !important;
      padding: 0 1.5rem;
      margin-bottom: 2rem !important;
      line-height: 1.5 !important;
    }
    
    .testimonials-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      padding: 0 1rem !important;
    }
    
    .testimonial-card {
      margin: 0 0.5rem !important;
      padding: 1rem !important;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1.5rem !important;
      padding: 0 1.5rem !important;
      margin: 2rem 0 !important;
    }
    
    .stat-card {
      padding: 1.5rem 1rem !important;
      margin: 0 !important;
      text-align: center !important;
    }
    
    .stat-card h3 {
      font-size: 1.25rem !important;
      margin-bottom: 0.5rem !important;
    }
    
    .stat-card p {
      font-size: 0.875rem !important;
      margin-bottom: 1rem !important;
    }
    
    .affiliate-content {
      flex-direction: column !important;
      gap: 1rem !important;
      padding: 0 1rem !important;
    }
    
    .affiliate-text {
      padding: 0 !important;
    }
    
    .value-proposition {
      flex-direction: column !important;
      gap: 1rem !important;
    }
    
    .ai-features-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      padding: 0 1rem !important;
    }
    
    .ai-feature-card {
      margin: 0 0.5rem !important;
      padding: 1rem !important;
    }
    
    .container {
      padding: 0 1rem !important;
    }
    
    .content-grid {
      flex-direction: column !important;
      gap: 2rem !important;
      padding: 2rem 0 !important;
    }
    
    .content-text {
      padding: 0 1.5rem !important;
    }
    
    .content-text h2 {
      font-size: 1.5rem !important;
      margin-bottom: 1rem !important;
      line-height: 1.3 !important;
    }
    
    .content-text h3 {
      font-size: 1.25rem !important;
      margin-bottom: 1.5rem !important;
      line-height: 1.4 !important;
    }
    
    .checkmark-list {
      margin: 1.5rem 0 !important;
    }
    
    .checkmark-list li {
      margin-bottom: 1.5rem !important;
      padding: 0.5rem 0 !important;
      line-height: 1.6 !important;
    }
    
    .content-image {
      padding: 0 1.5rem !important;
    }
    
    .device-image {
      width: 100% !important;
      height: auto !important;
    }
    
    .responsive-image {
      width: 100% !important;
      height: auto !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    
    .hero-title {
      font-size: 1.5rem !important;
    }
    
    .section-title {
      font-size: 1.25rem !important;
    }
  }
  
  /* Support Section Styles */
  .support-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  @media (max-width: 768px) {
    .support-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin: 1.5rem 0;
    }
  }
  
  .support-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .support-card {
      padding: 1rem;
      margin: 0 0.5rem;
    }
  }
  
  .support-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
    border-color: #2563eb;
  }
  
  .support-card.premium {
    border-color: #059669;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  }
  
  .support-icon {
    font-size: 2.5rem;
    color: #2563eb;
    margin-bottom: 1rem;
  }
  
  .support-card.premium .support-icon {
    color: #059669;
  }
  
  .support-card h3 {
    margin: 0 0 0.75rem 0;
    color: #1f2937;
    font-size: 1.25rem;
  }
  
  .support-card p {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    line-height: 1.6;
  }
  
  .support-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .support-cta:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
  
  .support-card.premium .support-cta {
    background: #059669;
  }
  
  .support-card.premium .support-cta:hover {
    background: #047857;
  }
  
  .premium-badge {
    background: #059669;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: inline-block;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = learningPathsStyles;
  document.head.appendChild(styleSheet);
}

export default function Home() {
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();

  useEffect(() => {
    // Debug environment variables
    console.log('Environment Variables:', {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
    });
    
    // Handle window resize for responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <h1 className="hero-title" style={{ 
            lineHeight: isMobile ? '1.3' : '1.2', 
            letterSpacing: '0.5px',
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            padding: isMobile ? '0 1.5rem' : '0',
            marginBottom: isMobile ? '1.5rem' : '1rem'
          }}>
            Stop Struggling with Marketing.
            <span style={{ display: 'block', marginTop: '0.5rem', color: '#2563eb' }}>Get Results in 30 Days.</span>
          </h1>
          
          <p className="hero-subtitle" style={{ 
            lineHeight: '1.6', 
            letterSpacing: '0.3px', 
            wordSpacing: '1px',
            fontSize: isMobile ? '1rem' : '1.125rem',
            padding: isMobile ? '0 1.5rem' : '0',
            marginBottom: isMobile ? '2rem' : '1.5rem'
          }}>
            Master AI-powered marketing with our proven system. Learn the exact strategies that generate real revenue - no fluff, just results.
          </p>
          
          <div style={{ 
            marginTop: isMobile ? '1rem' : '2rem', 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            padding: isMobile ? '0 1.5rem' : '0'
          }}>
            {!user && (
              <Link 
                to="/checkout" 
                className="cta-button"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: isMobile ? '0.875rem 2rem' : '1rem 2.5rem',
                  borderRadius: '50px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  maxWidth: isMobile ? '320px' : 'none'
                }}
              >
                <FaRocket /> Begin Checkout - $47/month
              </Link>
            )}
          </div>
        </div>
      </motion.section>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div className="content-text">
              <h2 style={{ 
                lineHeight: '1.3', 
                letterSpacing: '0.3px', 
                marginBottom: isMobile ? '1.5rem' : '1rem',
                fontSize: isMobile ? '1.5rem' : '2rem'
              }}>Why Revenue Ripple Works</h2>
              <h3 style={{ 
                lineHeight: '1.4', 
                letterSpacing: '0.2px', 
                marginBottom: isMobile ? '2rem' : '1.5rem',
                fontSize: isMobile ? '1.25rem' : '1.5rem'
              }}>We focus on what actually generates revenue:</h3>
              <ul className="checkmark-list" style={{ 
                lineHeight: '1.7', 
                letterSpacing: '0.2px',
                marginBottom: isMobile ? '2rem' : '1.5rem'
              }}>
                <li style={{ 
                  marginBottom: isMobile ? '1.5rem' : '1rem',
                  padding: isMobile ? '0.75rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1rem' : '1.125rem'
                }}><FaCheckCircle className="checkmark" /> <strong>AI-First Approach:</strong> Learn the latest AI marketing strategies that your competitors don't know yet.</li>
                <li style={{ 
                  marginBottom: isMobile ? '1.5rem' : '1rem',
                  padding: isMobile ? '0.75rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1rem' : '1.125rem'
                }}><FaCheckCircle className="checkmark" /> <strong>Proven Learning Paths:</strong> Follow step-by-step roadmaps that get you from zero to first sale in 30 days.</li>
                <li style={{ 
                  marginBottom: isMobile ? '1.5rem' : '1rem',
                  padding: isMobile ? '0.75rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1rem' : '1.125rem'
                }}><FaCheckCircle className="checkmark" /> <strong>Earn While You Learn:</strong> Access our exclusive affiliate program to start making money immediately.</li>
                <li style={{ 
                  marginBottom: isMobile ? '1.5rem' : '1rem',
                  padding: isMobile ? '0.75rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1rem' : '1.125rem'
                }}><FaCheckCircle className="checkmark" /> <strong>No Fluff:</strong> Every course is designed to generate real results, not just theory.</li>
              </ul>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/checkout" className="cta-button">
                  <FaHandshake style={{ marginRight: '8px' }} />
                  Start Your 30-Day Journey - $47/month
                </Link>
              </div>
            </div>
            <div className="content-image">
              <img 
                src="/assets/images/images/rev-rip-device.png" 
                alt="Revenue Ripple Platform" 
                className="device-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.section 
        className="stats-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <FaBook className="stat-icon" />
              <div className="stat-number">Step-By-Step</div>
              <p className="stat-label">Playbooks</p>
              <Link to="/playbooks" className="stat-cta">Explore Playbooks</Link>
            </div>
            <div className="stat-card">
              <FaGraduationCap className="stat-icon" />
              <div className="stat-number">Up-To-Date</div>
              <p className="stat-label">Trainings</p>
              <Link to="/training" className="stat-cta">Start Learning</Link>
            </div>
            <div className="stat-card">
              <FaHeadset className="stat-icon" />
              <div className="stat-number">All Your</div>
              <p className="stat-label">Questions Answered</p>
              <Link to="/support" className="stat-cta">Get Support</Link>
            </div>
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <div className="stat-number">500+</div>
              <p className="stat-label">Active Users</p>
              <Link to="/community" className="stat-cta">Join Community</Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Learning Paths Section */}
      <motion.section 
        className="learning-paths-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">Choose Your Path to Success</h2>
          <p className="section-subtitle">Follow these proven learning paths to get results fast</p>
          
          <div className="learning-paths-grid">
            {/* Get Your First Sale Path */}
            <div className="learning-path-card">
              <div className="path-header">
                <FaRocket className="path-icon" />
                <h3>Get Your First Sale</h3>
                <p className="path-duration">30 Days</p>
              </div>
              <div className="path-courses">
                <div className="course-item">
                  <span className="course-number">1</span>
                  <div className="course-info">
                    <h4>AI Essentials</h4>
                    <p>Build your AI foundation</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">2</span>
                  <div className="course-info">
                    <h4>Email Marketing</h4>
                    <p>Build and nurture your audience</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">3</span>
                  <div className="course-info">
                    <h4>Funnel Building</h4>
                    <p>Convert leads into customers</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">4</span>
                  <div className="course-info">
                    <h4>Paid Traffic</h4>
                    <p>Drive targeted traffic</p>
                  </div>
                </div>
              </div>
              <Link to="/checkout" className="path-cta">Start This Path</Link>
            </div>

            {/* Scale Your Business Path */}
            <div className="learning-path-card">
              <div className="path-header">
                <FaChartLine className="path-icon" />
                <h3>Scale Your Business</h3>
                <p className="path-duration">60 Days</p>
              </div>
              <div className="path-courses">
                <div className="course-item">
                  <span className="course-number">1</span>
                  <div className="course-info">
                    <h4>Prompt Engineering</h4>
                    <p>Master AI interactions</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">2</span>
                  <div className="course-info">
                    <h4>Marketing Automation</h4>
                    <p>Automate your workflows</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">3</span>
                  <div className="course-info">
                    <h4>SEO</h4>
                    <p>Long-term traffic growth</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">4</span>
                  <div className="course-info">
                    <h4>Social Media Marketing</h4>
                    <p>Organic growth strategies</p>
                  </div>
                </div>
              </div>
              <Link to="/checkout" className="path-cta">Start This Path</Link>
            </div>

            {/* Master AI Marketing Path */}
            <div className="learning-path-card featured">
              <div className="path-header">
                <FaRobot className="path-icon" />
                <h3>Master AI Marketing</h3>
                <p className="path-duration">45 Days</p>
                <span className="featured-badge">Most Popular</span>
              </div>
              <div className="path-courses">
                <div className="course-item">
                  <span className="course-number">1</span>
                  <div className="course-info">
                    <h4>AI Essentials</h4>
                    <p>Build your AI foundation</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">2</span>
                  <div className="course-info">
                    <h4>Prompt Engineering</h4>
                    <p>Craft perfect prompts</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">3</span>
                  <div className="course-info">
                    <h4>AI Agent Fundamentals</h4>
                    <p>Build and deploy AI agents</p>
                  </div>
                </div>
                <div className="course-item">
                  <span className="course-number">4</span>
                  <div className="course-info">
                    <h4>Marketing Automation</h4>
                    <p>AI-powered workflows</p>
                  </div>
                </div>
              </div>
              <Link to="/checkout" className="path-cta featured">Start AI Mastery</Link>
            </div>
          </div>

          <div className="all-courses-summary">
            <h3>Plus 20+ Additional Courses</h3>
            <p>Website Design • Social Media Marketing • E-commerce • Affiliate Marketing • Freelancing • And More</p>
            <div className="value-proposition">
              <p className="total-value">Total Value: <span className="strikethrough">$2,758</span></p>
              <p className="membership-price">Your Price: <span className="highlight">$47/month</span></p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI Education Section */}
      <motion.section 
        className="ai-education-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">🚀 Master AI Marketing (Your Competitive Edge)</h2>
          <p className="section-subtitle">While others struggle with outdated tactics, you'll dominate with AI-powered strategies</p>
          
          <div className="ai-features-grid">
            <div className="ai-feature-card">
              <FaRobot className="ai-feature-icon" />
              <h3 className="ai-feature-title">AI Fundamentals</h3>
              <p className="ai-feature-description">
                Master the basics of AI and machine learning. Learn how to use AI tools to automate tasks, analyze data, and make data-driven decisions that drive real results.
              </p>
            </div>
            
            <div className="ai-feature-card">
              <FaBrain className="ai-feature-icon" />
              <h3 className="ai-feature-title">Prompt Engineering</h3>
              <p className="ai-feature-description">
                Learn to craft effective prompts that get the best results from AI tools. Create compelling content, generate ideas, and optimize your marketing copy with precision.
              </p>
            </div>
            
            <div className="ai-feature-card">
              <FaCode className="ai-feature-icon" />
              <h3 className="ai-feature-title">AI Automation</h3>
              <p className="ai-feature-description">
                Discover how to automate your marketing workflows with AI. Save time, reduce errors, and scale your marketing efforts efficiently with cutting-edge tools.
              </p>
            </div>
          </div>

          <div className="ai-cta-container">
            <Link 
              to="/checkout" 
              className="cta-button"
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '50px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.25rem',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              <FaRocket /> Begin Checkout - $47/month
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Support & Guidance Section */}
      <motion.section 
        className="support-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: '#f9fafb', padding: '4rem 0' }}
      >
        <div className="container">
          <h2 className="section-title">Still Need Help? We've Got You Covered</h2>
          <p className="section-subtitle">Get personalized support when you need it most</p>
          
          <div className="support-grid">
            {/* AI Assistant Card */}
            <div className="support-card">
              <FaRobot className="support-icon" />
              <h3>AI Marketing Assistant</h3>
              <p>
                Get instant answers to your marketing questions. Our AI assistant is trained on all our courses and can help you apply strategies to your specific business.
              </p>
              <Link to="/dashboard" className="support-cta">
                <FaRobot /> Chat with AI Assistant
              </Link>
            </div>

            {/* 1-on-1 Coaching Card */}
            <div className="support-card premium">
              <span className="premium-badge">Premium Support</span>
              <FaUsers className="support-icon" />
              <h3>1-on-1 Business Coaching</h3>
              <p>
                Book a personal strategy session with our marketing experts. Get tailored advice for your specific business challenges and accelerate your growth.
              </p>
              <Link to="/coaching" className="support-cta">
                <FaUsers /> Book Coaching Call
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
              <strong>Members-only benefit:</strong> Both support options are included with your Revenue Ripple membership
            </p>
            <p style={{ margin: 0, color: '#2563eb', fontWeight: 600 }}>
              No additional fees • Available 24/7 • Expert guidance when you need it
            </p>
          </div>
        </div>
      </motion.section>

      {/* Affiliate Program Section */}
      <motion.section 
        className="affiliate-program-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">The Revenue Ripple Affiliate Program</h2>
          <h3 className="section-subtitle">(Unlock a World of Earning Potential—Faster Than You Can Say 'Cha-Ching')</h3>
          
          <div className="affiliate-content">
            <div className="affiliate-text">
              <p className="affiliate-description">
                Whether you're just getting started or already know your way around funnels and tracking links, our members-only affiliate program is built to help you win. It's stacked with tools, training, and proven resources to help you start earning fast—no fluff, just what works.
              </p>
              <Link to="/affiliate-program" className="affiliate-cta">Learn More About Affiliate Program</Link>
            </div>

            <div className="affiliate-image">
              <img 
                src="/assets/images/images/ebook-explosion.png" 
                alt="Affiliate Program Materials" 
                className="responsive-image"
              />
            </div>

            <div className="affiliate-text">
              <p className="affiliate-description">
                You'll get access to lead magnets, landing pages, promo scripts, and full walkthroughs so you're never guessing what to do next. We're even dropping exclusive digital books and templates in the mix—because we're not just teaching you how to make money, we're handing you the blueprint.
              </p>
              <div className="affiliate-visual-highlight">
                <img src="/assets/images/images/Affilate-reseller-earnings-dash.png" alt="Affiliate Dashboard Preview" className="responsive-image" />
                <p className="caption">Real dashboard. Real payouts. Real growth.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* What is Revenue Ripple Section */}
      <motion.section 
        className="what-is-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">WHAT IS REVENUE RIPPLE?</h2>
          <p className="what-is-description" style={{ lineHeight: '1.7', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Whether you're a beginner looking for a place to start or a seasoned marketer looking to uplevel 
            your skills, Revenue Ripple has everything you need to get marketing DONE. Our platform is like 
            a personal coach, but without the awkward eye contact. We offer 46 comprehensive marketing 
            tutorials, 25 expert-led video courses, and a growing library of resources to help you stay ahead 
            of the curve. Plus, our exclusive affiliate program means you can earn while you learn and turn 
            your marketing skills into profit! And our experienced team is always here to support you, like having a mentor in your pocket—minus the awkward small talk. Revenue Ripple truly is an unfair advantage for any 
            marketer. So why wait? Join today and take your marketing game to the next level!
          </p>
          <div className="workspace-image">
            <img src="/assets/images/images/rev-rip-pic.png" alt="Clean modern workspace with Revenue Ripple platform" />
          </div>
          <div className="what-is-cta-container">
            <Link to="/pricing" className="what-is-cta primary">View Pricing Plans</Link>
            <Link to="/demo" className="what-is-cta secondary">Request Demo</Link>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">What Our Members Say</h2>
          <div className="testimonials-grid">
            {/* Initial testimonials that are always shown */}
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates since implementing their strategies."</p>
              <div className="testimonial-author">
                <img src="/assets/images/images/profile-pic1.png" alt="Profile of Sarah Johnson" className="testimonial-avatar" />
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Digital Marketing Consultant</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"The ROI from implementing Revenue Ripple's strategies has been incredible. Their step-by-step approach made complex marketing concepts easy to understand and implement."</p>
              <div className="testimonial-author">
                <img src="/assets/images/images/profile-pic2.png" alt="Profile of Michael Chen" className="testimonial-avatar" />
                <div className="author-info">
                  <h4>Gloria Chen</h4>
                  <p>E-commerce Entrepreneur</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"As a beginner in digital marketing, I was overwhelmed until I found Revenue Ripple. Their platform gave me the confidence and skills I needed to launch my own agency."</p>
              <div className="testimonial-author">
                <img src="/assets/images/images/profile-pic3.png" alt="Profile of Paul Rodriguez" className="testimonial-avatar" />
                <div className="author-info">
                  <h4>Paul Rodriguez</h4>
                  <p>Agency Founder</p>
                </div>
              </div>
            </div>

            {showAllTestimonials && (
              <>
                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The affiliate program is a game-changer! Not only am I learning valuable skills, but I'm also earning while implementing what I learn. It's a win-win situation."</p>
                  <div className="testimonial-author">
                    <img src="/assets/images/images/profile-pic4.png" alt="Profile of David Thompson" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>David Thompson</h4>
                      <p>Affiliate Marketer</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The support team is incredible! They're always there to help and the community is so encouraging. It's like having a marketing family that wants you to succeed."</p>
                  <div className="testimonial-author">
                    <img src="/assets/images/images/profile-pic5.png" alt="Profile of Adin Parker" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>Adin Parker</h4>
                      <p>Small Business Owner</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The video courses are pure gold! Each lesson is packed with actionable insights that I could implement immediately. My social media engagement has tripled!"</p>
                  <div className="testimonial-author">
                    <img src="/assets/images/images/profile-pic6.png" alt="Profile of James Wilson" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>James Wilson</h4>
                      <p>Social Media Manager</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"I love how the platform keeps updating with new content and strategies. It helps me stay ahead of the curve in this fast-paced digital marketing world."</p>
                  <div className="testimonial-author">
                    <img src="/assets/images/images/profile-pic7.png" alt="Profile of Nina Patel" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>Nina Patel</h4>
                      <p>Marketing Director</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The ROI tracking templates and analytics tutorials helped me prove the value of my marketing efforts to clients. My retainer rates have doubled!"</p>
                  <div className="testimonial-author">
                    <img src="/assets/images/images/profile-pic8.png" alt="Profile of Alex Foster" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>Alex Foster</h4>
                      <p>Marketing Analytics Specialist</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="show-more-container">
            <button 
              className="show-more-button"
              onClick={() => setShowAllTestimonials(!showAllTestimonials)}
            >
              {showAllTestimonials ? 'Show Less' : 'Show More Reviews'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* No Free Trial Section */}
      <motion.section 
        className="no-free-trial-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">No Free Trial?</h2>
          <h3>What about a guarantee?</h3>
          <p className="no-free-trial-description" style={{ lineHeight: '1.7', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Free trials are cool in theory—until you're left with nothing but an expired login and the sour aftertaste of wasted time. We don't do the whole "test drive" thing over here. Why? Because growth doesn't come from dabbling—it comes from committing.

            At Revenue Ripple, we're not trying to attract tire-kickers or fence-sitters. We're looking for the go-getters, the doers, the ones ready to make moves and invest in themselves. When you put real skin in the game, that's when real results show up.

            Now, don't get it twisted—we're not heartless. That's why we back it up with a 30-day money-back guarantee. If it's not for you or doesn't deliver what you expected, no hard feelings. We'll refund you, no questions asked. It's like going on a first date, realizing we're not your type, and still parting ways with respect (and maybe a follow on Instagram).

            So if you're ready to level up, we've got your back—and your wallet—covered.

            Access Revenue Ripple Today.
          </p>
          <div className="no-free-trial-cta">
            <Link to="/checkout" className="cta-button">
              Join Now for Only $47/month
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        className="final-cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">Ready to Transform Your Marketing?</h2>
          <p className="cta-description" style={{ lineHeight: '1.6', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Join thousands of successful marketers who have already transformed their businesses with Revenue Ripple.
            Start your journey today and get instant access to all our premium features.
          </p>
        
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/checkout" className="cta-button">
              Join Now for Only $47/month
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Floating See More Reviews Button */}
      <button
        onClick={() => setShowTestimonialModal(true)}
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '32px',
          right: isMobile ? '16px' : '32px',
          zIndex: 1200,
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: isMobile ? '0.625rem 1rem' : '0.75rem 1.5rem',
          fontWeight: 600,
          fontSize: isMobile ? '0.875rem' : '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          maxWidth: isMobile ? '200px' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        aria-label="See More Reviews"
      >
        <FaQuoteLeft style={{ fontSize: isMobile ? '1rem' : '1.25rem' }} /> 
        {isMobile ? 'More Reviews' : 'See More Reviews'}
      </button>
      {/* Testimonial Modal Overlay */}
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
              borderRadius: isMobile ? '0.5rem' : '1rem',
              maxWidth: '700px',
              width: isMobile ? '95vw' : '90vw',
              maxHeight: isMobile ? '90vh' : '80vh',
              overflowY: 'auto',
              padding: isMobile ? '1rem' : '2rem',
              position: 'relative',
              margin: isMobile ? '0.5rem' : '0',
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
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2563eb' }}>What Our Members Say</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Render all testimonials, including the extra ones */}
              {/* Always show all testimonials in the modal */}
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates since implementing their strategies."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic1.png" alt="Profile of Sarah Johnson" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Sarah Johnson</h4>
                    <p>Digital Marketing Consultant</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The ROI from implementing Revenue Ripple's strategies has been incredible. Their step-by-step approach made complex marketing concepts easy to understand and implement."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic2.png" alt="Profile of Michael Chen" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Gloria Chen</h4>
                    <p>E-commerce Entrepreneur</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"As a beginner in digital marketing, I was overwhelmed until I found Revenue Ripple. Their platform gave me the confidence and skills I needed to launch my own agency."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic3.png" alt="Profile of Paul Rodriguez" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Paul Rodriguez</h4>
                    <p>Agency Founder</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The affiliate program is a game-changer! Not only am I learning valuable skills, but I'm also earning while implementing what I learn. It's a win-win situation."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic4.png" alt="Profile of David Thompson" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>David Thompson</h4>
                    <p>Affiliate Marketer</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The support team is incredible! They're always there to help and the community is so encouraging. It's like having a marketing family that wants you to succeed."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic5.png" alt="Profile of Adin Parker" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Adin Parker</h4>
                    <p>Small Business Owner</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The video courses are pure gold! Each lesson is packed with actionable insights that I could implement immediately. My social media engagement has tripled!"</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic6.png" alt="Profile of James Wilson" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>James Wilson</h4>
                    <p>Social Media Manager</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"I love how the platform keeps updating with new content and strategies. It helps me stay ahead of the curve in this fast-paced digital marketing world."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic7.png" alt="Profile of Nina Patel" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Nina Patel</h4>
                    <p>Marketing Director</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The ROI tracking templates and analytics tutorials helped me prove the value of my marketing efforts to clients. My retainer rates have doubled!"</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic8.png" alt="Profile of Alex Foster" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Alex Foster</h4>
                    <p>Marketing Analytics Specialist</p>
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