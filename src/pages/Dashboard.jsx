import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client.jsx';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import AIAssistantWidget from '../components/AIAssistantWidget';
import '../pages.css';
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
  FaBell 
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // Optionally, refetch on location change to dashboard
    // eslint-disable-next-line
  }, [user, location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
            <p className="dashboard-welcome">Hello, Good To See You {user?.email?.split('@')[0]?.toUpperCase()}</p>
          </div>
        </header>

        <div className="container dashboard-content flex flex-wrap md:flex-nowrap">
          {/* Main Content - Left Side */}
          <div className="main-content w-full md:w-2/3 pr-0 md:pr-8">
            <h2 className="section-overview-title mb-4 mt-2">Your Core Training & Earnings Center</h2>
            {/* Affiliate Program Section */}
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
                      <p>To join, just click here.</p>
                      <p>Now listen up, because this part's important. Your affiliate account (and all your sweet, sweet payments) will only stay active as long as your membership subscription is active. So don't cancel, or you'll miss out on all the cash. And that's not what we want, is it?</p>
                      <p>My goal is for us to make money together, not just for me. That's why I'm tellin' you, the fastest way to earn is by promoting the membership itself. Sell it once, and you'll get paid every single month. That's my cup of tea, and it should be yours too. So get out there and sign up 2 members - that way, your own fee is more than covered. Let's do this thing!</p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <Link to="/affiliate/sign-up" className="cta-link">
                          <span><FaUserPlus style={{ marginRight: '8px' }} /> Go to the affiliate signup page</span>
                        </Link>
                        <Link to="/affiliate-centre/tools" className="cta-link">
                          <span><FaShareAlt style={{ marginRight: '8px' }} /> Go to the Affiliate tools page</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <hr className="section-divider" />
              </div>
            </div>
            
            {/*Reseller Program Section*/}
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
                      <Link to="/special" className="cta-link">
                        <span><FaShoppingCart style={{ marginRight: '8px' }} /> Join Reseller Program →</span>
                      </Link>
                    </div>
                  )}
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
                      <Link to="/courses/email-marketing" className="cta-link">
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
                  <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                    <div style={{ width: `${courseProgress['ai-essentials'] ?? 0}%`, height: '100%', background: '#38bdf8', borderRadius: 2, transition: 'width 0.3s' }} />
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
                  <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                    <div style={{ width: `${courseProgress['ai-agent-fundamentals'] ?? 0}%`, height: '100%', background: '#38bdf8', borderRadius: 2, transition: 'width 0.3s' }} />
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
                  <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                    <div style={{ width: `${courseProgress['prompt-engineering'] ?? 0}%`, height: '100%', background: '#38bdf8', borderRadius: 2, transition: 'width 0.3s' }} />
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
                  <h2>BUILDING SECTION</h2>
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '35%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '65%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '15%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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

                  <div
                    className={`course-item ${expandedSection === 'building-landing' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-landing')}
                    role="button"
                    aria-expanded={expandedSection === 'building-landing'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('building-landing'); }}
                  >
                    <h3>
                      Landing Page Design
                      <span className={`chevron ${expandedSection === 'building-landing' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'building-landing' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '50%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
                    </div>
                    {expandedSection === 'building-landing' && (
                      <div className="course-details">
                        <p>Design landing pages that convert. Learn proven layouts, copywriting, and optimization techniques.</p>
                        <Link to="/courses/landing-pages" className="cta-link">
                          <span>Design Pages →</span>
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
                  <h2>MARKETING SECTION</h2>
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '30%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '40%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    className={`course-item ${expandedSection === 'marketing-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-ads')}
                    role="button"
                    aria-expanded={expandedSection === 'marketing-ads'}
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') toggleSection('marketing-ads'); }}
                  >
                    <h3>
                      Ads
                      <span className={`chevron ${expandedSection === 'marketing-ads' ? 'rotated' : ''}`} style={{ marginLeft: 8, transition: 'transform 0.2s', display: 'inline-block', transform: expandedSection === 'marketing-ads' ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </h3>
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '15%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
                    </div>
                    {expandedSection === 'marketing-ads' && (
                      <div className="course-details">
                        <p>Master the fundamentals of online advertising across platforms.</p>
                        <Link to="/courses/ads" className="cta-link">
                          <span>Start Ads Course →</span>
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '60%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '22%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '70%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '33%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '40%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '18%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '55%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '20%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '12%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '80%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '10%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                  <h2>FINE TUNING SECTION</h2>
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '75%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
                    <div className="progress-bar-container" style={{ height: 4, background: '#eee', borderRadius: 2, margin: '4px 0 8px 0' }}>
                      <div style={{ width: '25%', height: '100%', background: '#38bdf8', borderRadius: 2 }} />
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
    </div>
  );
};

export default Dashboard;
