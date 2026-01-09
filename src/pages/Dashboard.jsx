import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { supabase } from '../supabase/client.jsx';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import AIAssistantWidget from '../components/AIAssistantWidget';
import OnboardingModal from '../components/OnboardingModal';
import TestimonialCarousel from '../components/TestimonialCarousel';
import MemberRoleUpdateModal from '../components/MemberRoleUpdateModal.jsx';
import VaultPreview from '../components/VaultPreview';
import '../pages.css';

// Add styles for the learning path options and progress bars
const learningPathStyles = `
  .learning-path-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .path-option {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 4px solid #e5e7eb;
  }
  
  .path-option.featured {
    background: #dbeafe;
    border-left-color: #2563eb;
  }
  
  .path-option h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }
  
  .path-option p {
    margin: 0 0 0.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .path-option ul {
    margin: 0;
    padding-left: 1rem;
  }
  
  .path-option li {
    color: #374151;
    font-size: 0.875rem;
  }
  
  /* Progress bar styles */
  .progress-bar-container {
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .progress-bar-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = learningPathStyles;
  document.head.appendChild(styleSheet);
}
import { 
  FaMoneyBillWave, 
  FaChartBar, 
  FaGraduationCap, 
  FaLightbulb, 
  FaGlobe, 
  FaShareAlt, 
  FaShoppingCart, 
  FaUsers, 
  FaFunnelDollar, 
  FaBriefcase, 
  FaRobot, 
  FaUserPlus, 
  FaFlask, 
  FaUserTie, 
  FaImage, 
  FaBook, 
  FaChartLine, 
  FaBell,
  FaRocket
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, signOut, refreshUserData } = useAuth();
  const { isMember, isAffiliate } = useUserRole();
  const [expandedSection, setExpandedSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userIntent, setUserIntent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalShipments: 0,
    totalCommissions: 0,
    lowStockItems: 0
  });
  const [courseProgress, setCourseProgress] = useState({});
  const reload = localStorage.getItem("reloadPage")

  console.log("reee", typeof(reload))



  // Check for first-time user onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    const savedUserIntent = localStorage.getItem('userIntent');
    
    if (!hasOnboarded) {
      // Small delay to let the page load before showing modal
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
    } else {
      setUserIntent(savedUserIntent);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    const savedUserIntent = localStorage.getItem('userIntent');
    setUserIntent(savedUserIntent);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Simulate async loading for better feedback
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Fetch all course progress for the user
  useEffect(() => {
    const fetchAllProgress = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_progress')
        .select('course_id, percent_done')
        .eq('user_id', user.id);
      if (error) {
        setError('Failed to fetch progress');
        return;
      }
      // Map course_id to percent_done
      const progressMap = {};
      if (data) {
        data.forEach(row => {
          progressMap[row.course_id] = row.percent_done;
        });
      }
      setCourseProgress(progressMap);
    };
    fetchAllProgress();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  useEffect(() => {

    
    if(reload === "true") {
      window.location.reload();
      localStorage.setItem("reloadPage", false)
    }
   },[reload])

  const handleJoinAffiliate = () => {
    setIsModalOpen(true)
   
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReferralTracker />
      {/* Persistent nav for key dashboard features */}
      <Navbar
        navLinks={[
          { to: '/dashboard', label: 'Dashboard', icon: <FaChartBar /> },
          { to: '/affiliate-centre/stats', label: 'Affiliate Stats', icon: <FaFunnelDollar /> },
          { to: '/courses', label: 'My Courses', icon: <FaGraduationCap /> },
          { to: '/support', label: 'Support', icon: <FaUserTie /> }
        ]}
      />
      <AIAssistantWidget />

      {/* User Intent Welcome Message */}
      {userIntent && !showOnboarding && (
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
          margin: '1rem 2rem',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            padding: '0.5rem',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            {userIntent === 'learn' ? <FaGraduationCap /> : userIntent === 'earn' ? <FaMoneyBillWave /> : <FaRocket />}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1.1rem', fontWeight: '600' }}>
              {userIntent === 'learn' && "Welcome to your learning journey! 🎓"}
              {userIntent === 'earn' && "Ready to start earning? 💰"}
              {userIntent === 'both' && "Let's learn and earn together! 🚀"}
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', color: '#3730a3', fontSize: '0.95rem' }}>
              {userIntent === 'learn' && "Check out our recommended courses below to get started"}
              {userIntent === 'earn' && "Explore the affiliate centre to start building your income"}
              {userIntent === 'both' && "Master marketing skills while building multiple income streams"}
            </p>
          </div>
          <Link 
            to={userIntent === 'learn' ? '/courses' : userIntent === 'earn' ? '/affiliate-centre' : '/courses'}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1d4ed8';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2563eb';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Get Started
          </Link>
        </div>
      )}
      {loading ? (
        <div className="spinner" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </div>
      ) : (
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <div className="container">
            <h1 className="dashboard-title">Welcome to Revenue Ripple</h1>
            <p className="dashboard-welcome">Hello, Good To See You {user?.name?.toUpperCase() || 'Guest'}</p>
          </div>
        </header>

        <div className="container dashboard-content flex flex-wrap md:flex-nowrap">
          {/* Main Content - Left Side */}
          <div className="main-content w-full md:w-2/3 pr-0 md:pr-8">
            {/* <h2 className="section-overview-title mb-4 mt-2">Your Success Dashboard</h2> */}
            {/* Affiliate Program Section */}
            {isMember &&
            <div className="section mb-8">
              <div className="section-header affiliate">
                <FaMoneyBillWave className="section-icon" />
                <h2>JOIN THE MEMBER EXCLUSIVE AFFILIATE PROGRAM</h2>
              </div>
              <div className="section-content">
                <div
                  className={`course-item ${expandedSection === 'affiliate-paid' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('affiliate-paid')}
                  role="button"
                  aria-expanded={expandedSection === 'affiliate-paid'}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('affiliate-paid'); }}
                >
                  <h3>
                    Get Paid Every Month Like Clockwork
                  </h3>
                  {expandedSection === 'affiliate-paid' && (
                    <div className="course-details">
                      <p>As someone who truly appreciates having you on board, I wanted to extend a personal invitation to you. We've got this awesome MEMBER EXCLUSIVE affiliate program that you've gotta check out. It's a sweet deal - you earn every penny for every other member that signs up through your special link. I'm talkin' $47.00 every single month for every 2 people you send our way, and we send it directly to your Paypal account. No waiting for an affiliate check or any of that nonsense.</p>
                                              <p>To join, just <span 
                          // href="/affiliate/sign-up" 
                          style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: '500' }}
                          onClick={(e) => {e.stopPropagation()
                            handleJoinAffiliate("member")
                          }}
                        >click here</span>.</p>
                      <p>Now listen up, because this part's important. Your affiliate account (and all your sweet, sweet payments) will only stay active as long as your membership subscription is active. So don't cancel, or you'll miss out on all the cash. And that's not what we want, is it?</p>
                      <p>My goal is for us to make money together, not just for me. That's why I'm tellin' you, the fastest way to earn is by promoting the membership itself. Sell it once, and you'll get paid every single month. That's my cup of tea, and it should be yours too. So get out there and sign up 2 members - that way, your own fee is more than covered. Let's do this thing!                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {isMember &&
                        <button
                          // href="/affiliate/sign-up"
                          className="cta-link"
                          onClick={(e) => {e.stopPropagation()
                            handleJoinAffiliate("member")
                          }}
                          style={{
                            background: '#2563eb',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#1d4ed8';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#2563eb';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <span><FaUserPlus style={{ marginRight: '8px' }} /> Join Our Affiliate Program</span>
                        </button>
}
                        <Link 
                          to="/affiliate-centre/tools" 
                          className="cta-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span><FaShareAlt style={{ marginRight: '8px' }} /> Go to the Affiliate tools page</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <hr className="section-divider" />
              </div>
            </div>}

            {/* Community Section */}
            <div className="section mb-8">
              <div className="section-header" style={{ backgroundColor: '#10b981', color: 'white' }}>
                <FaUsers className="section-icon" />
                <h2>JOIN OUR COMMUNITY</h2>
              </div>
              <div className="section-content">
                <div className="community-quick-links">
                  <div className="community-link-item">
                    <Link to="/community/forum" className="community-link">
                      <div className="community-link-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="community-link-content">
                        <h3>Community Forum</h3>
                        <p>Ask questions, share solutions, and connect with fellow entrepreneurs</p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="community-link-item">
                    <Link to="/community/success-stories" className="community-link">
                      <div className="community-link-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="community-link-content">
                        <h3>Success Stories</h3>
                        <p>Share your wins and get inspired by others' achievements</p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="community-link-item">
                    <a 
                      href="https://discord.gg/q2b6BDtsyr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="community-link"
                    >
                      <div className="community-link-icon">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <div className="community-link-content">
                        <h3>Discord Community</h3>
                        <p>Join real-time discussions and get instant support</p>
                      </div>
                    </a>
                  </div>
                </div>
                <hr className="section-divider" />
              </div>
            </div>

            {/* Vault Preview Section */}
            <VaultPreview />
            
            {/*Reseller Program Section*/}
            {isAffiliate && 
            <div className="section mb-8">
              <div className="section-header reseller">
                <FaShoppingCart className="section-icon" />
                <h2>EARN $1,000s EVERY MONTH ON AUTOPILOT</h2>
              </div>
              <div className="section-content">
                <div
                  className={`course-item ${expandedSection === 'reseller-paid' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('reseller-paid')}
                  role="button"
                  aria-expanded={expandedSection === 'reseller-paid'}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('reseller-paid'); }}
                >
                  <h3>
                    Premium Membership Reseller Program
                  </h3>
                  {expandedSection === 'reseller-paid' && (
                    <div className="course-details">
                      <p>
                        Listen up, 'cause I've got something pretty awesome to share with you. You know our sweet MEMBER EXCLUSIVE 
                        affiliate program? Well, now we've got something even better - our Reseller Program.
                      </p>
                      <p>
                        Have you ever dreamed of running your own premium membership site? Well, with this program, you can resell 
                        our $47.00 per month membership about making money online, and earn a whopping 100% commission on EVERY 
                        referal (as opposed to every other referal with the affiliate program) every single month. Yeah, you read 
                        that right. Every. Single. Month.
                      </p>
                      <p>
                        So if you're ready to take your earning potential to the next level, then click below to check it out. 
                        Trust me, this is a deal you don't want to miss.
                      </p>
                      <Link 
                        to="/special" 
                        className="cta-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span><FaShoppingCart style={{ marginRight: '8px' }} /> Join Reseller Program →</span>
                      </Link>
                    </div>
                  )}
                </div>
                <hr className="section-divider" />
              </div>
            </div>}
            
            {/* Learning Paths Section */}
            <div className="section mb-8">
              <div className="section-header suggested">
                <FaLightbulb className="section-icon" />
                <h2>CHOOSE YOUR SUCCESS PATH</h2>
              </div>
              <div className="section-content">
                <div className="suggested-content">
                  <p>Follow these proven learning paths to get results fast:</p>
                  
                  <div className="learning-path-options">
                    <div className="path-option">
                      <h4>🚀 Get Your First Sale (30 Days)</h4>
                      <p>Perfect for beginners who want to see results quickly</p>
                      <ul>
                        <li>AI Essentials → Email Marketing → Funnel Building → Paid Traffic</li>
                      </ul>
                    </div>
                    
                    <div className="path-option">
                      <h4>📈 Scale Your Business (60 Days)</h4>
                      <p>For those ready to grow their existing business</p>
                      <ul>
                        <li>Prompt Engineering → Marketing Automation → SEO → Social Media Marketing</li>
                      </ul>
                    </div>
                    
                    <div className="path-option featured">
                      <h4>🤖 Master AI Marketing (45 Days)</h4>
                      <p><strong>Most Popular:</strong> Stay ahead with AI-powered strategies</p>
                      <ul>
                        <li>AI Essentials → Prompt Engineering → AI Agent Fundamentals → Marketing Automation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p>Each path is designed to build upon previous knowledge and get you real results. Choose the path that matches your current goals.</p>
                </div>
                <hr className="section-divider" />
              </div>
            </div>

            {/* Digital Marketing Section */}
            <div className="section mb-8">
              <div className="section-header digital">
                <FaGlobe className="section-icon" />
                <h2>ULTIMATE DIGITAL MARKETING DOMINATION</h2>
              </div>
              <div className="section-content">
                <div
                  className={`course-item ${expandedSection === 'digital-email' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('digital-email')}
                  role="button"
                  aria-expanded={expandedSection === 'digital-email'}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('digital-email'); }}
                >
                  <h3>
                    The 12 Month Email Course In One Book
                  </h3>
                  {expandedSection === 'digital-email' && (
                    <div className="course-details">
                      <p>Master email marketing in record time with our comprehensive guide. Learn everything from list building to advanced automation in one complete package.</p>
                      <Link 
                        to="/assets/downloads/digital-marketing.pdf" 
                        className="cta-link" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span><FaBook style={{ marginRight: '8px' }} /> Get Complete Guide →</span>
                      </Link>
                    </div>
                  )}
                </div>
                <hr className="section-divider" />
              </div>
            </div>

            {/* Suggested Order Section */}
            <div className="section mb-8">
              <div className="section-header suggested">
                <FaLightbulb className="section-icon" />
                <h2>SUGGESTED ORDER TO WATCH ALL VIDEO COURSES</h2>
              </div>
              <div className="section-content">
                <div className="suggested-content">
                  <p>For the best learning experience, we recommend following this order:</p>
                  <ol>
                    <li>Start with <Link to="/courses/ai-essentials" className="course-link">AI Essentials</Link> to build your foundation in artificial intelligence.</li>
                    <li>Move on to <Link to="/courses/ai-agent-fundamentals" className="course-link">AI Agent Fundamentals</Link> to learn how to build and deploy AI agents.</li>
                    <li>Complete your AI journey with <Link to="/courses/prompt-engineering" className="course-link">Prompt Engineering</Link> to master AI interactions.</li>
                    <li>Then dive into <Link to="/courses/email-marketing" className="course-link">Email Marketing</Link> to learn how to build and nurture your audience.</li>
                    <li>Follow up with <Link to="/courses/lead-generation" className="course-link">Lead Generation</Link> to master attracting potential customers.</li>
                    <li>Learn <Link to="/courses/funnel-building" className="course-link">Funnel Building</Link> to convert leads into customers.</li>
                    <li>Master <Link to="/courses/paid-traffic" className="course-link">Paid Traffic</Link> to scale your marketing efforts.</li>
                    <li>Explore <Link to="/courses/social-marketing" className="course-link">Social Marketing</Link> for organic growth.</li>
                    <li>Dive into <Link to="/courses/seo" className="course-link">SEO</Link> for long-term traffic growth.</li>
                    <li>Finally, learn <Link to="/courses/automation" className="course-link">Marketing Automation</Link> to scale your efforts.</li>
                  </ol>
                  <p>This order ensures you build a strong foundation before moving on to more advanced topics. Each course builds upon the knowledge from previous ones.</p>
                </div>
                <hr className="section-divider" />
              </div>
            </div>

            {/* AI Section */}
            <div className="section mb-8">
              <div className="section-header ai">
                <FaRobot className="section-icon" />
                <h2>AI BUSINESS ACCELERATION</h2>
              </div>
              <div className="section-content">
                <div
                  className={`course-item ${expandedSection === 'ai-essentials' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('ai-essentials')}
                  role="button"
                  aria-expanded={expandedSection === 'ai-essentials'}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('ai-essentials'); }}
                >
                  <h3>
                    AI Essentials
                    <span className={`chevron ${expandedSection === 'ai-essentials' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'ai-essentials' ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </h3>
                  <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                    <div style={{ width: `${Math.max(courseProgress['ai-essentials'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                    {courseProgress['ai-essentials'] ?? 0}% Complete
                  </div>
                  {expandedSection === 'ai-essentials' && (
                    <div className="course-details">
                      <p>Build your foundation in artificial intelligence and learn how to leverage AI in your business:</p>
                      <ul>
                        <li>Understanding AI basics and terminology</li>
                        <li>AI applications in business operations</li>
                        <li>Getting started with popular AI tools</li>
                        <li>AI implementation strategies</li>
                        <li>Future of AI in business</li>
                      </ul>
                      <Link to="/courses/ai-essentials" className="cta-link">
                        <span><FaRobot style={{ marginRight: '8px' }} /> Start AI Essentials →</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div
                  className={`course-item ${expandedSection === 'ai-agent-fundamentals' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('ai-agent-fundamentals')}
                  role="button"
                  aria-expanded={expandedSection === 'ai-agent-fundamentals'}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('ai-agent-fundamentals'); }}
                >
                  <h3>
                    AI Agent Fundamentals
                    <span className={`chevron ${expandedSection === 'ai-agent-fundamentals' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'ai-agent-fundamentals' ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </h3>
                  <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                    <div style={{ width: `${Math.max(courseProgress['ai-agent-fundamentals'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                    {courseProgress['ai-agent-fundamentals'] ?? 0}% Complete
                  </div>
                  {expandedSection === 'ai-agent-fundamentals' && (
                    <div className="course-details">
                      <p>Master the art of building and deploying AI agents for your business:</p>
                      <ul>
                        <li>Understanding AI agents and their capabilities</li>
                        <li>Building your first AI agent</li>
                        <li>Advanced agent features and integration</li>
                        <li>Automation workflows with AI agents</li>
                        <li>Scaling business operations with AI</li>
                      </ul>
                      <Link to="/courses/ai-agent-fundamentals" className="cta-link">
                        <span><FaRobot style={{ marginRight: '8px' }} /> Master AI Agents →</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div
                  className={`course-item ${expandedSection === 'prompt-engineering' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('prompt-engineering')}
                  role="button"
                  aria-expanded={expandedSection === 'prompt-engineering'}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('prompt-engineering'); }}
                >
                  <h3>
                    Prompt Engineering
                    <span className={`chevron ${expandedSection === 'prompt-engineering' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'prompt-engineering' ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </h3>
                  <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                    <div style={{ width: `${Math.max(courseProgress['prompt-engineering'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                    {courseProgress['prompt-engineering'] ?? 0}% Complete
                  </div>
                  {expandedSection === 'prompt-engineering' && (
                    <div className="course-details">
                      <p>Learn how to craft effective prompts for optimal AI interactions:</p>
                      <ul>
                        <li>Fundamentals of prompt design</li>
                        <li>Advanced prompt techniques</li>
                        <li>Real-world applications and case studies</li>
                        <li>Optimizing AI responses</li>
                        <li>Best practices for different AI models</li>
                      </ul>
                      <Link to="/courses/prompt-engineering" className="cta-link">
                        <span><FaRobot style={{ marginRight: '8px' }} /> Master Prompt Engineering →</span>
                      </Link>
                    </div>
                  )}
                </div>
                <hr className="section-divider" />
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="section mb-8">
              <div className="section-header coming-soon">
                <FaFlask className="section-icon" />
                <h2>COMING SOON: EXCITING NEW FEATURES</h2>
              </div>
              <div className="section-content">
                <div className="coming-soon-content">
                  <p>We're constantly working to bring you the latest and most effective business strategies. Here's what's coming soon:</p>
                  
                  <div className="coming-soon-grid">
                    <div className="coming-soon-item">
                      <FaChartLine className="coming-soon-icon" />
                      <h3>Advanced Analytics Dashboard</h3>
                      <p>Track your business metrics in real-time with our new comprehensive analytics platform.</p>
                    </div>

                    <div className="coming-soon-item">
                      <FaUsers className="coming-soon-icon" />
                      <h3>Community Platform</h3>
                      <p>Connect with other entrepreneurs, share experiences, and grow your network.</p>
                    </div>

                    <div className="coming-soon-item">
                      <FaBriefcase className="coming-soon-icon" />
                      <h3>Business Automation Suite</h3>
                      <p>Streamline your operations with our new suite of automation tools.</p>
                    </div>

                    <div className="coming-soon-item">
                      <FaImage className="coming-soon-icon" />
                      <h3>AI Image Generation</h3>
                      <p>Create stunning visuals for your business using advanced AI image generation.</p>
                    </div>
                  </div>

                  <div className="coming-soon-cta">
                    <p>Want to be the first to know when these features launch?</p>
                    <Link to="/notifications" className="cta-link">
                      <span><FaBell style={{ marginRight: '8px' }} /> Enable Notifications →</span>
                    </Link>
                  </div>
                </div>
                <hr className="section-divider" />
              </div>
            </div>
          </div>

          {/* Side Content - Right Side */}
          <div className="side-content w-full md:w-1/3 mt-8 md:mt-0">
            <h2 className="section-overview-title mb-4 mt-2">Additional Tools & Advanced Training</h2>
            <div className="grid-layout">
              {/* Building Section */}
              <div className="section mb-8">
                <div className="section-header building">
                  <FaGraduationCap className="section-icon" />
                  <h2>FOUNDATION SKILLS</h2>
                </div>
                <div className="section-content">
                  <div
                    className={`course-item ${expandedSection === 'building-website' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-website')}
                    role="button"
                    aria-expanded={expandedSection === 'building-website'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('building-website'); }}
                  >
                    <h3>
                      Website Design
                      <span className={`chevron ${expandedSection === 'building-website' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'building-website' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['website-design'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['website-design'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'building-website' && (
                      <div className="course-details">
                        <p>Learn to build professional, responsive websites from scratch. Master HTML, CSS, and modern design principles.</p>
                        <Link to="/courses/website-design" className="cta-link">
                          <span>Start Building →</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div
                    className={`course-item ${expandedSection === 'building-funnel' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-funnel')}
                    role="button"
                    aria-expanded={expandedSection === 'building-funnel'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('building-funnel'); }}
                  >
                    <h3>
                      Funnel Building
                      <span className={`chevron ${expandedSection === 'building-funnel' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'building-funnel' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['funnel-building'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['funnel-building'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'building-funnel' && (
                      <div className="course-details">
                        <p>Create high-converting sales funnels that turn visitors into customers. Master the art of funnel optimization.</p>
                        <Link to="/courses/funnel-building" className="cta-link">
                          <span>Create Funnels →</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div
                    className={`course-item ${expandedSection === 'building-wordpress' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-wordpress')}
                    role="button"
                    aria-expanded={expandedSection === 'building-wordpress'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('building-wordpress'); }}
                  >
                    <h3>
                      Outsourcing
                      <span className={`chevron ${expandedSection === 'building-wordpress' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'building-wordpress' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['outsourcing'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['outsourcing'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'building-wordpress' && (
                      <div className="course-details">
                        <p>Learn how to outsource your marketing tasks to freelancers.</p>
                        <Link to="/courses/outsourcing" className="cta-link">
                          <span>Start Outsourcing →</span>
                        </Link>
                      </div>
                    )}
                  </div>


                </div>
                <hr className="section-divider" />
              </div>

              {/* Marketing Section */}
              <div className="section mb-8">
                <div className="section-header marketing">
                  <h2>REVENUE GENERATION</h2>
                </div>
                <div className="section-content">
                  {/* Repeat for each marketing course-item: add ARIA, chevron, progress bar, cta-link span */}
                  <div
                    className={`course-item ${expandedSection === 'marketing-automation' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-automation')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-automation'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-automation'); }}
                  >
                    <h3>
                      Automation
                      <span className={`chevron ${expandedSection === 'marketing-automation' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-automation' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['automation'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['automation'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-automation' && (
                      <div className="course-details">
                        <p>Automate your marketing tasks and scale your business. Learn advanced automation strategies and tools.</p>
                        <Link to="/courses/automation" className="cta-link">
                          <span>Automate Now →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-banner-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-banner-ads')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-banner-ads'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-banner-ads'); }}
                  >
                    <h3>
                      Banner Ads
                      <span className={`chevron ${expandedSection === 'marketing-banner-ads' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-banner-ads' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['banner-ads'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['banner-ads'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-banner-ads' && (
                      <div className="course-details">
                        <p>Learn how to create and optimize banner ads for maximum reach and conversions.</p>
                        <Link to="/courses/banner-ads" className="cta-link">
                          <span>Start Banner Ads Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div
                    className={`course-item ${expandedSection === 'marketing-email' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-email')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-email'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-email'); }}
                  >
                    <h3>
                      Email Marketing
                      <span className={`chevron ${expandedSection === 'marketing-email' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-email' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['email-marketing'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['email-marketing'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-email' && (
                      <div className="course-details">
                        <p>Build and nurture your email list. Master segmentation, automation, and conversion optimization.</p>
                        <Link to="/courses/email-marketing" className="cta-link">
                          <span>Start Email Marketing →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-geo-targeting' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-geo-targeting')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-geo-targeting'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-geo-targeting'); }}
                  >
                    <h3>
                      Geo Targeting
                      <span className={`chevron ${expandedSection === 'marketing-geo-targeting' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-geo-targeting' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['geo-targeting'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['geo-targeting'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-geo-targeting' && (
                      <div className="course-details">
                        <p>Learn how to target your marketing campaigns to specific geographic locations for better results.</p>
                        <Link to="/courses/geo-targeting" className="cta-link">
                          <span>Start Geo Targeting Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-lead-generation' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-lead-generation')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-lead-generation'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-lead-generation'); }}
                  >
                    <h3>
                      Lead Generation
                      <span className={`chevron ${expandedSection === 'marketing-lead-generation' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-lead-generation' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['lead-generation'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['lead-generation'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-lead-generation' && (
                      <div className="course-details">
                        <p>Discover strategies to generate high-quality leads for your business.</p>
                        <Link to="/courses/lead-generation" className="cta-link">
                          <span>Start Lead Generation Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-linkedin-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-linkedin-ads')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-linkedin-ads'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-linkedin-ads'); }}
                  >
                    <h3>
                      LinkedIn Advertising
                      <span className={`chevron ${expandedSection === 'marketing-linkedin-ads' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-linkedin-ads' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['linkedin-ads'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['linkedin-ads'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-linkedin-ads' && (
                      <div className="course-details">
                        <p>Leverage LinkedIn's platform to reach professionals and decision-makers with targeted ads.</p>
                        <Link to="/courses/linkedin-ads" className="cta-link">
                          <span>Start LinkedIn Ads Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-messenger' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-messenger')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-messenger'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-messenger'); }}
                  >
                    <h3>
                      Messenger Marketing
                      <span className={`chevron ${expandedSection === 'marketing-messenger' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-messenger' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['messenger-marketing'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['messenger-marketing'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-messenger' && (
                      <div className="course-details">
                        <p>Use Facebook Messenger and other chat platforms to engage and convert your audience.</p>
                        <Link to="/courses/messenger-marketing" className="cta-link">
                          <span>Start Messenger Marketing Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-newsfeed-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-newsfeed-ads')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-newsfeed-ads'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-newsfeed-ads'); }}
                  >
                    <h3>
                      Newsfeed Advertising
                      <span className={`chevron ${expandedSection === 'marketing-newsfeed-ads' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-newsfeed-ads' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['newsfeed-ads'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['newsfeed-ads'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-newsfeed-ads' && (
                      <div className="course-details">
                        <p>Learn how to create effective ads that appear in users' newsfeeds on social media platforms.</p>
                        <Link to="/courses/newsfeed-ads" className="cta-link">
                          <span>Start Newsfeed Ads Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-ppc' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-ppc')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-ppc'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-ppc'); }}
                  >
                    <h3>
                      Paid Traffic
                      <span className={`chevron ${expandedSection === 'marketing-ppc' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-ppc' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['paid-traffic'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['paid-traffic'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-ppc' && (
                      <div className="course-details">
                        <p>Master paid advertising across multiple platforms. Learn campaign optimization and ROI tracking.</p>
                        <Link to="/courses/paid-traffic" className="cta-link">
                          <span>Start Paid Traffic Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-pinterest' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-pinterest')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-pinterest'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-pinterest'); }}
                  >
                    <h3>
                      Pinterest Marketing
                      <span className={`chevron ${expandedSection === 'marketing-pinterest' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-pinterest' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['pinterest-marketing'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['pinterest-marketing'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-pinterest' && (
                      <div className="course-details">
                        <p>Drive traffic and sales using Pinterest's unique platform and audience.</p>
                        <Link to="/courses/pinterest-marketing" className="cta-link">
                          <span>Start Pinterest Marketing Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-search-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-search-ads')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-search-ads'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-search-ads'); }}
                  >
                    <h3>
                      Search Advertising
                      <span className={`chevron ${expandedSection === 'marketing-search-ads' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-search-ads' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['search-ads'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['search-ads'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-search-ads' && (
                      <div className="course-details">
                        <p>Learn how to advertise on search engines to reach users actively looking for your products or services.</p>
                        <Link to="/courses/search-ads" className="cta-link">
                          <span>Start Search Advertising Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-social' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-social')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-social'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-social'); }}
                  >
                    <h3>
                      Social Media Marketing
                      <span className={`chevron ${expandedSection === 'marketing-social' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-social' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['social-media-marketing'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['social-media-marketing'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-social' && (
                      <div className="course-details">
                        <p>Dominate social media platforms. Learn content strategy, engagement tactics, and paid advertising.</p>
                        <Link to="/courses/social-media-marketing" className="cta-link">
                          <span>Go Social →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'marketing-twitter' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-twitter')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-twitter'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-twitter'); }}
                  >
                    <h3>
                      X/Twitter Advertising
                      <span className={`chevron ${expandedSection === 'marketing-twitter' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-twitter' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['twitter-ads'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['twitter-ads'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'marketing-twitter' && (
                      <div className="course-details">
                        <p>Advertise on X (formerly Twitter) to reach a broad and engaged audience with your campaigns.</p>
                        <Link to="/courses/twitter-ads" className="cta-link">
                          <span>Start X/Twitter Ads Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="section-divider" />
              </div>

              {/* Fine Tuning Section */}
              <div className="section mb-8">
                <div className="section-header" style={{ backgroundColor: '#6366f1', color: 'white' }}>
                  <h2>OPTIMIZATION & SCALING</h2>
                </div>
                <div className="section-content">
                  <div
                    className={`course-item ${expandedSection === 'fine-seo' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('fine-seo')}
                    role="button"
                    aria-expanded={expandedSection === 'fine-seo'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('fine-seo'); }}
                  >
                    <h3>
                      Search Engine Optimization
                      <span className={`chevron ${expandedSection === 'fine-seo' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'fine-seo' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['seo'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['seo'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'fine-seo' && (
                      <div className="course-details">
                        <p>Master the art of SEO to boost your website's visibility and ranking on search engines. Learn keyword research, on-page and off-page optimization, and the latest strategies for 2024.</p>
                        <Link to="/courses/seo" className="cta-link">
                          <span>Start SEO Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <div
                    className={`course-item ${expandedSection === 'fine-split-testing' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('fine-split-testing')}
                    role="button"
                    aria-expanded={expandedSection === 'fine-split-testing'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('fine-split-testing'); }}
                  >
                    <h3>
                      Split Testing
                      <span className={`chevron ${expandedSection === 'fine-split-testing' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'fine-split-testing' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 6, background: '#e5e7eb', borderRadius: 3, margin: '4px 0 8px 0' }}>
                      <div style={{ width: `${Math.max(courseProgress['split-testing'] ?? 0, 2)}%`, height: '100%', background: '#2563eb', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {courseProgress['split-testing'] ?? 0}% Complete
                    </div>
                    {expandedSection === 'fine-split-testing' && (
                      <div className="course-details">
                        <p>Learn how to run effective split (A/B) tests to optimize your marketing campaigns, landing pages, and funnels for maximum conversions.</p>
                        <Link to="/courses/split-testing" className="cta-link">
                          <span>Start Split Testing Course →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="section-divider" />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      
      {/* Testimonial Carousel at bottom */}
      <TestimonialCarousel />
      
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      {isModalOpen &&
        <MemberRoleUpdateModal  setIsModalOpen={setIsModalOpen}/>
      }
    </div>
  );
};

export default Dashboard;
