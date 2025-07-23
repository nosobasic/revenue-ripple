import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AIAssistantWidget from '../components/AIAssistantWidget';
import '../pages.css';

const AffiliateTraining = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const trainingGuides = [
    {
      id: 'getting-started',
      title: 'Getting Started: Your Complete Roadmap to Success',
      description: 'Everything you need to know to hit the ground running as an affiliate or reseller',
      content: `
        <h4>Welcome to Revenue Ripple!</h4>
        <p>You've joined a community of successful marketers who understand that building wealth online requires the right strategy, tools, and mindset. Here's your step-by-step roadmap to success:</p>
        
        <h5>Step 1: Understand Your Products</h5>
        <p>Before promoting anything, you need to know what you're selling inside and out:</p>
        <ul>
          <li><strong>Digital Marketing Domination Book ($7):</strong> Perfect entry-level offer that teaches lead magnets, landing pages, and copywriting fundamentals</li>
          <li><strong>Monthly Membership ($47):</strong> Comprehensive training covering 25+ marketing topics with ongoing updates</li>
          <li><strong>Reseller Program ($47):</strong> Allows members to resell the membership for 100% commission on every member they refer</li>
          <li><strong>Pro Reseller ($97):</strong> Premium tier earning commission on every reseller and member they refer plus exclusive materials</li>
        </ul>
        
        <h5>Step 2: Set Up Your Foundation</h5>
        <p>Success starts with proper setup:</p>
        <ul>
          <li>Download and study "Unlock Your Marketing Potential" - this is your affiliate bible</li>
          <li>Set up your email autoresponder (GetResponse recommended)</li>
          <li>Create your first landing page using our templates</li>
          <li>Get familiar with your affiliate dashboard and tracking links</li>
        </ul>
        
        <h5>Step 3: Build Your Email List</h5>
        <p>Your email list is your greatest asset. Use our proven lead magnets like "Membership Mastery" to attract subscribers. Remember: you're not just collecting emails, you're building relationships.</p>
        
        <h5>Step 4: Follow the Proven System</h5>
        <p>We've done the hard work for you. Use our pre-written email sequences, follow our traffic strategies from "Unleash the Power of Traffic," and stick to the plan. Consistency beats perfection every time.</p>
      `
    },
    {
      id: 'email-marketing',
      title: 'Email Marketing Mastery: Your Money-Making Machine',
      description: 'Turn your email list into a consistent revenue stream',
      content: `
        <h4>The Power of Email Marketing</h4>
        <p>Email marketing remains the highest ROI channel in digital marketing. For every $1 spent, the average return is $42. Here's how to build your money-making machine:</p>
        
        <h5>Building Your List</h5>
        <p>Start with our proven lead magnets:</p>
        <ul>
          <li><strong>"Membership Mastery":</strong> Perfect for attracting aspiring entrepreneurs</li>
          <li><strong>"Unlock Your Marketing Potential":</strong> Appeals to business owners wanting to improve their marketing</li>
          <li>Create targeted landing pages for each lead magnet</li>
          <li>Use compelling headlines that speak to specific pain points</li>
        </ul>
        
        <h5>The Indoctrination Sequence</h5>
        <p>Your first 7 emails are crucial. They should:</p>
        <ol>
          <li>Welcome new subscribers and set expectations</li>
          <li>Share your story and build trust</li>
          <li>Provide immediate value (quick wins)</li>
          <li>Introduce the broader vision</li>
          <li>Address common objections</li>
          <li>Make your first soft offer</li>
          <li>Transition to regular content</li>
        </ol>
        
        <h5>The 26-Lesson Email Course</h5>
        <p>Use our bi-weekly lessons from the Digital Marketing Domination series. These are designed to:</p>
        <ul>
          <li>Educate your audience consistently</li>
          <li>Build authority and trust</li>
          <li>Warm up prospects for offers</li>
          <li>Provide ongoing value</li>
        </ul>
        
        <h5>Promotion Strategy</h5>
        <p>Follow the 80/20 rule: 80% value, 20% promotion. When you do promote:</p>
        <ul>
          <li>Lead with the problem, not the product</li>
          <li>Share success stories and case studies</li>
          <li>Create urgency with limited-time bonuses</li>
          <li>Always follow up - most sales happen after multiple touches</li>
        </ul>
      `
    },
    {
      id: 'traffic-generation',
      title: 'Traffic Generation: Fuel Your Marketing Machine',
      description: 'Master the art of driving quality traffic to your offers',
      content: `
        <h4>Traffic is the Lifeblood of Your Business</h4>
        <p>Without traffic, even the best offer won't make money. Here's how to drive quality visitors to your pages:</p>
        
        <h5>Free Traffic Sources</h5>
        <p><strong>Content Marketing:</strong></p>
        <ul>
          <li>Start a blog focused on marketing tips and strategies</li>
          <li>Guest post on relevant industry blogs</li>
          <li>Create valuable YouTube videos</li>
          <li>Share insights on LinkedIn and Facebook groups</li>
        </ul>
        
        <p><strong>Social Media Marketing:</strong></p>
        <ul>
          <li><strong>Facebook:</strong> Join groups, share value, build relationships</li>
          <li><strong>Instagram:</strong> Use Stories and Reels to showcase behind-the-scenes content</li>
          <li><strong>TikTok:</strong> Create short, engaging videos about marketing tips</li>
          <li><strong>LinkedIn:</strong> Perfect for B2B marketing content</li>
        </ul>
        
        <p><strong>SEO (Search Engine Optimization):</strong></p>
        <ul>
          <li>Target long-tail keywords related to digital marketing</li>
          <li>Create in-depth guides and tutorials</li>
          <li>Build backlinks through guest posting and partnerships</li>
        </ul>
        
        <h5>Paid Traffic Sources</h5>
        <p><strong>Facebook Ads:</strong></p>
        <ul>
          <li>Start with a small budget ($10-20/day)</li>
          <li>Target interests related to entrepreneurship and marketing</li>
          <li>Use video ads for higher engagement</li>
          <li>Test different audiences and creatives</li>
        </ul>
        
        <p><strong>Google Ads:</strong></p>
        <ul>
          <li>Target keywords like "how to make money online"</li>
          <li>Create compelling ad copy that matches search intent</li>
          <li>Use negative keywords to filter out irrelevant traffic</li>
          <li>Monitor quality scores and optimize regularly</li>
        </ul>
        
        <h5>Traffic Optimization Tips</h5>
        <ul>
          <li>Always track your traffic sources - know what's working</li>
          <li>Focus on quality over quantity</li>
          <li>Test different headlines and landing pages</li>
          <li>Use retargeting to re-engage visitors who didn't convert</li>
          <li>Build relationships, not just traffic</li>
        </ul>
      `
    },
    {
      id: 'conversion-optimization',
      title: 'Conversion Optimization: Turn Visitors into Customers',
      description: 'Maximize your earnings by optimizing every step of the customer journey',
      content: `
        <h4>The Science of Conversion</h4>
        <p>Getting traffic is only half the battle. Converting that traffic into paying customers is where the real money is made. Here's how to optimize for maximum conversions:</p>
        
        <h5>Landing Page Optimization</h5>
        <p><strong>Essential Elements:</strong></p>
        <ul>
          <li><strong>Headline:</strong> Clear, benefit-driven, addresses specific pain point</li>
          <li><strong>Subheadline:</strong> Expands on the headline with more detail</li>
          <li><strong>Value Proposition:</strong> What they get and why it matters</li>
          <li><strong>Social Proof:</strong> Testimonials, reviews, case studies</li>
          <li><strong>Call-to-Action:</strong> Clear, compelling, action-oriented</li>
        </ul>
        
        <p><strong>Optimization Tips:</strong></p>
        <ul>
          <li>Keep forms short - only ask for what you need</li>
          <li>Use contrasting colors for your CTA buttons</li>
          <li>Remove navigation to reduce distractions</li>
          <li>Use urgency and scarcity when appropriate</li>
          <li>Mobile-optimize everything</li>
        </ul>
        
        <h5>Email Conversion Strategies</h5>
        <p><strong>Subject Line Optimization:</strong></p>
        <ul>
          <li>Keep it under 50 characters</li>
          <li>Use curiosity, not clickbait</li>
          <li>Personalize when possible</li>
          <li>A/B test different approaches</li>
        </ul>
        
        <p><strong>Email Content That Converts:</strong></p>
        <ul>
          <li>Start with a story or problem</li>
          <li>Provide value before asking for anything</li>
          <li>Use the "Problem-Agitation-Solution" formula</li>
          <li>Include clear, single call-to-actions</li>
          <li>Create urgency with limited-time offers</li>
        </ul>
        
        <h5>Sales Psychology</h5>
        <p><strong>Trust-Building Elements:</strong></p>
        <ul>
          <li>Money-back guarantees</li>
          <li>Customer testimonials and reviews</li>
          <li>Professional design and branding</li>
          <li>Clear contact information</li>
          <li>Security badges and certifications</li>
        </ul>
        
        <p><strong>Overcoming Objections:</strong></p>
        <ul>
          <li>Address price concerns with value demonstration</li>
          <li>Handle skepticism with proof and testimonials</li>
          <li>Reduce risk with guarantees and trials</li>
          <li>Show urgency without being pushy</li>
        </ul>
        
        <h5>Testing and Analytics</h5>
        <ul>
          <li>Track everything: clicks, opens, conversions</li>
          <li>A/B test headlines, buttons, and offers</li>
          <li>Use heat mapping tools to see user behavior</li>
          <li>Monitor bounce rates and time on page</li>
          <li>Continuously optimize based on data</li>
        </ul>
      `
    },
    {
      id: 'scaling-success',
      title: 'Scaling Your Success: From Beginner to Pro',
      description: 'Advanced strategies to multiply your earnings and build a sustainable business',
      content: `
        <h4>Taking It to the Next Level</h4>
        <p>Once you've mastered the basics, it's time to scale. Here's how successful affiliates and resellers multiply their earnings:</p>
        
        <h5>The Power of Leverage</h5>
        <p><strong>Upgrade Your Status:</strong></p>
        <ul>
          <li><strong>Reseller ($47/month):</strong> 100% commission on every other sale plus advanced materials</li>
          <li><strong>Pro Reseller ($97/month):</strong> 100% commission on EVERY sale plus exclusive assets</li>
          <li>Higher tiers = higher commissions = more earning potential</li>
        </ul>
        
        <p><strong>Multiple Traffic Sources:</strong></p>
        <ul>
          <li>Don't rely on just one traffic source</li>
          <li>Diversify across organic and paid channels</li>
          <li>Build email lists on multiple platforms</li>
          <li>Create content across different media types</li>
        </ul>
        
        <h5>Advanced Marketing Strategies</h5>
        <p><strong>Funnel Multiplication:</strong></p>
        <ul>
          <li>Create separate funnels for different audiences</li>
          <li>Build specific landing pages for each traffic source</li>
          <li>Develop multiple lead magnets for different interests</li>
          <li>Segment your email list based on behavior and interests</li>
        </ul>
        
        <p><strong>Content Amplification:</strong></p>
        <ul>
          <li>Repurpose one piece of content across multiple channels</li>
          <li>Turn blog posts into videos, podcasts, and social media posts</li>
          <li>Create case studies from successful promotions</li>
          <li>Build a personal brand around your success</li>
        </ul>
        
        <h5>Building a Team</h5>
        <p>As you scale, consider building a team:</p>
        <ul>
          <li><strong>Virtual Assistants:</strong> Handle routine tasks and customer service</li>
          <li><strong>Content Creators:</strong> Writers, video editors, designers</li>
          <li><strong>Media Buyers:</strong> Specialists in paid advertising</li>
          <li><strong>Affiliate Managers:</strong> Help recruit and manage sub-affiliates</li>
        </ul>
        
        <h5>Tracking and Analytics</h5>
        <p><strong>Key Metrics to Monitor:</strong></p>
        <ul>
          <li>Customer Lifetime Value (CLV)</li>
          <li>Cost Per Acquisition (CPA)</li>
          <li>Conversion rates by traffic source</li>
          <li>Email open and click rates</li>
          <li>Revenue per subscriber</li>
        </ul>
        
        <p><strong>Optimization Focus Areas:</strong></p>
        <ul>
          <li>Increase average order value with upsells</li>
          <li>Improve retention with better onboarding</li>
          <li>Reduce churn with engaging content</li>
          <li>Maximize lifetime value with backend offers</li>
        </ul>
        
        <h5>Long-Term Wealth Building</h5>
        <ul>
          <li>Reinvest profits into growth opportunities</li>
          <li>Build multiple income streams</li>
          <li>Create your own products and services</li>
          <li>Develop passive income systems</li>
          <li>Build a personal brand that outlasts any single program</li>
        </ul>
      `
    }
  ];

  const quickStartChecklist = [
    { task: 'Download and study "Unlock Your Marketing Potential"', completed: false },
    { task: 'Set up email autoresponder account', completed: false },
    { task: 'Create your first landing page', completed: false },
    { task: 'Generate your affiliate tracking links', completed: false },
    { task: 'Set up lead magnet campaign', completed: false },
    { task: 'Write your indoctrination email sequence', completed: false },
    { task: 'Launch your first traffic campaign', completed: false },
    { task: 'Track and optimize your results', completed: false }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <AIAssistantWidget />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Affiliate Training & Guides</h1>
          <p className="dashboard-welcome">Your Complete Success Roadmap</p>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* How to Use This Training */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">🎯</div>
              <h2>How to Use This Training</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <p style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    This training is designed to take you from complete beginner to successful affiliate marketer. 
                    Work through each section in order, implement what you learn, and use the Ripple AI assistant 
                    if you have questions along the way.
                  </p>
                  <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ color: '#4F46E5', marginBottom: '0.5rem' }}>💡 Pro Tip</h4>
                    <p style={{ color: '#4b5563', margin: 0 }}>
                      Don't just read - implement! Success comes from taking action on what you learn. 
                      Start with the basics and build momentum.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Training Guides */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">📚</div>
              <h2>Complete Training Guides</h2>
            </div>
            <div className="section-content">
              {trainingGuides.map((guide) => (
                <div key={guide.id} className="course-item">
                  <div 
                    className={`course-item ${expandedSection === guide.id ? 'expanded' : ''}`}
                    onClick={() => toggleSection(guide.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3>{guide.title}</h3>
                    {expandedSection === guide.id && (
                      <div className="course-details">
                        <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: '#6b7280' }}>{guide.description}</p>
                        <div 
                          style={{ color: '#1f2937' }}
                          dangerouslySetInnerHTML={{ __html: guide.content }} 
                        />
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            💬 Need help with anything in this guide? Ask the Ripple AI assistant for personalized advice!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side Content */}
        <div className="side-content">
          {/* Quick Start Checklist */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">✅</div>
              <h2>Quick Start Checklist</h2>
            </div>
            <div className="section-content">
              <p style={{ color: '#4b5563', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Complete these tasks to get up and running quickly:
              </p>
              {quickStartChecklist.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '0.75rem',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px'
                }}>
                  <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>
                    {item.completed ? '✅' : '⭕'}
                  </span>
                  <span style={{ 
                    color: item.completed ? '#10B981' : '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Success Tips */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">🏆</div>
              <h2>Success Tips</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <h3>Top Performer Secrets</h3>
                <div className="course-details">
                  <ul style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                    <li>Focus on building relationships, not just making sales</li>
                    <li>Provide value first, promote second</li>
                    <li>Consistency beats perfection every time</li>
                    <li>Track everything and optimize based on data</li>
                    <li>Upgrade to higher tiers for better commissions</li>
                    <li>Never stop learning and improving</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">📋</div>
              <h2>Additional Resources</h2>
            </div>
            <div className="section-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/affiliate-centre/tools" className="cta-link">
                  <span className="item-icon">🛠️</span>
                  Marketing Tools & Materials
                </Link>
                <Link to="/training" className="cta-link">
                  <span className="item-icon">🎥</span>
                  Video Training Library
                </Link>
                <Link to="/affiliate-centre/payouts" className="cta-link">
                  <span className="item-icon">💰</span>
                  Track Your Earnings
                </Link>
                <Link to="/affiliate-centre/support" className="cta-link">
                  <span className="item-icon">💬</span>
                  Get Support & FAQ
                </Link>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">📋</div>
              <h2>Navigation</h2>
            </div>
            <div className="section-content">
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre" className="cta-link">
                    <span className="item-icon">🏠</span>
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/tools" className="cta-link">
                    <span className="item-icon">🛠️</span>
                    Marketing Tools
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/payouts" className="cta-link">
                    <span className="item-icon">💰</span>
                    Earnings & Payouts
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/support" className="cta-link">
                    <span className="item-icon">💬</span>
                    Support & FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AffiliateTraining; 