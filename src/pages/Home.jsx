import { acquisitionForSubmission } from '../utils/acquisitionAttribution';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import StickyCTA from '../components/StickyCTA';
import GuaranteeBlock from '../components/GuaranteeBlock';
import TrustBadges from '../components/TrustBadges';
import FAQAccordion from '../components/FAQAccordion';
import OfferComparison from '../components/OfferComparison';
import ReferralTracker from '../components/ReferralTracker.js';
import { FaRocket, FaChartLine, FaUsers, FaHeadset, FaCheckCircle, FaStar, FaGraduationCap, FaHandshake, FaBook, FaRobot, FaBrain, FaCode } from 'react-icons/fa';
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
      padding: 0 2rem;
      margin-bottom: 2rem !important;
      line-height: 1.4 !important;
    }
    
    .hero-subtitle {
      font-size: 1rem !important;
      padding: 0 2rem;
      margin-bottom: 2.5rem !important;
      line-height: 1.7 !important;
    }
    
    .section-title {
      font-size: 1.5rem !important;
      padding: 0 2rem;
      margin-bottom: 1.5rem !important;
    }
    
    .section-subtitle {
      font-size: 1rem !important;
      padding: 0 2rem;
      margin-bottom: 2.5rem !important;
      line-height: 1.6 !important;
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
      padding: 0 1.5rem !important;
    }
    
    .content-grid {
      flex-direction: column !important;
      gap: 3rem !important;
      padding: 3rem 0 !important;
    }
    
    .content-text {
      padding: 0 2rem !important;
    }
    
    .content-text h2 {
      font-size: 1.75rem !important;
      margin-bottom: 2rem !important;
      line-height: 1.4 !important;
      text-align: center !important;
    }
    
    .content-text h3 {
      font-size: 1.375rem !important;
      margin-bottom: 2.5rem !important;
      line-height: 1.5 !important;
      text-align: center !important;
    }
    
    .checkmark-list {
      margin: 2rem 0 !important;
      padding: 0 !important;
    }
    
    .checkmark-list li {
      margin-bottom: 2.5rem !important;
      padding: 1rem 0 !important;
      line-height: 1.8 !important;
      font-size: 1.125rem !important;
      display: block !important;
      clear: both !important;
    }
    
    .checkmark-list li strong {
      display: block !important;
      margin-bottom: 0.5rem !important;
      font-size: 1.25rem !important;
    }
    
    .checkmark {
      margin-right: 1rem !important;
      font-size: 1.25rem !important;
      vertical-align: top !important;
      margin-top: 0.25rem !important;
    }
    
    .content-image {
      padding: 0 2rem !important;
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
  
  /* Modern Glassmorphism Effects */
  .hero-background {
    pointer-events: none;
  }
  
  /* Enhanced Card Hover Effects */
  .stat-card,
  .learning-path-card,
  .ai-feature-card,
  .testimonial-card {
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  /* Smooth Scroll Behavior */
  html {
    scroll-behavior: smooth;
  }
  
  /* Enhanced Button Effects */
  .path-cta,
  .stat-cta,
  .support-cta {
    position: relative;
    overflow: hidden;
  }
  
  .path-cta::before,
  .stat-cta::before,
  .support-cta::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  .path-cta:hover::before,
  .stat-cta:hover::before,
  .support-cta:hover::before {
    width: 300px;
    height: 300px;
  }
  
  /* Animated Gradient Text */
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  /* Pulse Animation for Featured Badge */
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
    }
  }
  
  .featured-badge {
    animation: pulse-glow 2s infinite;
  }
  
  /* Smooth Icon Animations */
  .path-icon,
  .stat-icon,
  .ai-feature-icon,
  .support-icon {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  /* Enhanced Modal Animation */
  .testimonial-modal-overlay {
    backdrop-filter: blur(8px);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = learningPathsStyles;
  document.head.appendChild(styleSheet);
}

// Animation variants for modern effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const textRevealVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

const iconVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: { scale: 0.98 }
};

