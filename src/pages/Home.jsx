import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import StickyCTA from '../components/StickyCTA';
import GuaranteeBlock from '../components/GuaranteeBlock';
import TrustBadges from '../components/TrustBadges';
import FAQAccordion from '../components/FAQAccordion';
import OfferComparison from '../components/OfferComparison';
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
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -20]);
  // Removed opacity transform to prevent hero from fading out

  useEffect(() => {
    // Hotjar Tracking Code for Revenue Ripple
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:6531289,hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

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
      {/* Hero Section with Parallax */}
      <motion.section 
        ref={heroRef}
        className="hero"
        style={{ y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated Background Gradient */}
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
            filter: 'blur(100px)'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear'
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
            Stop Struggling with Marketing.
            <span style={{ display: 'block', marginTop: '0.5rem', color: '#2563eb', opacity: 1 }}>
              Get Results in 30 Days.
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
            Master AI-powered marketing with our proven system. Learn the exact strategies that generate real revenue - no fluff, just results.
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
                  Begin Checkout - $47/month
              </Link>
            )}
          </div>
          <div className="max-w-xl mx-auto">
            <GuaranteeBlock />
            <TrustBadges />
          </div>
        </div>
      </motion.section>

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
              }}>Why Revenue Ripple Works</h2>
              <h3 style={{ 
                lineHeight: '1.5', 
                letterSpacing: '0.2px', 
                marginBottom: isMobile ? '2.5rem' : '1.5rem',
                fontSize: isMobile ? '1.375rem' : '1.5rem',
                textAlign: isMobile ? 'center' : 'left'
              }}>We focus on what actually generates revenue:</h3>
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
                    Learn the latest AI marketing strategies that your competitors don't know yet.
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
                    }}>Proven Learning Paths:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Follow step-by-step roadmaps that get you from zero to first sale in 30 days.
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
                    }}>Earn While You Learn:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Access our exclusive affiliate program to start making money immediately.
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
                    }}>No Fluff:</strong>
                  </div>
                  <div style={{ paddingLeft: isMobile ? '2.25rem' : '1.5rem' }}>
                    Every course is designed to generate real results, not just theory.
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to={user ? "/checkout" : "/register"} className="cta-button">
                  <FaHandshake style={{ marginRight: '8px' }} />
                  Start Your 30-Day Journey - $47/month
                </Link>
                <div className="max-w-xl mx-auto"><GuaranteeBlock /><TrustBadges /></div>
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

      {/* Stats Section with Stagger Animations */}
      <motion.section 
        className="stats-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.div 
            className="stats-grid"
            variants={containerVariants}
          >
            <motion.div 
              className="stat-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div>
              <FaBook className="stat-icon" />
              </div>
              <div className="stat-number">
                Step-By-Step
              </div>
              <p className="stat-label">Playbooks</p>
              <Link to="/playbooks" className="stat-cta">Explore Playbooks</Link>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div>
              <FaGraduationCap className="stat-icon" />
              </div>
              <div className="stat-number">
                Up-To-Date
              </div>
              <p className="stat-label">Trainings</p>
              <Link to="/training" className="stat-cta">Start Learning</Link>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div>
              <FaHeadset className="stat-icon" />
              </div>
              <div className="stat-number">
                All Your
              </div>
              <p className="stat-label">Questions Answered</p>
              <Link to="/support" className="stat-cta">Get Support</Link>
            </motion.div>
            
            <motion.div 
              className="stat-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div>
              <FaUsers className="stat-icon" />
              </div>
              <div className="stat-number">
                500+
              </div>
              <p className="stat-label">Active Users</p>
              <Link to="/community" className="stat-cta">Join Community</Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

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
            Choose Your Path to Success
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Follow these proven learning paths to get results fast
          </motion.p>
          
          <motion.div 
            className="learning-paths-grid"
            variants={containerVariants}
          >
            {/* Get Your First Sale Path */}
            <motion.div 
              className="learning-path-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)',
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
                <h3>Get Your First Sale</h3>
                <p className="path-duration">30 Days</p>
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
              <Link to={user ? "/checkout" : "/register"} className="path-cta">Start This Path</Link>
            </motion.div>

            {/* Scale Your Business Path */}
            <motion.div 
              className="learning-path-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)',
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
                <p className="path-duration">60 Days</p>
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
              <Link to={user ? "/checkout" : "/register"} className="path-cta">Start This Path</Link>
            </motion.div>

            {/* Master AI Marketing Path */}
            <motion.div 
              className="learning-path-card featured"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
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
                <p className="path-duration">45 Days</p>
                <span className="featured-badge">
                  Most Popular
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
              <Link to={user ? "/checkout" : "/register"} className="path-cta featured" style={{ position: 'relative', zIndex: 1 }}>Start AI Mastery</Link>
            </motion.div>
          </motion.div>

          <div className="all-courses-summary">
            <h3>Plus 20+ Additional Courses</h3>
            <p>Website Design • Social Media Marketing • E-commerce • Affiliate Marketing • Freelancing • And More</p>
            <div className="value-proposition">
              <p className="total-value">Total Value: <span className="strikethrough">$2,758</span></p>
              <p className="membership-price">Your Price: <span className="highlight">$47/month</span></p>
            </div>
            <OfferComparison />
          </div>
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
        {/* Animated Background */}
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
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            🚀 Master AI Marketing (Your Competitive Edge)
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            While others struggle with outdated tactics, you'll dominate with AI-powered strategies
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
                    backdropFilter: 'blur(10px)',
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
              to={user ? "/checkout" : "/register"}
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
              <FaRocket /> Begin Checkout - $47/month
            </Link>
          </div>
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
        {/* Animated Background Pattern */}
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
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            className="section-title"
            variants={textRevealVariants}
          >
            Still Need Help? We've Got You Covered
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            variants={textRevealVariants}
            transition={{ delay: 0.2 }}
          >
            Get personalized support when you need it most
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
                backdropFilter: 'blur(10px)',
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
                Get instant answers to your marketing questions. Our AI assistant is trained on all our courses and can help you apply strategies to your specific business.
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
                backdropFilter: 'blur(10px)',
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
                Book a personal strategy session with our marketing experts. Get tailored advice for your specific business challenges and accelerate your growth.
              </p>
              <Link to="/coaching" className="support-cta">
                <FaUsers /> Book Coaching Call
              </Link>
            </motion.div>
          </motion.div>

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
        transition={{ duration: 0.4 }}
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
        transition={{ duration: 0.4 }}
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
            What Our Members Say
          </motion.h2>
          <motion.div 
            className="testimonials-grid"
            variants={containerVariants}
          >
            {/* Initial testimonials that are always shown */}
            <motion.div 
              className="testimonial-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <div className="stars">
                ★★★★★
              </div>
              <p className="testimonial-text">"Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates since implementing their strategies."</p>
              <div className="testimonial-author">
                <img 
                  src="/assets/images/images/profile-pic1.png" 
                  alt="Profile of Sarah Johnson" 
                  className="testimonial-avatar"
                />
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Digital Marketing Consultant</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="testimonial-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <div className="stars">
                ★★★★★
              </div>
              <p className="testimonial-text">"The ROI from implementing Revenue Ripple's strategies has been incredible. Their step-by-step approach made complex marketing concepts easy to understand and implement."</p>
              <div className="testimonial-author">
                <motion.img 
                  src="/assets/images/images/profile-pic2.png" 
                  alt="Profile of Michael Chen" 
                  className="testimonial-avatar"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <div className="author-info">
                  <h4>Gloria Chen</h4>
                  <p>E-commerce Entrepreneur</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="testimonial-card"
              variants={cardVariants}
              whileHover="hover"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <div className="stars">
                ★★★★★
              </div>
              <p className="testimonial-text">"As a beginner in digital marketing, I was overwhelmed until I found Revenue Ripple. Their platform gave me the confidence and skills I needed to launch my own agency."</p>
              <div className="testimonial-author">
                <motion.img 
                  src="/assets/images/images/profile-pic3.png" 
                  alt="Profile of Paul Rodriguez" 
                  className="testimonial-avatar"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <div className="author-info">
                  <h4>Paul Rodriguez</h4>
                  <p>Agency Founder</p>
                </div>
              </div>
            </motion.div>

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
          </motion.div>
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

      {/* Community Section removed per request */}

      {/* No Free Trial Section */}
      <motion.section 
        className="no-free-trial-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
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
            <Link to={user ? "/checkout" : "/register"} className="cta-button">
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
        transition={{ duration: 0.4 }}
      >
        <div className="container">
          <h2 className="section-title">Ready to Transform Your Marketing?</h2>
          <p className="cta-description" style={{ lineHeight: '1.6', letterSpacing: '0.3px', wordSpacing: '0.8px' }}>
            Join thousands of successful marketers who have already transformed their businesses with Revenue Ripple.
            Start your journey today and get instant access to all our premium features.
          </p>
        
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to={user ? "/checkout" : "/register"} className="cta-button">
              Join Now for Only $47/month
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Floating See More Reviews Button */}
      <AnimatePresence>
        <motion.button
        onClick={() => setShowTestimonialModal(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '32px',
          right: isMobile ? '16px' : '32px',
          zIndex: 1200,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: isMobile ? '0.625rem 1rem' : '0.75rem 1.5rem',
          fontWeight: 600,
          fontSize: isMobile ? '0.875rem' : '1rem',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
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
        </motion.button>
      </AnimatePresence>
      {/* Testimonial Modal Overlay */}
      <AnimatePresence>
      {showTestimonialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowTestimonialModal(false)}
        >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(20px)',
              borderRadius: isMobile ? '0.5rem' : '1rem',
              maxWidth: '700px',
              width: isMobile ? '95vw' : '90vw',
              maxHeight: isMobile ? '90vh' : '80vh',
              overflowY: 'auto',
              padding: isMobile ? '1rem' : '2rem',
              position: 'relative',
              margin: isMobile ? '0.5rem' : '0',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTestimonialModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              aria-label="Close"
            >
              ×
            </motion.button>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2563eb' }}
            >
              What Our Members Say
            </motion.h2>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
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
            </motion.div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}