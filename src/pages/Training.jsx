import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AIAssistantWidget from '../components/AIAssistantWidget';
import { usePremiumBriefings } from '../hooks/usePremiumBriefings';
import PremiumBriefingCarousel from '../components/training/PremiumBriefingCarousel';
import PremiumBriefingModal from '../components/training/PremiumBriefingModal';
import { trackBriefingOpen } from '../services/engagementTracking';
import '../pages.css';
import {
  FaVideo,
  FaGraduationCap,
  FaBook,
  FaLightbulb,
  FaBrain,
  FaBullseye,
  FaRocket,
  FaTools
} from 'react-icons/fa';

const Training = () => {
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const { data: briefings, loading: briefingsLoading, error: briefingsError } = usePremiumBriefings();
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    topic: '',
    urgency: 'normal'
  });

  // TODO: Re-enable paid membership check when ready to monetize
  // const isMember = user?.has_paid === true;
  // TEMPORARY: App is free during validation phase - all users get full access
  const isMember = true;

  const handleBriefingClick = (briefing) => {
    setSelectedBriefing(briefing);
    setShowBriefingModal(true);
    // Track briefing open from carousel
    if (user) {
      trackBriefingOpen(user.id, briefing.id);
    }
  };

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Here you would integrate with your booking system (Calendly, Acuity, etc.)
    const mailtoLink = `mailto:support@revenueripple.org?subject=Training Call Booking Request - ${bookingData.topic}&body=Hi,%0D%0A%0D%0AI'd like to book a training call to discuss: ${bookingData.topic}%0D%0A%0D%0APreferred Date: ${bookingData.preferredDate}%0D%0APreferred Time: ${bookingData.preferredTime}%0D%0AUrgency: ${bookingData.urgency}%0D%0A%0D%0AName: ${bookingData.name}%0D%0AEmail: ${bookingData.email}%0D%0APhone: ${bookingData.phone}%0D%0A%0D%0AThanks!`;
    window.open(mailtoLink, '_blank');
    setShowBookingForm(false);
    setBookingData({
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      topic: '',
      urgency: 'normal'
    });
  };

  const handleEmailSupport = (topic) => {
    const mailtoLink = `mailto:support@revenueripple.org?subject=Training Support Request - ${topic}&body=Hi Support Team,%0D%0A%0D%0AI need help with training content: ${topic}%0D%0A%0D%0APlease provide details about your training question or issue below:%0D%0A%0D%0A%0D%0A%0D%0AThanks!`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <div className="dashboard">
      <Navbar />
      <AIAssistantWidget 
        showWelcomeBubble={true} 
        pageContext="Training Center - Marketing guides and educational content"
      />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">MARKETING</h1>
          <div className="dashboard-welcome">TRAINING & GUIDES</div>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* Main Content */}
        <div className="main-content">
          {/* Guest Expert Videos Section */}
          <div className="section-group">
            <h2 className="section-title">Guest Expert Videos</h2>
            <p className="section-subtitle">Learn from industry experts and successful entrepreneurs</p>
            <div className="section">
              <div className="section-header">
                <FaVideo className="section-icon" />
                <h2>GUEST EXPERT VIDEOS</h2>
              </div>
              <div className="section-content">
                <div 
                  className={`course-item ${expandedSection === 'entrepreneurial' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('entrepreneurial')}
                >
                  <h3>Entrepreneurial Brainstorming</h3>
                  {expandedSection === 'entrepreneurial' && (
                    <div className="course-details">
                      <p>Get in the mind of real entrepreneurs and see how they come up with money-making ideas from scratch. Simple systems, big results.</p>
                      <Link to="/training/videos/entrepreneurial" className="cta-link">
                        Watch Now →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'branding' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('branding')}
                >
                                      <h3>Mindset Mastery</h3>
                  {expandedSection === 'branding' && (
                                          <div className="course-details">
                        <p>Master the mental game of entrepreneurship. Learn how to develop the mindset, habits, and mental frameworks that separate successful entrepreneurs from the rest.</p>
                      <Link to="/training/videos/mindset-mastery" className="cta-link">
                        Watch Now →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'startups' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('startups')}
                >
                  <h3>Shoestring Startups</h3>
                  {expandedSection === 'startups' && (
                    <div className="course-details">
                      <p>Launching on a tight budget? This guide walks you through how to get up and running with damn near nothing—and still win.</p>
                      <Link to="/training/videos/shoestring-startups" className="cta-link">
                        Watch Now →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Training & Guides Section */}
          <div className="section-group">
            <h2 className="section-title">Marketing Training & Guides</h2>
            <p className="section-subtitle">Comprehensive guides and tutorials for marketing success</p>
            <div className="section">
              <div className="section-header">
                <FaGraduationCap className="section-icon" />
                <h2>MARKETING TRAINING & GUIDES</h2>
              </div>
              <div className="section-content">
                <div 
                  className={`course-item ${expandedSection === 'adwords' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('adwords')}
                >
                  <h3>Adwords Quality Score</h3>
                  {expandedSection === 'adwords' && (
                    <div className="course-details">
                      <p>Google don't just reward the biggest spender. If your ads are clean and your landing pages actually help people, they'll move you to the top. This breaks down how to play the algorithm right.</p>
                      <Link to="/training/guides/adwords-quality" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'analyzing-data' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('analyzing-data')}
                >
                  <h3>Analyzing Data</h3>
                  {expandedSection === 'analyzing-data' && (
                    <div className="course-details">
                      <p>Clicks mean nothing if you're not watching the numbers. This section shows you how to spot what's working, cut what's not, and scale up like a pro.</p>
                      <Link to="/training/guides/analyzing-data" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'article-marketing' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('article-marketing')}
                >
                  <h3>Article Marketing Getting Started</h3>
                  {expandedSection === 'article-marketing' && (
                    <div className="course-details">
                      <p>Write articles, post 'em on the right sites, and let Google do the rest. This is how you get seen without dropping a bag on ads.</p>
                      <Link to="/training/guides/article-marketing" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'mailing-list' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('mailing-list')}
                >
                  <h3>Building a Mailing List</h3>
                  {expandedSection === 'mailing-list' && (
                    <div className="course-details">
                      <p>If you're not collecting emails, you're leaving money on the table. Learn how to build a list that keeps paying you every time you hit send.</p>
                      <Link to="/training/guides/mailing-list" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'keyword-technique' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('keyword-technique')}
                >
                  <h3>Common Keyword Technique</h3>
                  {expandedSection === 'keyword-technique' && (
                    <div className="course-details">
                      <p>This trick makes your ad campaigns way tighter. Better keywords, better results. Run this play to level up your PPC game across the board.</p>
                      <Link to="/training/guides/keyword-technique" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'landing-components' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('landing-components')}
                >
                  <h3>Components of a Landing Page</h3>
                  {expandedSection === 'landing-components' && (
                    <div className="course-details">
                      <p>Landing pages are your digital pitchman. Whether it's reviews or testimonials, this guide shows you how to build pages that warm people up and get them to click 'buy.'</p>
                      <Link to="/training/guides/landing-components" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'purchase-cycle' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('purchase-cycle')}
                >
                  <h3>Customer Purchase Cycle</h3>
                  {expandedSection === 'purchase-cycle' && (
                    <div className="course-details">
                      <p>Before you sell anything, you gotta understand your buyers. This guide helps you dial in on what they want and why they're even shopping online in the first place.</p>
                      <Link to="/training/guides/purchase-cycle" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'backlinks-social' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('backlinks-social')}
                >
                  <h3>How To Obtain Relevant Backlinks - Part 2 - Social Bookmarking</h3>
                  {expandedSection === 'backlinks-social' && (
                    <div className="course-details">
                      <p>Want backlinks and more exposure? Drop your pages in the right directories and let users vote you up. This strategy boosts your rank and your reach.</p>
                      <Link to="/training/guides/backlinks-social" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'backlinks-article' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('backlinks-article')}
                >
                  <h3>How To Obtain Relevant Backlinks - Part 1 - Article Submission</h3>
                  {expandedSection === 'backlinks-article' && (
                    <div className="course-details">
                      <p>Backlinks are the secret sauce for getting to page one. Learn how to build real authority by submitting content that ranks and pulls traffic back to your site.</p>
                      <Link to="/training/guides/backlinks-article" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'landing-optimization' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('landing-optimization')}
                >
                  <h3>Landing Page Optimization</h3>
                  {expandedSection === 'landing-optimization' && (
                    <div className="course-details">
                      <p>If people land on your page and bounce, you're wasting money. Learn how to fix that with better headlines, smarter layouts, and CTA game that converts.</p>
                      <Link to="/training/guides/landing-optimization" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'men-guide' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('men-guide')}
                >
                  <h3>Subject Title: Men Only To Read This Guide</h3>
                  {expandedSection === 'men-guide' && (
                    <div className="course-details">
                      <p>Exclusive game just for the fellas. What's inside? You'll see.</p>
                      <Link to="/training/guides/men-guide" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'market-research' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('market-research')}
                >
                  <h3>Market Research</h3>
                  {expandedSection === 'market-research' && (
                    <div className="course-details">
                      <p>Before you run a campaign, find your pocket of profit. This lesson shows you how to research, validate, and dominate niche markets with real potential.</p>
                      <Link to="/training/guides/market-research" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'keyword-research' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('keyword-research')}
                >
                  <h3>How To Master Keyword Research</h3>
                  {expandedSection === 'keyword-research' && (
                    <div className="course-details">
                      <p>You don't need to buy expensive tools to find killer keywords. Google's own data is a goldmine—this shows you how to tap in.</p>
                      <Link to="/training/guides/keyword-research" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'ppc-start' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('ppc-start')}
                >
                  <h3>PPC Getting Started</h3>
                  {expandedSection === 'ppc-start' && (
                    <div className="course-details">
                      <p>Run ads smart. Learn how to set up your campaigns so you're making more than you're spending. That's the only rule that matters.</p>
                      <Link to="/training/guides/ppc-start" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'seo-google' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('seo-google')}
                >
                  <h3>SEO How to Slap Back @ Google</h3>
                  {expandedSection === 'seo-google' && (
                    <div className="course-details">
                      <p>SEO's a hustle. You can't control everything, but if you play it right, you can rank and get traffic for free. This guide shows you how to stack the odds in your favor.</p>
                      <Link to="/training/guides/seo-google" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'target-audiences' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('target-audiences')}
                >
                  <h3>Target Audiences</h3>
                  {expandedSection === 'target-audiences' && (
                    <div className="course-details">
                      <p>You can't sell to everybody. This breaks down how to find your ideal buyer and talk directly to the people who actually want what you're offering.</p>
                      <Link to="/training/guides/target-audiences" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'marketing-mistakes' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('marketing-mistakes')}
                >
                  <h3>Top 10 Internet Marketing Mistakes</h3>
                  {expandedSection === 'marketing-mistakes' && (
                    <div className="course-details">
                      <p>Save yourself the headache. These are the biggest marketing mistakes most people make. Avoid these and you'll already be ahead of 90% of your competition.</p>
                      <Link to="/training/guides/marketing-mistakes" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'understanding-relevance' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('understanding-relevance')}
                >
                  <h3>Understanding Relevance</h3>
                  {expandedSection === 'understanding-relevance' && (
                    <div className="course-details">
                      <p>You can have the dopest product on the planet, but if it's not speaking to the right people, it's useless. This lesson helps you align every piece of your funnel to lock in sales.</p>
                      <Link to="/training/guides/understanding-relevance" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'writing-ad-copy' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('writing-ad-copy')}
                >
                  <h3>Writing Ad Copy</h3>
                  {expandedSection === 'writing-ad-copy' && (
                    <div className="course-details">
                      <p>Your ads are your first impression. If your copy doesn't hit, nobody's clicking. Learn how to write words that get attention and drive action.</p>
                      <Link to="/training/guides/writing-ad-copy" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className={`course-item ${expandedSection === 'sales-copy' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('sales-copy')}
                >
                  <h3>Writing Effective Sales Copy</h3>
                  {expandedSection === 'sales-copy' && (
                    <div className="course-details">
                      <p>Sales copy is what turns visits into money. Master this skill and you'll be able to sell anything, anywhere, without sounding like a corny ad.</p>
                      <Link to="/training/guides/sales-copy" className="cta-link">
                        Learn More →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Premium AI Briefings Section */}
          <div className="section-group">
            <h2 className="section-title">Premium AI Briefings</h2>
            <p className="section-subtitle">Exclusive insights and strategic briefings for members</p>
            <div className="section">
              <div className="section-header">
                <FaBrain className="section-icon" />
                <h2>PREMIUM AI BRIEFINGS</h2>
              </div>
              <div className="section-content">
                {briefingsLoading ? (
                  <div style={{
                    padding: window.innerWidth <= 768 ? '2rem 1rem' : '3rem 1rem',
                    textAlign: 'center',
                    color: '#64748b',
                  }}>
                    <div style={{
                      display: 'inline-block',
                      width: window.innerWidth <= 768 ? '32px' : '40px',
                      height: window.innerWidth <= 768 ? '32px' : '40px',
                      border: '4px solid #e2e8f0',
                      borderTop: '4px solid #2563eb',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '1rem',
                    }} />
                    <p style={{ margin: 0, fontSize: window.innerWidth <= 768 ? '0.9375rem' : '1rem' }}>Loading premium briefings...</p>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : briefingsError ? (
                  <div style={{
                    padding: window.innerWidth <= 768 ? '2rem 1rem' : '3rem 1rem',
                    textAlign: 'center',
                    color: '#ef4444',
                    background: '#fef2f2',
                    borderRadius: '12px',
                    border: '1px solid #fecaca',
                  }}>
                    <p style={{ margin: 0, fontSize: window.innerWidth <= 768 ? '0.9375rem' : '1rem' }}>
                      Having trouble loading premium briefings right now. Try again soon.
                    </p>
                  </div>
                ) : (
                  <PremiumBriefingCarousel
                    briefings={briefings || []}
                    isMember={isMember}
                    onCardClick={handleBriefingClick}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Vault Section */}
          <div className="section-group">
            <h2 className="section-title">Vault</h2>
            <p className="section-subtitle">Weekly playbooks as premium, living assets</p>
            <div className="section">
              <div className="section-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <FaBook className="section-icon" />
                <h2>VAULT</h2>
              </div>
              <div className="section-content">
                <div style={{ 
                  padding: '2rem', 
                  background: '#f8f9fa', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: '#495057', 
                    fontSize: '1.1rem', 
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    Access your weekly playbooks—premium content designed to guide your progress. Each playbook is a living asset, updated regularly with the latest strategies and insights.
                  </p>
                  <Link 
                    to="/vault" 
                    className="cta-link"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 2rem',
                      background: '#2563eb',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#1d4ed8';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#2563eb';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    View All Playbooks →
                  </Link>
                </div>
                <hr className="section-divider" />
              </div>
            </div>
          </div>
        </div>

        {/* Side Content - Enhanced Support & Resources */}
        <div className="side-content">
          {/* Book a Training Call Section */}
          <div className="section">
            <div className="section-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="section-icon">📞</div>
              <h2>Need Training Help?</h2>
            </div>
            <div className="section-content">
              <div style={{ 
                background: '#f8f9fa', 
                padding: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
                borderRadius: '12px', 
                marginBottom: '1.5rem',
                border: '2px solid #e9ecef'
              }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '1rem', 
                  fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
                  textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                }}>
                  🎯 Get 1-on-1 Training Support
                </h3>
                <p style={{ 
                  color: '#555', 
                  marginBottom: '1.5rem', 
                  lineHeight: '1.6', 
                  fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                  textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                }}>
                  Stuck on a concept? Need clarification on any training material? Book a direct call with the Revenue Ripple owner for personalized guidance.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    color: '#333', 
                    marginBottom: '0.5rem', 
                    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                    textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                  }}>📚 Training Topics We Cover:</h4>
                  <ul style={{ 
                    color: '#666', 
                    fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.85rem', 
                    lineHeight: '1.5',
                    paddingLeft: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                    textAlign: window.innerWidth <= 768 ? 'left' : 'left'
                  }}>
                    <li>• Adwords & PPC strategy</li>
                    <li>• SEO implementation</li>
                    <li>• Content marketing tactics</li>
                    <li>• Landing page optimization</li>
                    <li>• Email marketing campaigns</li>
                    <li>• Any training material clarification</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setShowBookingForm(true)}
                  className="cta-button"
                  style={{ 
                    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem', 
                    padding: window.innerWidth <= 768 ? '0.5rem 1rem' : '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    width: '100%'
                  }}
                >
                  📞 Book Training Call
                </button>
              </div>
            </div>
          </div>

          {/* Quick Training Support */}
          <div className="section">
            <div className="section-header">
              <div className="section-icon">💬</div>
              <h2>Quick Training Support</h2>
            </div>
            <div className="section-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth <= 768 ? '0.5rem' : '0.75rem' }}>
                <button 
                  onClick={() => handleEmailSupport('Video Training Issues')}
                  className="cta-link"
                  style={{ 
                    textAlign: window.innerWidth <= 768 ? 'center' : 'left', 
                    padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                    width: '100%'
                  }}
                >
                  🎥 Video Training Issues
                </button>
                <button 
                  onClick={() => handleEmailSupport('Guide Content Questions')}
                  className="cta-link"
                  style={{ 
                    textAlign: window.innerWidth <= 768 ? 'center' : 'left', 
                    padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                    width: '100%'
                  }}
                >
                  📖 Guide Content Questions
                </button>
                <button 
                  onClick={() => handleEmailSupport('Implementation Help')}
                  className="cta-link"
                  style={{ 
                    textAlign: window.innerWidth <= 768 ? 'center' : 'left', 
                    padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                    width: '100%'
                  }}
                >
                  🔧 Implementation Help
                </button>
                <button 
                  onClick={() => handleEmailSupport('Strategy Clarification')}
                  className="cta-link"
                  style={{ 
                    textAlign: window.innerWidth <= 768 ? 'center' : 'left', 
                    padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                    width: '100%'
                  }}
                >
                  🎯 Strategy Clarification
                </button>
                <button 
                  onClick={() => handleEmailSupport('Technical Training Issues')}
                  className="cta-link"
                  style={{ 
                    textAlign: window.innerWidth <= 768 ? 'center' : 'left', 
                    padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                    width: '100%'
                  }}
                >
                  💻 Technical Training Issues
                </button>
              </div>
            </div>
          </div>

          {/* Training Resources */}
          <div className="section">
            <div className="section-header">
              <div className="section-icon">📚</div>
              <h2>Training Resources</h2>
            </div>
            <div className="section-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/affiliate-centre/training" className="cta-link">
                  <span className="item-icon">🎓</span>
                  Affiliate Training
                </Link>
                <Link to="/affiliate-centre/tools" className="cta-link">
                  <span className="item-icon">🛠️</span>
                  Marketing Tools
                </Link>
                <Link to="/affiliate-centre/support" className="cta-link">
                  <span className="item-icon">💬</span>
                  Full Support Center
                </Link>
                <button 
                  onClick={() => handleEmailSupport('Request New Training Topic')}
                  className="cta-link"
                  style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                >
                  💡 Request New Training Topic
                </button>
              </div>
            </div>
          </div>

          {/* Message from the owner */}
          <div className="section">
            <div className="section-header">
              <h2>Message from the owner:</h2>
            </div>
            <div className="section-content">
              <div className="owner-message">
                <p>This site is all about helping you achieve financial independence with the utmost ease. We're all about providing you with the raw tools you need to make more money, every single day of the year. Whether you're a seasoned marketer or just starting out, we've got your back in every possible way.</p>
                <p>Our incredible marketing platforms and opportunities, combined with our crystal clear purpose and values, make us the membership site that truly understands the product, service, and needs of marketers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>📞 Book Training Call</h3>
              <button 
                onClick={() => setShowBookingForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.name}
                  onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={bookingData.email}
                  onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.preferredDate}
                  onChange={(e) => setBookingData({...bookingData, preferredDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Preferred Time *
                </label>
                <select
                  required
                  value={bookingData.preferredTime}
                  onChange={(e) => setBookingData({...bookingData, preferredTime: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a time...</option>
                  <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                  <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                  <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                  <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                  <option value="Flexible">Flexible - I'll work around your schedule</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Training Topic to Discuss *
                </label>
                <select
                  required
                  value={bookingData.topic}
                  onChange={(e) => setBookingData({...bookingData, topic: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a training topic...</option>
                  <option value="Adwords & PPC Strategy">Adwords & PPC Strategy</option>
                  <option value="SEO Implementation">SEO Implementation</option>
                  <option value="Content Marketing Tactics">Content Marketing Tactics</option>
                  <option value="Landing Page Optimization">Landing Page Optimization</option>
                  <option value="Email Marketing Campaigns">Email Marketing Campaigns</option>
                  <option value="Video Training Clarification">Video Training Clarification</option>
                  <option value="Guide Content Questions">Guide Content Questions</option>
                  <option value="Implementation Help">Implementation Help</option>
                  <option value="Strategy Review">Strategy Review</option>
                  <option value="Other Training Topic">Other Training Topic</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Urgency Level
                </label>
                <select
                  value={bookingData.urgency}
                  onChange={(e) => setBookingData({...bookingData, urgency: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                >
                  <option value="normal">Normal - Within a few days</option>
                  <option value="high">High - Within 24-48 hours</option>
                  <option value="urgent">Urgent - Same day if possible</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  📞 Book Training Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Briefing Modal */}
      <PremiumBriefingModal
        isOpen={showBriefingModal}
        onClose={() => {
          setShowBriefingModal(false);
          setSelectedBriefing(null);
        }}
        briefing={selectedBriefing}
      />
    </div>
  );
};

export default Training; 