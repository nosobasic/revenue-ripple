import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
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

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
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
                  <h3>Bulletproof Branding</h3>
                  {expandedSection === 'branding' && (
                    <div className="course-details">
                      <p>Your brand is your reputation. Learn how to build one that hits hard and sticks with people long after they scroll past.</p>
                      <Link to="/training/videos/bulletproof-branding" className="cta-link">
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
        </div>

        {/* Side Content - Message from owner */}
        <div className="side-content">
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
    </div>
  );
};

export default Training; 