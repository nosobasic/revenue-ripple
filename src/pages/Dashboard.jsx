import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client.jsx';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import AIAssistantWidget from '../components/AIAssistantWidget';
import '../pages.css';
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaMoneyBillWave, 
  FaChartBar, 
  FaGraduationCap, 
  FaLightbulb, 
  FaGlobe, 
  FaEnvelope, 
  FaShareAlt, 
  FaShoppingCart, 
  FaAd, 
  FaLinkedin, 
  FaUsers, 
  FaFunnelDollar, 
  FaFacebookMessenger, 
  FaBriefcase, 
  FaRobot, 
  FaPinterest, 
  FaUserPlus, 
  FaSearch, 
  FaTwitter, 
  FaPhone, 
  FaFlask, 
  FaUserTie, 
  FaNewspaper, 
  FaImage, 
  FaBook, 
  FaMapMarkerAlt, 
  FaLinkedinIn, 
  FaChartLine, 
  FaBox, 
  FaTruck, 
  FaExclamationTriangle, 
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

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

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
      <Navbar />
      <AIAssistantWidget />
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <div className="container">
            <h1 className="dashboard-title">Welcome to Revenue Ripple</h1>
            <p className="dashboard-welcome">Hello, Good To See You {user?.email?.split('@')[0]?.toUpperCase()}</p>
          </div>
        </header>

        <div className="container dashboard-content">
          {/* Main Content - Left Side */}
          <div className="main-content">
            {/* Affiliate Program Section */}
            <div className="section">
              <div className="section-header affiliate">
                <FaMoneyBillWave className="section-icon" />
                <h2>JOIN THE MEMBER EXCLUSIVE AFFILIATE PROGRAM</h2>
              </div>
              <div className="section-content">
                <div 
                  className={`course-item ${expandedSection === 'affiliate-paid' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('affiliate-paid')}
                >
                  <h3>Get Paid Every Month Like Clockwork</h3>
                  {expandedSection === 'affiliate-paid' && (
                    <div className="course-details">
                      <p>As someone who truly appreciates having you on board, I wanted to extend a personal invitation to you. We've got this awesome MEMBER EXCLUSIVE affiliate program that you've gotta check out. It's a sweet deal - you earn every penny for every other member that signs up through your special link. I'm talkin' $47.00 every single month for every 2 people you send our way, and we send it directly to your Paypal account. No waiting for an affiliate check or any of that nonsense.</p>
                      <p>To join, just click here.</p>
                      <p>Now listen up, because this part's important. Your affiliate account (and all your sweet, sweet payments) will only stay active as long as your membership subscription is active. So don't cancel, or you'll miss out on all the cash. And that's not what we want, is it?</p>
                      <p>My goal is for us to make money together, not just for me. That's why I'm tellin' you, the fastest way to earn is by promoting the membership itself. Sell it once, and you'll get paid every single month. That's my cup of tea, and it should be yours too. So get out there and sign up 2 members - that way, your own fee is more than covered. Let's do this thing!</p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <Link to="/affiliate/sign-up" className="cta-link">
                          <FaUserPlus style={{ marginRight: '8px' }} />
                          Go to the affiliate signup page
                        </Link>
                        <Link to="/affiliate-centre/tools" className="cta-link">
                          <FaShareAlt style={{ marginRight: '8px' }} />
                          Go to the Affiliate tools page
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/*Reseller Program Section*/}
            <div className="section">
              <div className="section-header reseller">
                <FaShoppingCart className="section-icon" />
                <h2>EARN $1,000s EVERY MONTH ON AUTOPILOT</h2>
              </div>
              <div className="section-content">
                <div
                  className={`course-item ${expandedSection === 'reseller-paid' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('reseller-paid')}
                >
                  <h3>Premium Membership Reseller Program</h3>
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
                        <FaShoppingCart style={{ marginRight: '8px' }} />
                        Join Reseller Program →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            

            {/* Digital Marketing Section */}
            <div className="section">
              <div className="section-header digital">
                <FaGlobe className="section-icon" />
                <h2>ULTIMATE DIGITAL MARKETING DOMINATION</h2>
              </div>
              <div className="section-content">
                <div 
                  className={`course-item ${expandedSection === 'digital-email' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('digital-email')}
                >
                  <h3>The 12 Month Email Course In One Book</h3>
                  {expandedSection === 'digital-email' && (
                    <div className="course-details">
                      <p>Master email marketing in record time with our comprehensive guide. Learn everything from list building to advanced automation in one complete package.</p>
                      <Link to="/courses/email-marketing" className="cta-link">
                        <FaBook style={{ marginRight: '8px' }} />
                        Get Complete Guide →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Suggested Order Section */}
            <div className="section">
              <div className="section-header suggested">
                <FaLightbulb className="section-icon" />
                <h2>SUGGESTED ORDER TO WATCH ALL VIDEO COURSES</h2>
              </div>
              <div className="section-content">
                <div className="suggested-content">
                  <p>
                    If you're new to online marketing, it can be overwhelming to know where to start. But don't worry, here's a suggested order to watch the video courses that will help you build a solid foundation and get the most out of each course.
                  </p>

                  <div className="section-break" />

                  <p>
                    First, start with <Link to="/courses/website-design" className="course-link">Web Design</Link>. 
                    This will give you a good foundation for creating a website that is both visually appealing and user-friendly. 
                    Once you've learned the basics of web design, move on to <Link to="/courses/seo" className="course-link">SEO</Link>. 
                    This course will teach you how to optimize your website for search engines, which is crucial for getting organic traffic.
                  </p>

                  <p>
                    Next, watch <Link to="/courses/email-marketing" className="course-link">Email Marketing</Link> to learn how to build an email list 
                    and communicate effectively with your subscribers. Then, move on to <Link to="/courses/social-media-marketing" className="course-link">Social Marketing</Link> 
                    to learn how to use social media platforms to grow your business. <Link to="/courses/affiliate-marketing" className="course-link">Affiliate Marketing</Link> and 
                    <Link to="/courses/ecommerce" className="course-link">Ecommerce</Link> come next, as they teach you how to promote other people's products 
                    and sell your own products online.
                  </p>

                  <p>
                    After that, watch <Link to="/courses/paid-traffic" className="course-link">Paid Traffic</Link> to learn how to use platforms like Google Ads 
                    and Facebook Ads to drive targeted traffic to your website. <Link to="/courses/linkedin-ads" className="course-link">LinkedIn Marketing</Link> (organic) 
                    and <Link to="/courses/lead-generation" className="course-link">Lead Generation</Link> come next, as they teach you how to use LinkedIn to 
                    generate leads and attract potential customers.
                  </p>

                  <p>
                    <Link to="/courses/funnel-building" className="course-link">Funnel Building</Link> and <Link to="/courses/messenger-marketing" className="course-link">Messenger Marketing</Link> 
                    are next, as they teach you how to create a sales funnel that takes your leads through the buying process and how to use 
                    Facebook Messenger to communicate with your customers and automate certain tasks. <Link to="/courses/freelancing" className="course-link">Freelancing</Link> comes 
                    next, as it teaches you how to offer your services as a freelancer and find clients.
                  </p>

                  <div className="section-break" />

                  <p>
                    <Link to="/courses/automation" className="course-link">Marketing automation</Link> is next, as it teaches you how to automate repetitive marketing tasks, 
                    saving you time and increasing efficiency. <Link to="/courses/pinterest-marketing" className="course-link">Pinterest Marketing</Link>, 
                    <Link to="/courses/affiliate-recruiting" className="course-link">Affiliate Recruiting</Link>, and <Link to="/courses/search-ads" className="course-link">Search Advertising</Link> 
                    are next on the list, as they teach you how to use Pinterest to drive traffic to your website, recruit other affiliates to promote your products, 
                    and advertise your products or services on search engines.
                  </p>

                  <p>
                    <Link to="/courses/twitter-ads" className="course-link">Twitter Timeline Advertising</Link> and <Link to="/courses/cold-calling" className="course-link">Cold Calling</Link> 
                    are next, as they teach you how to use Twitter Ads to promote your products or services and make effective sales calls and close deals. 
                    <Link to="/courses/split-testing" className="course-link">Split Testing</Link> and <Link to="/courses/online-learning" className="course-link">Online Learning</Link> come next, 
                    as they teach you how to test different marketing strategies and create and sell online courses.
                  </p>

                  <p>
                    Finally, watch <Link to="/courses/newsfeed-ads" className="course-link">Newsfeed Ads</Link>, <Link to="/courses/banner-ads" className="course-link">Banner Ads</Link>, 
                    <Link to="/courses/online-learning" className="course-link">Online Learning</Link>, <Link to="/courses/geo-targeting" className="course-link">Geo Targeting</Link>, 
                    and <Link to="/courses/linkedin-ads" className="course-link">LinkedIn Ads</Link> to learn how to create effective ads that appear in users' newsfeeds 
                    on social media platforms, create effective banner ads that appear on other websites, create and sell online courses, target specific geographic 
                    areas with your marketing campaigns, and create and run ads on LinkedIn to reach your target audience.
                  </p>

                  <div className="section-break" />

                  <p>
                    Remember, this order is just a suggestion, and you can adjust it based on your personal interests and business goals. 
                    The most important thing is to take notes and apply what you learn to your own business.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Section */}
            <div className="section">
              <div className="section-header ai">
                <FaRobot className="section-icon" />
                <h2>AI BUSINESS ACCELERATION</h2>
              </div>
              <div className="section-content">
                <div 
                  className={`course-item ${expandedSection === 'ai-automation' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('ai-automation')}
                >
                  <h3>AI Automation Mastery</h3>
                  {expandedSection === 'ai-automation' && (
                    <div className="course-details">
                      <p>Discover how to leverage AI to automate and scale your business operations. Learn about:</p>
                      <ul>
                        <li>AI-powered content creation and marketing</li>
                        <li>Customer service automation with AI chatbots</li>
                        <li>Data analysis and business intelligence</li>
                        <li>AI-driven sales and lead generation</li>
                        <li>Process automation and optimization</li>
                      </ul>
                      <Link to="/courses/ai-automation" className="cta-link">
                        <FaRobot style={{ marginRight: '8px' }} />
                        Master AI Automation →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'ai-content' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('ai-content')}
                >
                  <h3>AI Content Generation</h3>
                  {expandedSection === 'ai-content' && (
                    <div className="course-details">
                      <p>Learn how to use AI tools to create high-quality content at scale:</p>
                      <ul>
                        <li>Blog posts and articles</li>
                        <li>Social media content</li>
                        <li>Email marketing campaigns</li>
                        <li>Product descriptions</li>
                        <li>SEO-optimized content</li>
                      </ul>
                      <Link to="/courses/ai-content" className="cta-link">
                        <FaNewspaper style={{ marginRight: '8px' }} />
                        Start AI Content Course →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="section">
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
                      <FaBell style={{ marginRight: '8px' }} />
                      Enable Notifications →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Content - Right Side */}
          <div className="side-content">
            <div className="grid-layout">
              {/* Building Section */}
              <div className="section">
                <div className="section-header building">
                  <FaGraduationCap className="section-icon" />
                  <h2>BUILDING SECTION</h2>
                </div>
                <div className="section-content">
                  <div 
                    className={`course-item ${expandedSection === 'building-website' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-website')}
                  >
                    <h3>Website Design</h3>
                    {expandedSection === 'building-website' && (
                      <div className="course-details">
                        <p>Learn to build professional, responsive websites from scratch. Master HTML, CSS, and modern design principles.</p>
                        <Link to="/courses/website-design" className="cta-link">
                          Start Building →
                        </Link>
                      </div>
                    )}
                  </div>

                  <div 
                    className={`course-item ${expandedSection === 'building-funnel' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-funnel')}
                  >
                    <h3>Funnel Building</h3>
                    {expandedSection === 'building-funnel' && (
                      <div className="course-details">
                        <p>Create high-converting sales funnels that turn visitors into customers. Master the art of funnel optimization.</p>
                        <Link to="/courses/funnel-building" className="cta-link">
                          Create Funnels →
                        </Link>
                      </div>
                    )}
                  </div>

                  <div 
                    className={`course-item ${expandedSection === 'building-wordpress' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-wordpress')}
                  >
                    <h3>WordPress Mastery</h3>
                    {expandedSection === 'building-wordpress' && (
                      <div className="course-details">
                        <p>Become a WordPress expert. Learn theme customization, plugin development, and site optimization.</p>
                        <Link to="/courses/wordpress" className="cta-link">
                          Master WordPress →
                        </Link>
                      </div>
                    )}
                  </div>

                  <div 
                    className={`course-item ${expandedSection === 'building-landing' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('building-landing')}
                  >
                    <h3>Landing Page Design</h3>
                    {expandedSection === 'building-landing' && (
                      <div className="course-details">
                        <p>Design landing pages that convert. Learn proven layouts, copywriting, and optimization techniques.</p>
                        <Link to="/courses/landing-pages" className="cta-link">
                          Design Pages →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Marketing Section */}
              <div className="section">
                <div className="section-header marketing">
                  <h2>MARKETING SECTION</h2>
                </div>
                <div className="section-content">
                  <div 
                    className={`course-item ${expandedSection === 'marketing-automation' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-automation')}
                  >
                    <h3>Automation</h3>
                    {expandedSection === 'marketing-automation' && (
                      <div className="course-details">
                        <p>Automate your marketing tasks and scale your business. Learn advanced automation strategies and tools.</p>
                        <Link to="/courses/automation" className="cta-link">
                          Automate Now →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-banner-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-banner-ads')}
                  >
                    <h3>Banner Ads</h3>
                    {expandedSection === 'marketing-banner-ads' && (
                      <div className="course-details">
                        <p>Learn how to create and optimize banner ads for maximum reach and conversions.</p>
                        <Link to="/courses/banner-ads" className="cta-link">
                          Start Banner Ads Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-ads')}
                  >
                    <h3>Ads</h3>
                    {expandedSection === 'marketing-ads' && (
                      <div className="course-details">
                        <p>Master the fundamentals of online advertising across platforms.</p>
                        <Link to="/courses/ads" className="cta-link">
                          Start Ads Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-email' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-email')}
                  >
                    <h3>Email Marketing</h3>
                    {expandedSection === 'marketing-email' && (
                      <div className="course-details">
                        <p>Build and nurture your email list. Master segmentation, automation, and conversion optimization.</p>
                        <Link to="/courses/email-marketing" className="cta-link">
                          Start Email Marketing →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-geo-targeting' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-geo-targeting')}
                  >
                    <h3>Geo Targeting</h3>
                    {expandedSection === 'marketing-geo-targeting' && (
                      <div className="course-details">
                        <p>Learn how to target your marketing campaigns to specific geographic locations for better results.</p>
                        <Link to="/courses/geo-targeting" className="cta-link">
                          Start Geo Targeting Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-lead-generation' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-lead-generation')}
                  >
                    <h3>Lead Generation</h3>
                    {expandedSection === 'marketing-lead-generation' && (
                      <div className="course-details">
                        <p>Discover strategies to generate high-quality leads for your business.</p>
                        <Link to="/courses/lead-generation" className="cta-link">
                          Start Lead Generation Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-linkedin-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-linkedin-ads')}
                  >
                    <h3>LinkedIn Advertising</h3>
                    {expandedSection === 'marketing-linkedin-ads' && (
                      <div className="course-details">
                        <p>Leverage LinkedIn's platform to reach professionals and decision-makers with targeted ads.</p>
                        <Link to="/courses/linkedin-ads" className="cta-link">
                          Start LinkedIn Ads Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-messenger' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-messenger')}
                  >
                    <h3>Messenger Marketing</h3>
                    {expandedSection === 'marketing-messenger' && (
                      <div className="course-details">
                        <p>Use Facebook Messenger and other chat platforms to engage and convert your audience.</p>
                        <Link to="/courses/messenger-marketing" className="cta-link">
                          Start Messenger Marketing Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-newsfeed-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-newsfeed-ads')}
                  >
                    <h3>Newsfeed Advertising</h3>
                    {expandedSection === 'marketing-newsfeed-ads' && (
                      <div className="course-details">
                        <p>Learn how to create effective ads that appear in users' newsfeeds on social media platforms.</p>
                        <Link to="/courses/newsfeed-ads" className="cta-link">
                          Start Newsfeed Ads Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-ppc' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-ppc')}
                  >
                    <h3>Paid Traffic</h3>
                    {expandedSection === 'marketing-ppc' && (
                      <div className="course-details">
                        <p>Master paid advertising across multiple platforms. Learn campaign optimization and ROI tracking.</p>
                        <Link to="/courses/paid-traffic" className="cta-link">
                          Start Paid Traffic Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-pinterest' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-pinterest')}
                  >
                    <h3>Pinterest Marketing</h3>
                    {expandedSection === 'marketing-pinterest' && (
                      <div className="course-details">
                        <p>Drive traffic and sales using Pinterest's unique platform and audience.</p>
                        <Link to="/courses/pinterest-marketing" className="cta-link">
                          Start Pinterest Marketing Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-search-ads' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-search-ads')}
                  >
                    <h3>Search Advertising</h3>
                    {expandedSection === 'marketing-search-ads' && (
                      <div className="course-details">
                        <p>Learn how to advertise on search engines to reach users actively looking for your products or services.</p>
                        <Link to="/courses/search-ads" className="cta-link">
                          Start Search Advertising Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-social' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-social')}
                  >
                    <h3>Social Media Marketing</h3>
                    {expandedSection === 'marketing-social' && (
                      <div className="course-details">
                        <p>Dominate social media platforms. Learn content strategy, engagement tactics, and paid advertising.</p>
                        <Link to="/courses/social-media-marketing" className="cta-link">
                          Go Social →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'marketing-twitter' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('marketing-twitter')}
                  >
                    <h3>X/Twitter Advertising</h3>
                    {expandedSection === 'marketing-twitter' && (
                      <div className="course-details">
                        <p>Advertise on X (formerly Twitter) to reach a broad and engaged audience with your campaigns.</p>
                        <Link to="/courses/twitter-ads" className="cta-link">
                          Start X/Twitter Ads Course →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fine Tuning Section */}
              <div className="section">
                <div className="section-header" style={{ backgroundColor: '#6366f1', color: 'white' }}>
                  <h2>FINE TUNING SECTION</h2>
                </div>
                <div className="section-content">
                  <div 
                    className={`course-item ${expandedSection === 'fine-seo' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('fine-seo')}
                  >
                    <h3>Search Engine Optimization</h3>
                    {expandedSection === 'fine-seo' && (
                      <div className="course-details">
                        <p>Master the art of SEO to boost your website's visibility and ranking on search engines. Learn keyword research, on-page and off-page optimization, and the latest strategies for 2024.</p>
                        <Link to="/courses/seo" className="cta-link">
                          Start SEO Course →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`course-item ${expandedSection === 'fine-split-testing' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('fine-split-testing')}
                  >
                    <h3>Split Testing</h3>
                    {expandedSection === 'fine-split-testing' && (
                      <div className="course-details">
                        <p>Learn how to run effective split (A/B) tests to optimize your marketing campaigns, landing pages, and funnels for maximum conversions.</p>
                        <Link to="/courses/split-testing" className="cta-link">
                          Start Split Testing Course →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
