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
            🚀 REVENUE RIPPLE OS — LEARN • AUTOMATE • EARN
          </motion.div>
          
          <h1 className="hero-title">
            Scale Your Business Without Hiring a Team
            <span style={{ display: 'block', color: '#2563eb' }}>
              Your All‑in‑One Business OS
            </span>
          </h1>
          
          <p className="hero-subtitle">
            A bundled platform that teaches you marketing, gives you AI market insights, and runs AI agents that monitor & self‑heal your automations — so growth isn't fragile.
          </p>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {!user && (
              <Link 
                to="/founders" 
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
                <FaRocket /> Founders Annual — 2 months free
              </Link>
            )}
          </div>
        </div>
      </motion.section>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div className="content-text">
              <h2 style={{ lineHeight: '1.3', letterSpacing: '0.3px', marginBottom: '1rem' }}>Ready To Get Started To Make Marketing Easy?</h2>
              <h3 style={{ lineHeight: '1.4', letterSpacing: '0.2px', marginBottom: '1.5rem' }}>Create Your Account for Instant Access to:</h3>
              <ul className="checkmark-list" style={{ lineHeight: '1.7', letterSpacing: '0.2px' }}>
                <li style={{ marginBottom: '1rem' }}><FaCheckCircle className="checkmark" /> 46 comprehensive marketing tutorials and 25 expert-led video courses, continuously updated to stay ahead of the curve.</li>
                <li style={{ marginBottom: '1rem' }}><FaCheckCircle className="checkmark" /> A members-only affiliate program, empowering you to earn as you learn.</li>
                <li style={{ marginBottom: '1rem' }}><FaCheckCircle className="checkmark" /> Dedicated support from our experienced team, always on hand to address your queries and guide your growth.</li>
                <li style={{ marginBottom: '1rem' }}><FaCheckCircle className="checkmark" /> PLUS, stay competitive with access to a growing library of marketing resources, tailored to help you achieve success in today's ever-evolving landscape.</li>
              </ul>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/checkout" className="cta-button">
                  <FaHandshake style={{ marginRight: '8px' }} />
                  Join Now for Only $47/month
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

      {/* Courses Section */}
      <motion.section 
        className="courses-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">Benefits of Membership</h2>
          <hr />
          <h1 className="section-title">25+ Expert-Led Video Courses
          That GET STUFF DONE</h1>
          <div className="courses-grid">
            <h2 className="course-category-title">Foundational Skills</h2>
            {/* Website Design Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/4.png" alt="Website Design Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Website Design</h3>
                <p className="course-description" style={{ lineHeight: '1.6', letterSpacing: '0.2px', wordSpacing: '0.5px' }}>
                  Looking to create an effective website for your business? Our Website Design course has got you covered. From choosing the right layout and color scheme to optimizing your website for search engines, we'll provide you with the skills and knowledge you need to create a professional and effective website that represents your brand.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
                <Link to="/courses/website-design" className="course-cta">Preview Course</Link>
              </div>
            </div>

            {/* Social Media Marketing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/3.png" alt="Social Media Marketing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Social Media Marketing</h3>
                <p className="course-description" style={{ lineHeight: '1.6', letterSpacing: '0.2px', wordSpacing: '0.5px' }}>
                  Wanna know how to market your business on social media like a pro? Our Social Media Marketing course will teach you how to create engaging content, optimize your profiles, and connect with your target audience on all the major social media platforms, including Facebook, Instagram, Twitter, and Youtube.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Email Marketing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/6.png" alt="Email Marketing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Email Marketing</h3>
                <p className="course-description">
                  Looking to boost your revenue with email marketing? Our Email Marketing course covers the essentials of email platform basics, content creation, and automation techniques that will help you create effective email campaigns that engage and convert your audience.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* SEO Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/7.png" alt="SEO Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">SEO</h3>
                <p className="course-description">
                  Master the art of data-driven decision making. Learn how to track, analyze, and interpret key metrics across all your marketing channels to optimize your campaigns and maximize ROI.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* E-commerce Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/8.png" alt="E-commerce Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">E-commerce</h3>
                <p className="course-description">
                  Build and optimize your online store for maximum conversions. Learn essential e-commerce strategies, from product page optimization to checkout flow improvements and customer retention tactics.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            <h2 className="course-category-title">Revenue Drivers</h2>
            {/* Affiliate Marketing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/2.png" alt="Affiliate Marketing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Affiliate Marketing</h3>
                <p className="course-description">
                  Transform your online presence into a revenue-generating machine. Discover proven monetization strategies, from digital products to subscription models, and implement them in your business.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Paid Traffic Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/10.png" alt="Paid Traffic Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Paid Traffic</h3>
                <p className="course-description">
                  Looking to drive more traffic to your website through paid advertising? Our Paid Traffic course will teach you how to set up and optimize your ad campaigns on all the major advertising platforms, including Google Ads and Facebook Ads.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Funnel Building Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/1.png" alt="Funnel Building Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Funnel Building</h3>
                <p className="course-description">
                  Want to maximize your sales? Our Funnel Building course will teach you how to create effective sales funnels that convert your audience into customers. From creating high-converting landing pages to optimizing your upsell and downsell offers, we'll cover all the essential elements of funnel building.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Freelancing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/5.png" alt="Freelancing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Freelancing</h3>
                <p className="course-description">
                  Looking to become a successful freelancer? Our Freelancing course covers everything you need to know to start and grow your own freelancing business, from finding clients to setting your rates and building a portfolio.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Marketing Automation Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/12.png" alt="Marketing Automation Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Marketing Automation</h3>
                <p className="course-description">
                  Ready to save time and streamline your marketing efforts? Our Marketing Automation course teaches you how to automate your marketing processes using the latest tools and techniques, so that you can focus on what you do best - growing your business.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Online Learning Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/11.png" alt="Online Learning Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Online Learning</h3>
                <p className="course-description">
                  Learn how to create and sell your own online course with our course. We'll teach you everything you need to know, from choosing the right topic to creating engaging content and marketing your course effectively. With our Online Learning course, turn your expertise into profit.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* More Courses Summary */}
            <div className="course-card summary-card">
              <div className="course-image">
                <img src="/assets/images/images/courses-preview.png" alt="Online Learning Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Plus 14 More Courses Inside</h3>
                <div className="course-pricing">
                  <p className="retail-price">Total Retail Value: <span className="strikethrough">$2,758</span></p>
                  <p className="membership-status">All Included with Membership</p>
                </div>
              </div>
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
          <h2 className="section-title">AI-Powered Marketing Education</h2>
          <p className="section-subtitle">Learn to leverage AI for unprecedented marketing success</p>
          
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
                padding: '0.9rem 1.4rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
              }}
            >
              <FaRocket /> Build My Business OS
            </Link>
            <Link
              to="/how-it-works"
              style={{
                background: 'white',
                color: '#2563eb',
                border: '2px solid #2563eb',
                padding: '0.85rem 1.3rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaPlay /> See How It Works
            </Link>
          </div>
          
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
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
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

      {/* Value Stack Section (Bundled Offer) */}
      <motion.section
        style={{ padding: '3rem 0', background: '#ffffff' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '0.5rem', color: '#1e293b' }}>
            Revenue Ripple OS — Value Stack
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 auto 2rem', maxWidth: 780 }}>
            Learn, Automate, and Scale: training + AI market visibility + always‑on command center.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 14px', background: '#111827', color: 'white', position: 'sticky', top: 0 }}>Component</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', background: '#111827', color: 'white', position: 'sticky', top: 0 }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', background: '#111827', color: 'white', position: 'sticky', top: 0 }}>Perceived Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    c: 'Full Learning Platform',
                    d: '46+ expert‑led tutorials, 25+ pro courses, continuously updated.',
                    v: '$2,500/mo'
                  },
                  {
                    c: 'AI Insights Tool',
                    d: 'Track market/competitors and optimize prompts to show up in AI results.',
                    v: '$1,500/mo'
                  },
                  {
                    c: 'AI Command Center',
                    d: 'Agents monitor automations, funnels & webhooks 24/7 and auto‑heal issues.',
                    v: '$1,000/mo'
                  },
                  {
                    c: 'Affiliate Program',
                    d: 'Earn commissions promoting Revenue Ripple — plug‑and‑play assets included.',
                    v: '$500/mo'
                  },
                  {
                    c: 'Reseller/White‑Label (Partner)',
                    d: 'Sell the platform under your brand with white‑label dashboards & reports.',
                    v: '$2,000/mo'
                  },
                  {
                    c: 'Bonus: Prebuilt Funnels',
                    d: 'Ready‑to‑launch funnels that save weeks of setup.',
                    v: '$1,000 value'
                  },
                  {
                    c: 'Bonus: Swipe Library',
                    d: 'Ads, emails, landing copy and CTAs that convert.',
                    v: '$500 value'
                  },
                  {
                    c: 'Bonus: Quarterly Strategy Calls',
                    d: 'High‑leverage planning to keep you scaling.',
                    v: '$2,000 value'
                  }
                ].map((row, i) => (
                  <tr key={row.c} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                    <td style={{ padding: '12px 14px', color: '#1f2937', fontWeight: 600 }}>{row.c}</td>
                    <td style={{ padding: '12px 14px', color: '#4b5563' }}>{row.d}</td>
                    <td style={{ padding: '12px 14px', color: '#111827' }}>{row.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#b45309', fontWeight: 700 }}>
            Total Perceived Value: $8,500+/mo
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              to="/checkout"
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '0.9rem 1.4rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
              }}
            >
              <FaRocket /> Get Started (Core $197/mo)
            </Link>
          </div>
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
        <div className="container">
          <h2 className="section-title">Ready to Transform Your Marketing?</h2>
          <p className="cta-description" style={{ lineHeight: '1.6', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Join thousands of successful marketers who have already transformed their businesses with Revenue Ripple.
            Start your journey today and get instant access to all our premium features.
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