export default function Home() {
  const [recentActivity] = useState([
    "Free learning remains available",
    "Owner pilot is in preparation", 
    "Live scans are not available yet"
  ]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();
  const heroRef = useRef(null);
  // Removed scroll-based parallax and opacity transforms to prevent fade effects

  useEffect(() => {
    // Keep one recorder across client-side visits instead of reinjecting it.
    if (!document.getElementById('revenue-hotjar')) {
      window.hj = window.hj || function () {
        (window.hj.q = window.hj.q || []).push(arguments);
      };
      window._hjSettings = { hjid: 6531289, hjsv: 6 };
      const script = document.createElement('script');
      script.id = 'revenue-hotjar';
      script.async = true;
      script.src = 'https://static.hotjar.com/c/hotjar-6531289.js?sv=6';
      document.head.appendChild(script);
    }

    // Handle window resize for responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="home">
      <SEO 
        title="Marketing Training & Tools for Entrepreneurs"
        description="Practical marketing learning and an AI visibility pilot in preparation. Existing free learning continues. Live scans and new premium purchases are not available yet."
        url="https://revenueripple.org"
      />
      <ReferralTracker />
      <Navbar />
      {/* Hero Section with Parallax */}
      <section 
        ref={heroRef}
        className="hero"
        style={{ position: 'relative', zIndex: 3 }}
      >
        {/* Static Background Gradient */}
        <motion.div
          className="hero-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
            backgroundSize: '400% 400%',
            opacity: 0.1,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 
            className="hero-title" 
            style={{ 
            lineHeight: isMobile ? '1.4' : '1.2', 
            letterSpacing: '0.5px',
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            padding: isMobile ? '0 2rem' : '0',
              marginBottom: isMobile ? '2rem' : '1rem',
              background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 1
            }}
          >
            Build Your Marketing Skills.
            <span style={{ display: 'block', marginTop: '0.5rem', color: '#2563eb', opacity: 1 }}>
              Make Your Next Move Clearer.
            </span>
          </h1>
          
          <p 
            className="hero-subtitle" 
            style={{ 
            lineHeight: '1.7', 
            letterSpacing: '0.3px', 
            wordSpacing: '1px',
            fontSize: isMobile ? '1rem' : '1.125rem',
            padding: isMobile ? '0 2rem' : '0',
            marginBottom: isMobile ? '2.5rem' : '1.5rem',
            opacity: 1,
            color: '#4b5563'
            }}
          >
            Keep learning with Revenue Ripple while we prepare an AI visibility tool for practical, evidence-based next steps.
          </p>
          
          <div 
            className={`mt-${isMobile ? '4' : '8'} flex gap-4 justify-center ${isMobile ? 'flex-col px-8' : 'flex-row'}`}
          >
            {!user && (
              <Link 
                to="/register" 
                className="cta-button"
                style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: isMobile ? '0.875rem 2rem' : '1rem 2.5rem',
                  borderRadius: '50px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                    maxWidth: isMobile ? '320px' : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <FaRocket />
                  Start Learning Free
              </Link>
            )}
          </div>
          <div className="max-w-xl mx-auto">
            <GuaranteeBlock title="Your Access Today" points={["Your existing free learning resources remain available", "Live scans and new premium purchases are not available yet.", "Owner-only pilot preparation; no automatic enrollment"]} />
            <TrustBadges labels={["Free learning", "Pilot in preparation", "Scans disabled"]} />
          </div>
        </div>
      </section>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div className="content-text">
              <h2 style={{ 
                lineHeight: '1.4', 
                letterSpacing: '0.3px', 
                marginBottom: isMobile ? '2rem' : '1rem',
                fontSize: isMobile ? '1.75rem' : '2rem',
                textAlign: isMobile ? 'center' : 'left'
              }}>A Practical Place to Start</h2>
              <h3 style={{ 
                lineHeight: '1.5', 
                letterSpacing: '0.2px', 
                marginBottom: isMobile ? '2.5rem' : '1.5rem',
                fontSize: isMobile ? '1.375rem' : '1.5rem',
                textAlign: isMobile ? 'center' : 'left'
              }}>Learn a skill. Put it to work:</h3>
              <div className="checkmark-list" style={{ 
                marginBottom: isMobile ? '2.5rem' : '1.5rem',
                padding: 0
              }}>
                <div style={{ 
                  marginBottom: isMobile ? '2.5rem' : '1rem',
                  padding: isMobile ? '1rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1.125rem' : '1.125rem',
                  lineHeight: '1.8'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: isMobile ? '0.5rem' : '0.25rem'
                  }}>
                    <FaCheckCircle style={{ 
                      color: '#2563eb', 
                      fontSize: '1.25rem',
                      marginTop: '0.25rem',
                      flexShrink: 0
                    }} />
                    <strong style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.125rem',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>AI-First Approach:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Build your understanding of AI tools and practical marketing applications.
                  </div>
                </div>
                
                <div style={{ 
                  marginBottom: isMobile ? '2.5rem' : '1rem',
                  padding: isMobile ? '1rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1.125rem' : '1.125rem',
                  lineHeight: '1.8'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: isMobile ? '0.5rem' : '0.25rem'
                  }}>
                    <FaCheckCircle style={{ 
                      color: '#2563eb', 
                      fontSize: '1.25rem',
                      marginTop: '0.25rem',
                      flexShrink: 0
                    }} />
                    <strong style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.125rem',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>Guided Learning Paths:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Explore lessons on email, content, funnels, and reaching the right audience.
                  </div>
                </div>
                
                <div style={{ 
                  marginBottom: isMobile ? '2.5rem' : '1rem',
                  padding: isMobile ? '1rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1.125rem' : '1.125rem',
                  lineHeight: '1.8'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: isMobile ? '0.5rem' : '0.25rem'
                  }}>
                    <FaCheckCircle style={{ 
                      color: '#2563eb', 
                      fontSize: '1.25rem',
                      marginTop: '0.25rem',
                      flexShrink: 0
                    }} />
                    <strong style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.125rem',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>Learn at Your Pace:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Your existing free learning resources remain available.
                  </div>
                </div>
                
                <div style={{ 
                  marginBottom: isMobile ? '2.5rem' : '1rem',
                  padding: isMobile ? '1rem 0' : '0.5rem 0',
                  fontSize: isMobile ? '1.125rem' : '1.125rem',
                  lineHeight: '1.8'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: isMobile ? '0.5rem' : '0.25rem'
                  }}>
                    <FaCheckCircle style={{ 
                      color: '#2563eb', 
                      fontSize: '1.25rem',
                      marginTop: '0.25rem',
                      flexShrink: 0
                    }} />
                    <strong style={{ 
                      fontSize: isMobile ? '1.25rem' : '1.125rem',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>Clear Expectations:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Apply what you learn; individual results vary and are not guaranteed.
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to={user ? "/dashboard" : "/register"} className="cta-button">
                  <FaHandshake style={{ marginRight: '8px' }} />
                  Start Learning Free
                </Link>
                <div className="max-w-xl mx-auto"><GuaranteeBlock title="Your Access Today" points={["Your existing free learning resources remain available", "Live scans and new premium purchases are not available yet.", "Owner-only pilot preparation; no automatic enrollment"]} /><TrustBadges labels={["Free learning", "Pilot in preparation", "Scans disabled"]} /></div>
              </div>
            </div>
            <div className="content-image">
              <img loading="lazy" decoding="async" width="1472" height="832"
                src="/assets/images/images/rev-rip-device.png" 
                alt="Revenue Ripple Platform" 
                className="device-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div 
              className="stat-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '2rem 1.5rem',
                position: 'static',
                paddingBottom: '2rem'
              }}
            >
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <FaBook className="stat-icon" style={{ display: 'block', margin: '0 auto' }} />
              </div>
              <div className="stat-number" style={{ textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
                Step-By-Step
              </div>
              <p className="stat-label" style={{ textAlign: 'center', width: '100%', marginBottom: '1rem' }}>Playbooks</p>
              <Link to="/playbooks" className="stat-cta" style={{ position: 'static', transform: 'none', left: 'auto', bottom: 'auto', textAlign: 'center', display: 'inline-block', marginTop: '0.5rem' }}>Explore Playbooks</Link>
            </div>
            
            <div 
              className="stat-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '2rem 1.5rem',
                position: 'static',
                paddingBottom: '2rem'
              }}
            >
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <FaGraduationCap className="stat-icon" style={{ display: 'block', margin: '0 auto' }} />
              </div>
              <div className="stat-number" style={{ textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
                Up-To-Date
              </div>
              <p className="stat-label" style={{ textAlign: 'center', width: '100%', marginBottom: '1rem' }}>Trainings</p>
              <Link to="/training" className="stat-cta" style={{ position: 'static', transform: 'none', left: 'auto', bottom: 'auto', textAlign: 'center', display: 'inline-block', marginTop: '0.5rem' }}>Start Learning</Link>
            </div>
            
            <div 
              className="stat-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '2rem 1.5rem',
                position: 'static',
                paddingBottom: '2rem'
              }}
            >
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <FaHeadset className="stat-icon" style={{ display: 'block', margin: '0 auto' }} />
              </div>
              <div className="stat-number" style={{ textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
                All Your
              </div>
              <p className="stat-label" style={{ textAlign: 'center', width: '100%', marginBottom: '1rem' }}>Questions Answered</p>
              <Link to="/support" className="stat-cta" style={{ position: 'static', transform: 'none', left: 'auto', bottom: 'auto', textAlign: 'center', display: 'inline-block', marginTop: '0.5rem' }}>Get Support</Link>
            </div>
            
            <div 
              className="stat-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '2rem 1.5rem',
                position: 'static',
                paddingBottom: '2rem'
              }}
            >
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <FaUsers className="stat-icon" style={{ display: 'block', margin: '0 auto' }} />
              </div>
              <div className="stat-number" style={{ textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
                Open
              </div>
              <p className="stat-label" style={{ textAlign: 'center', width: '100%', marginBottom: '1rem' }}>Learning Community</p>
              <Link to="/community" className="stat-cta" style={{ position: 'static', transform: 'none', left: 'auto', bottom: 'auto', textAlign: 'center', display: 'inline-block', marginTop: '0.5rem' }}>Join Community</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <motion.section 
        className="learning-paths-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            Choose Your Learning Path
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Build practical skills at your own pace
          </motion.p>
          
          <motion.div 
            className="learning-paths-grid"
            variants={containerVariants}
          >
            {/* Marketing Foundations Path */}
            <motion.div 
              className="learning-path-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <motion.div 
                className="path-header"
                variants={itemVariants}
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                >
                <FaRocket className="path-icon" />
                </motion.div>
                <h3>Marketing Foundations</h3>
                <p className="path-duration">Self-paced</p>
              </motion.div>
              <motion.div 
                className="path-courses"
                variants={containerVariants}
              >
                {[
                  { num: 1, title: 'AI Essentials', desc: 'Build your AI foundation' },
                  { num: 2, title: 'Email Marketing', desc: 'Build and nurture your audience' },
                  { num: 3, title: 'Funnel Building', desc: 'Convert leads into customers' },
                  { num: 4, title: 'Paid Traffic', desc: 'Drive targeted traffic' }
                ].map((course, idx) => (
                  <motion.div 
                    key={idx}
                    className="course-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="course-number">
                      {course.num}
                    </span>
                  <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>{course.desc}</p>
                  </div>
                  </motion.div>
                ))}
              </motion.div>
              <Link to={user ? "/dashboard" : "/register"} className="path-cta">Start This Path</Link>
            </motion.div>

            {/* Scale Your Business Path */}
            <motion.div 
              className="learning-path-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <motion.div 
                className="path-header"
                variants={itemVariants}
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                >
                <FaChartLine className="path-icon" />
                </motion.div>
                <h3>Scale Your Business</h3>
                <p className="path-duration">Self-paced</p>
              </motion.div>
              <motion.div 
                className="path-courses"
                variants={containerVariants}
              >
                {[
                  { num: 1, title: 'Prompt Engineering', desc: 'Master AI interactions' },
                  { num: 2, title: 'Marketing Automation', desc: 'Automate your workflows' },
                  { num: 3, title: 'SEO', desc: 'Long-term traffic growth' },
                  { num: 4, title: 'Social Media Marketing', desc: 'Organic growth strategies' }
                ].map((course, idx) => (
                  <motion.div 
                    key={idx}
                    className="course-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="course-number">
                      {course.num}
                    </span>
                  <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>{course.desc}</p>
                  </div>
                  </motion.div>
                ))}
              </motion.div>
              <Link to={user ? "/dashboard" : "/register"} className="path-cta">Start This Path</Link>
            </motion.div>

            {/* Master AI Marketing Path */}
            <motion.div 
              className="learning-path-card featured"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.3)',
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.div 
                className="path-header"
                variants={itemVariants}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                >
                <FaRobot className="path-icon" />
                </motion.div>
                <h3>Master AI Marketing</h3>
                <p className="path-duration">Self-paced</p>
                <span className="featured-badge">
                  AI Learning
                </span>
              </motion.div>
              <motion.div 
                className="path-courses"
                variants={containerVariants}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {[
                  { num: 1, title: 'AI Essentials', desc: 'Build your AI foundation' },
                  { num: 2, title: 'Prompt Engineering', desc: 'Craft perfect prompts' },
                  { num: 3, title: 'AI Agent Fundamentals', desc: 'Build and deploy AI agents' },
                  { num: 4, title: 'Marketing Automation', desc: 'AI-powered workflows' }
                ].map((course, idx) => (
                  <motion.div 
                    key={idx}
                    className="course-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="course-number">
                      {course.num}
                    </span>
                  <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>{course.desc}</p>
                  </div>
                  </motion.div>
                ))}
              </motion.div>
              <Link to={user ? "/dashboard" : "/register"} className="path-cta featured" style={{ position: 'relative', zIndex: 1 }}>Start AI Mastery</Link>
            </motion.div>
          </motion.div>

          <div className="all-courses-summary">
            <h3>Explore More Learning Topics</h3>
            <p>Website Design • Social Media Marketing • E-commerce • Affiliate Marketing • Freelancing • And More</p>
            <div className="value-proposition">
              <p className="total-value">Planned premium: <span className="highlight">$47 / month</span></p>
              <p className="membership-price">Existing learning: <span className="highlight">FREE</span></p>
            </div>
            {/* <OfferComparison /> */}
          </div>
        </div>
      </motion.section>

      {/* Vault Section - Weekly Playbooks */}
      <motion.section 
        className="vault-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '4rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <motion.div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: '3rem'
            }}
          >
            <motion.div
              style={{ flex: 1, color: 'white' }}
              variants={textRevealVariants}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <MdInventory style={{ fontSize: '2.5rem' }} />
                <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', margin: 0, fontWeight: 700 }}>
                  The Vault
                </h2>
              </div>
              <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.95, fontWeight: 500 }}>
                Practical Guides for Your Next Step
              </p>
              <p style={{ fontSize: '1rem', lineHeight: '1.8', opacity: 0.9, marginBottom: '2rem' }}>
                Explore the learning resources available in your account. The planned premium offer includes training, community, and ongoing tools; new purchases are not enabled yet.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {[
                  'Explore available playbooks',
                  'Step-by-step implementation guides',
                  'Practical learning examples',
                  'Downloadable templates & resources'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    <FaCheckCircle style={{ color: '#10b981', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={user ? "/vault" : "/register"}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  color: '#764ba2',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <FaBook /> {user ? 'Access The Vault' : 'Explore Your Learning'}
              </Link>
            </motion.div>
            <motion.div
              style={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
              variants={cardVariants}
            >
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '100%'
              }}>
                <div style={{ color: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Learn</div>
                  <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem' }}>At Your Own Pace</div>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem',
                  color: 'white'
                }}>
                  {[
                    { label: 'AI Marketing', icon: '🤖' },
                    { label: 'Funnels', icon: '📊' },
                    { label: 'Email', icon: '📧' },
                    { label: 'Automation', icon: '⚡' }
                  ].map((topic, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{topic.icon}</div>
                      <div style={{ fontSize: '0.875rem' }}>{topic.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* AI Education Section */}
      <motion.section 
        className="ai-education-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Static Background */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(147, 51, 234, 0.05) 100%)',
            backgroundSize: '200% 200%',
            zIndex: 0
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            🚀 Build Your AI Marketing Skills
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Explore AI concepts and practical ways to apply them to your business
          </motion.p>
          
          <motion.div 
            className="ai-features-grid"
            variants={containerVariants}
          >
            {[
              { icon: FaRobot, title: 'AI Fundamentals', desc: 'Master the basics of AI and machine learning. Learn how to use AI tools to automate tasks, analyze data, and make data-driven decisions that drive real results.' },
              { icon: FaBrain, title: 'Prompt Engineering', desc: 'Learn to craft effective prompts that get the best results from AI tools. Create compelling content, generate ideas, and optimize your marketing copy with precision.' },
              { icon: FaCode, title: 'AI Automation', desc: 'Discover how to automate your marketing workflows with AI. Save time, reduce errors, and scale your marketing efforts efficiently with cutting-edge tools.' }
            ].map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <motion.div 
                  key={idx}
                  className="ai-feature-card"
                  variants={cardVariants}
                  whileHover="hover"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',

                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent)',
                    }}
                    whileHover={{
                      left: '100%',
                    }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut'
                    }}
                  />
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover="hover"
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <IconComponent className="ai-feature-icon" />
                  </motion.div>
                  <h3 className="ai-feature-title" style={{ position: 'relative', zIndex: 1 }}>{feature.title}</h3>
                  <p className="ai-feature-description" style={{ position: 'relative', zIndex: 1 }}>{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="ai-cta-container">
            <Link 
              to={user ? "/dashboard" : "/register"}
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
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <FaRocket /> Start Learning Free
            </Link>
          </div>
        </div>
      </motion.section>

      {/* AI Visibility Pilot Section */}
      <motion.section 
        className="ai-briefings-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{
          background: '#0f172a',
          padding: '4rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
            zIndex: 0
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}
            variants={textRevealVariants}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <FaBrain style={{ fontSize: '2rem', color: '#8b5cf6' }} />
              <span style={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                In Preparation
              </span>
            </div>
            <h2 style={{ 
              fontSize: isMobile ? '1.75rem' : '2.5rem', 
              color: 'white', 
              marginBottom: '1rem',
              fontWeight: 700 
            }}>
              AI Visibility Pilot
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'rgba(255,255,255,0.7)', 
              maxWidth: '600px', 
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              Three questions. Three prioritized actions. Source links and check times. Live scans are not available yet.
            </p>
          </motion.div>

          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1.5rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}
            variants={containerVariants}
          >
            {[
              {
                icon: '📊',
                title: 'Search Observations',
                desc: 'The planned snapshot uses three web-search-enabled AI API responses. It does not measure every AI product.'
              },
              {
                icon: '💡',
                title: 'Three Saved Actions',
                desc: 'Prioritized next steps based on the observed responses, with source links and check times.'
              },
              {
                icon: '🎯',
                title: 'Clear Limits',
                desc: 'Results can vary across models, prompts, and time. A snapshot is not a ranking guarantee.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover="hover"
                style={{
                  background: 'rgba(255,255,255,0.05)',

                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            style={{ textAlign: 'center', marginTop: '2.5rem' }}
            variants={textRevealVariants}
          >
            <Link
              to="/visibility-pilot"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                transition: 'transform 0.2s ease'
              }}
            >
              <FaBrain /> View Pilot Preparation
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Support & Guidance Section */}
      <motion.section 
        className="support-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{ background: '#f9fafb', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}
      >
        {/* Static Background Pattern */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.05) 0%, transparent 50%)',
            zIndex: 0
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            Support for Your Next Step
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Explore the support options available in your account
          </motion.p>
          
          <motion.div 
            className="support-grid"
            variants={containerVariants}
          >
            {/* AI Assistant Card */}
            <motion.div 
              className="support-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <motion.div
                variants={iconVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover="hover"
              >
              <FaRobot className="support-icon" />
              </motion.div>
              <h3>AI Marketing Assistant</h3>
              <p>
                Explore the tools available in your dashboard. AI responses can be incomplete or incorrect; review them before acting.
              </p>
              <Link to="/dashboard" className="support-cta">
                <FaRobot /> Chat with AI Assistant
              </Link>
            </motion.div>

            {/* 1-on-1 Coaching Card */}
            <motion.div 
              className="support-card premium"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                border: '2px solid rgba(5, 150, 105, 0.3)',
                boxShadow: '0 8px 32px rgba(5, 150, 105, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span className="premium-badge">
                Premium Support
              </span>
              <motion.div
                variants={iconVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover="hover"
              >
              <FaUsers className="support-icon" />
              </motion.div>
              <h3>1-on-1 Business Coaching</h3>
              <p>
                Review the coaching information for current availability and terms. A coaching session is not promised with free access.
              </p>
              <Link to="/coaching" className="support-cta">
                <FaUsers /> Explore Coaching
              </Link>
            </motion.div>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
              <strong>Check your access:</strong> Available support depends on your account and the terms of each service.
            </p>
            <p style={{ margin: 0, color: '#2563eb', fontWeight: 600 }}>
              Check availability • Review terms • Keep learning
            </p>
          </div>
        </div>
      </motion.section>

      {/* Affiliate Program Section */}
      <motion.section 
        className="affiliate-program-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container">
          <h2 className="section-title">The Revenue Ripple Affiliate Program</h2>
          <h3 className="section-subtitle">New affiliate and paid reseller terms remain under review</h3>
          
          <div className="affiliate-content">
            <div className="affiliate-text">
              <p className="affiliate-description">
                Learn about referral marketing while program terms are reviewed. New affiliate and paid reseller enrollment is not being offered in this pilot, and no earnings are guaranteed.
              </p>
              <Link to="/membership" className="affiliate-cta">View Program Status</Link>
            </div>

            <div className="affiliate-image">
              <img loading="lazy" decoding="async" width="1472" height="832"
                src="/assets/images/images/ebook-explosion.png" 
                alt="Affiliate Program Materials" 
                className="responsive-image"
              />
            </div>

            <div className="affiliate-text">
              <p className="affiliate-description">
                The images show existing program materials and interface examples. They do not promise access, commissions, payouts, or future results. Review current program status before making plans.
              </p>
              <div className="affiliate-visual-highlight">
                <img loading="lazy" decoding="async" width="2880" height="1556" src="/assets/images/images/Affilate-reseller-earnings-dash.png" alt="Affiliate Dashboard Preview" className="responsive-image" />
                <p className="caption">Interface example. No earnings or payouts are promised.</p>
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
        transition={{ duration: 0.4 }}
      >
        <div className="container">
          <h2 className="section-title">WHAT IS REVENUE RIPPLE?</h2>
          <p className="what-is-description" style={{ lineHeight: '1.7', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Revenue Ripple is a place to build practical marketing skills and apply them to your business. Your existing free learning continues while we prepare an evidence-based AI visibility tool. The planned snapshot presents three search observations and three prioritized actions with source links and check times. It is not a visibility score or a promise of future mentions. The owner pilot is preparation-only; live scans and new premium purchases are not available yet.
          </p>
          <div className="workspace-image">
            <img loading="lazy" decoding="async" width="1472" height="832" src="/assets/images/images/rev-rip-pic.png" alt="Clean modern workspace with Revenue Ripple platform" />
          </div>
          <div className="what-is-cta-container">
            <a 
              href="#pricing-section" 
              className="what-is-cta primary"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('pricing-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              View the Planned Offer
            </a>
            <Link to="/visibility-pilot" className="what-is-cta secondary">View Pilot Preparation</Link>
          </div>
        </div>
      </motion.section>

      {/* Community Section removed per request */}

      {/* Text Message Testimonials Section */}
      <motion.section 
        className="sms-testimonials-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{ background: '#ffffff', padding: '4rem 0' }}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            Real Messages from Real Results
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
          >
            See what people are saying about Revenue Ripple
          </motion.p>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '2rem auto',
              padding: isMobile ? '0 1rem' : '0'
            }}
            variants={containerVariants}
          >
            {/* Testimonial 1 */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Today 6:12 PM
              </div>
              <div style={{
                background: '#e5e7eb',
                borderRadius: '18px',
                padding: '1rem',
                marginBottom: '1rem',
                position: 'relative'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  "My guy Donte made a my work flow that perfectly handles my YouTube video summary automation"
                </p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Today 4:37 PM
              </div>
              <div style={{
                background: '#e5e7eb',
                borderRadius: '18px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  "Working with Donte at Revenue Ripple has been an absolute game changer for my foundation. From the very beginning, he understood my vision on both a technical and emotional level; transforming it into a stunning, professional website that perfectly reflects our mission. Donte was hands-on, patient, and incredibly responsive, guiding me through every step of the process with clarity and care."
                </p>
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#059669',
                fontWeight: 600,
                textAlign: 'center',
                marginTop: '0.5rem'
              }}>
                — Nykiah Morgan, Founder
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Mon, Sep 22 at 3:21 PM
              </div>
              <div style={{
                background: '#e5e7eb',
                borderRadius: '18px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  "I've been learning so much about marketing and leads on revenue ripple, I seriously can't thank you enough! Applying the knowledge ive gained from the site, I've been able to generate and convert way more leads for my business 💪🔥"
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Limited Time Free Access Section */}
      <motion.section 
        id="pricing-section"
        className="no-free-trial-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container">
          <h2 className="section-title">Start Free. Add Tools When Ready.</h2>
          <h3>Your existing free learning stays available. New purchases are not enabled.</h3>
          <p className="no-free-trial-description" style={{ lineHeight: '1.7', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Existing free learning remains available. When scans launch, the free starter includes one completed three-question scan and three saved actions. One lifetime allowance; no monthly reset. Planned premium is $47 / month for training, community, and ongoing tools, including 10 scans per UTC calendar month. Credits reset on the first at 00:00 UTC, separately from billing. No rollover. Purchases are not enabled. No automatic enrollment.
          </p>
          <div className="no-free-trial-cta">
            <Link to={user ? "/dashboard" : "/register"} className="cta-button">
              Start Learning Free
            </Link>
          </div>
        </div>
      </motion.section>

      {/* PRICING PLANS SECTION - COMMENTED OUT FOR FREE ACCESS
      
      Uncomment this section when ready to re-enable paid plans
      
      <motion.section 
        id="pricing-section"
        className="pricing-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{ background: '#f9fafb', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            Choose Your Plan
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Select the plan that fits your journey
          </motion.p>
          
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: isMobile ? '0 1rem' : '0'
            }}
            variants={containerVariants}
          >
            {/* Monthly Builder Plan *}
            <motion.div 
              className="pricing-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>Monthly Builder</h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2563eb' }}>$47</span>
                <span style={{ color: '#6b7280', fontSize: '1rem' }}>/month</span>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Entry level access for early stage builders
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left' }}>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Core platform access
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Starter templates
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Community access
                </li>
              </ul>
              <a
                href="#"
                className="path-cta"
                style={{ display: 'block', width: '100%', textAlign: 'center' }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    sessionStorage.setItem('intended-plan', 'monthly');
                    window.location.href = '/register?plan=monthly';
                    return;
                  }
                  try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/create-membership-session`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...acquisitionForSubmission(), referrer_username: null })
                    });
                    const data = await response.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      console.error('Error creating checkout session:', data);
                      window.location.href = '/checkout?product=membership';
                    }
                  } catch (error) {
                    console.error('Error creating checkout session:', error);
                    window.location.href = '/checkout?product=membership';
                  }
                }}
              >
                Get Started
              </a>
            </motion.div>

            {/* Quarterly Growth Plan - Recommended *}
            <motion.div 
              className="pricing-card featured"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.3)',
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                transform: isMobile ? 'none' : 'scale(1.05)',
                zIndex: 2
              }}
            >
              <span className="featured-badge" style={{ 
                background: '#2563eb',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '1rem',
                display: 'inline-block'
              }}>
                Recommended
              </span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>Quarterly Growth</h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2563eb' }}>$129</span>
                <span style={{ color: '#6b7280', fontSize: '1rem' }}>/3 months</span>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Designed for builders focused on momentum over 90 days
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left' }}>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Everything in Monthly Builder
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  One onboarding or strategy call
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Quarterly roadmap or automation setup
                </li>
              </ul>
              <a
                href="#"
                className="path-cta featured"
                style={{ display: 'block', width: '100%', textAlign: 'center' }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    sessionStorage.setItem('intended-plan', 'quarterly');
                    window.location.href = '/register?plan=quarterly';
                    return;
                  }
                  try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/create-quarterly-growth-session`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...acquisitionForSubmission(), referrer_username: null })
                    });
                    const data = await response.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      console.error('Error creating checkout session:', data);
                      window.location.href = '/checkout';
                    }
                  } catch (error) {
                    console.error('Error creating checkout session:', error);
                    window.location.href = '/checkout';
                  }
                }}
              >
                Get Started
              </a>
            </motion.div>

            {/* Founder Annual Plan *}
            <motion.div 
              className="pricing-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                border: '2px solid rgba(37, 99, 235, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>Founder Annual</h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2563eb' }}>$470</span>
                <span style={{ color: '#6b7280', fontSize: '1rem' }}>/year</span>
              </div>
              <p style={{ color: '#059669', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                Save $94/year vs monthly
              </p>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Best value for committed builders
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left' }}>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Everything in Quarterly Growth
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Founder badge
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Locked in pricing
                </li>
                <li style={{ padding: '0.75rem 0', color: '#4b5563', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#2563eb', marginRight: '0.5rem', marginTop: '0.25rem', flexShrink: 0 }} />
                  Early feature access
                </li>
              </ul>
              <Link 
                to="/founders-checkout" 
                className="path-cta"
                style={{ display: 'block', width: '100%', textAlign: 'center' }}
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Payment Security Section *}
          <div style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '12px',
            maxWidth: '800px',
            margin: '3rem auto 0'
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              Secure Payment Powered By
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>Stripe</div>
              <div style={{ fontSize: '0.875rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>🔒</span> SSL Encrypted
              </div>
              <div style={{ fontSize: '0.875rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>✅</span> 30-Day Guarantee
              </div>
            </div>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#9ca3af', 
              marginTop: '0.5rem'
            }}>
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </motion.section>
      
      END OF PRICING PLANS SECTION */}

      {/* FAQ Section */}
      <motion.section 
        className="faq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{ padding: '4rem 0', background: '#ffffff' }}
      >
        <div className="container">
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Everything you need to know about Revenue Ripple
          </motion.p>
          <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <FAQAccordion faqs={[
  {
    "q": "What exactly do I get with free access?",
    "a": "Your existing free learning resources remain available. At scan launch, the free starter will include one completed three-question scan and three saved actions, once per account with no monthly reset."
  },
  {
    "q": "Is Revenue Ripple really free?",
    "a": "Existing free learning continues. Planned premium is $47 per month, with no automatic enrollment. New premium purchases are not enabled yet."
  },
  {
    "q": "What are the Vault playbooks?",
    "a": "The Vault contains practical learning materials. Check your account for current access. No weekly publishing schedule is promised here."
  },
  {
    "q": "What is the AI visibility pilot?",
    "a": "The owner-only pilot is in preparation. Live scans are not available yet. The planned tool presents three search observations, three actions, source links, and check times."
  },
  {
    "q": "What will a scan measure?",
    "a": "Three web-search-enabled AI API responses to a small question set. It is not a measurement of every AI product or a guarantee of rankings, mentions, sales, or revenue."
  },
  {
    "q": "Do I need prior marketing experience?",
    "a": "Start with the learning resources that fit your experience. Work at your own pace; no results or completion timeline are guaranteed."
  },
  {
    "q": "What does planned premium include?",
    "a": "Training, community, and ongoing tools, including 10 scans per UTC calendar month. Credits reset on the first at 00:00 UTC, separately from billing. No rollover."
  },
  {
    "q": "How does the affiliate program work?",
    "a": "New affiliate and paid reseller terms remain under review. This pilot does not offer new paid reseller enrollment or promise commissions or earnings."
  },
  {
    "q": "Can I run a scan now?",
    "a": "No. The owner-only pilot currently shows preparation status. Live scans remain unavailable while infrastructure and secure credentials are completed."
  },
  {
    "q": "Will I be enrolled automatically?",
    "a": "No automatic enrollment. Purchases are not enabled, and your existing free learning remains available."
  }
]} />
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        className="final-cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container">
          <h2 className="section-title">Ready for Your Next Learning Step?</h2>
          <p className="cta-description" style={{ lineHeight: '1.6', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Keep using your existing free learning resources while the owner-only AI visibility pilot is prepared.
            Live scans and new premium purchases are not available yet.
          </p>
        
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to={user ? "/dashboard" : "/register"} className="cta-button">
              Start Learning Free
            </Link>
          </div>
        </div>
      </motion.section>


      {/* Mobile Sticky CTA */}
      {isMobile && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
          position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '2px solid #e5e7eb',
            padding: '1rem',
            zIndex: 1000,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Link
            to={user ? "/dashboard" : "/register"}
            className="cta-button"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
              padding: '1rem',
              borderRadius: '12px',
          fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <FaRocket style={{ marginRight: '0.5rem', display: 'inline' }} />
            Start Learning Free
          </Link>
        </motion.div>
      )}

      {/* Live Activity Feed */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 999,
          maxWidth: '300px'
        }}>
          <AnimatePresence>
            {recentActivity.slice(0, 1).map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: idx * 2 }}
                style={{
                  background: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}
              >
                <span style={{ color: '#059669', fontWeight: 600, marginRight: '0.5rem' }}>✓</span> 
                {activity}
              </motion.div>
            ))}
      </AnimatePresence>
        </div>
      )}

    </div>
  );
}