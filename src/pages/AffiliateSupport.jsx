import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliateSupport = () => {
  const faqCategories = [
    {
      id: 1,
      title: 'Getting Started',
      questions: [
        {
          question: 'How do I become an affiliate?',
          answer: 'To become an affiliate, simply sign up through our affiliate program page, complete your profile, and start promoting our products using your unique affiliate links. You can access your affiliate dashboard immediately after registration.'
        },
        {
          question: 'What commission rates can I expect?',
          answer: 'Affiliates earn 50% commission on every member they refer. Resellers earn 100% commission on every member they refer. Pro Resellers ($97/month) earn commission on every reseller and member they refer, plus get advanced marketing assets and exclusive materials.'
        },
        {
          question: 'How do I get my unique affiliate links?',
          answer: 'Once logged in to your affiliate dashboard, you can generate unique tracking links for any product in our catalog. These links contain your affiliate ID to ensure proper commission tracking.'
        },
        {
          question: 'What\'s the difference between Affiliate, Reseller, and Pro Reseller?',
          answer: 'Affiliates earn 50% commission on every member they refer. Resellers earn 100% commission on every member they refer and get additional marketing materials. Pro Resellers ($97/month) earn commission on every reseller and member they refer, plus get advanced marketing assets and exclusive materials.'
        }
      ]
    },
    {
      id: 2,
      title: 'Payments & Payouts',
      questions: [
        {
          question: 'When will I receive my payments?',
          answer: 'Payments are processed on the 15th of each month for all cleared earnings from the previous month. Minimum payout threshold is $100. Payments typically arrive within 2-3 business days via PayPal.'
        },
        {
          question: 'What payment methods are available?',
          answer: 'We currently support PayPal, bank transfers, and cryptocurrency payments (Bitcoin, Ethereum). You can set your preferred payment method in your account settings under the "Payouts" section.'
        },
        {
          question: 'Is there a minimum payout amount?',
          answer: 'Yes, the minimum payout threshold is $100. This helps reduce processing fees and ensures efficient payment handling. Your earnings will accumulate until you reach this threshold.'
        },
        {
          question: 'How can I track my earnings?',
          answer: 'Your affiliate dashboard provides real-time tracking of clicks, conversions, and earnings. You can view detailed analytics including conversion rates, top-performing products, and payment history.'
        }
      ]
    },
    {
      id: 3,
      title: 'Marketing & Promotion',
      questions: [
        {
          question: 'What marketing materials are provided?',
          answer: 'We provide high-converting email templates, banner ads (multiple sizes), social media posts, landing page templates, lead magnets, and detailed product descriptions. Pro Resellers get exclusive premium materials.'
        },
        {
          question: 'Can I create my own promotional content?',
          answer: 'Absolutely! You\'re encouraged to create your own content. However, please ensure it aligns with our brand guidelines and doesn\'t make unrealistic income claims. Review our marketing guidelines for specific requirements.'
        },
        {
          question: 'How do I build an email list for promotions?',
          answer: 'Use our proven lead magnets like "Unlock Your Marketing Potential" or "Membership Mastery" to attract subscribers. Set up landing pages using the templates provided, then nurture leads with our pre-written email sequences.'
        },
        {
          question: 'What are the best traffic sources?',
          answer: 'Effective traffic sources include email marketing, social media (Facebook, Instagram, TikTok), content marketing, paid ads (Google, Facebook), YouTube, and organic SEO. Focus on channels where your audience is most active.'
        },
        {
          question: 'Are there any prohibited marketing methods?',
          answer: 'Yes. Prohibited methods include spam emails, misleading advertising, trademark infringement, adult content placement, and making unrealistic income claims. Review our complete terms of service for details.'
        }
      ]
    },
    {
      id: 4,
      title: 'Technical Support',
      questions: [
        {
          question: 'My affiliate links aren\'t tracking properly. What should I do?',
          answer: 'First, ensure you\'re using the correct link format from your dashboard. Clear your browser cache, test the link in incognito mode, and check that cookies are enabled. If issues persist, contact our technical support team.'
        },
        {
          question: 'How do I access the marketing materials download area?',
          answer: 'Navigate to your Affiliate Tools section from your dashboard. All downloadable materials are organized by category (emails, banners, lead magnets, etc.). Click "Download All" for convenience or select individual items.'
        },
        {
          question: 'I can\'t log into my affiliate dashboard. Help!',
          answer: 'Use the "Forgot Password" link on the login page to reset your credentials. If you\'re still having trouble, ensure you\'re using the correct email address and check your spam folder for reset emails.'
        },
        {
          question: 'How do I update my payment information?',
          answer: 'Log into your dashboard, go to "Account Settings" > "Payment Information," and update your PayPal email or bank details. Changes may take up to 24 hours to process.'
        }
      ]
    },
    {
      id: 5,
      title: 'Product Information',
      questions: [
        {
          question: 'What products can I promote as an affiliate?',
          answer: 'You can promote our complete product suite including: Digital Marketing Domination Book ($7), Monthly Membership ($47), Reseller Program ($47), Pro Reseller Upgrade ($97), and various lead magnets and courses.'
        },
        {
          question: 'What\'s included in the Monthly Membership?',
          answer: 'The membership includes access to comprehensive marketing courses (25+ topics), monthly live training sessions, marketing templates and tools, exclusive member community, and priority support.'
        },
        {
          question: 'How is the Reseller Program different from regular membership?',
          answer: 'Resellers get everything in the membership PLUS the right to resell the membership for 100% commission on every member they refer, advanced marketing materials, reseller training, and higher-tier support.'
        },
        {
          question: 'What makes the Pro Reseller worth the upgrade?',
          answer: 'Pro Resellers earn commission on every reseller and member they refer, get exclusive premium marketing materials, advanced training modules, priority support, and can promote both membership and reseller programs.'
        }
      ]
    },
    {
      id: 6,
      title: 'Success Tips & Best Practices',
      questions: [
        {
          question: 'What\'s the best way to get started?',
          answer: 'Start by thoroughly understanding our products, download and study our marketing materials, set up your email autoresponder with our provided sequences, create your first landing page, and begin building your email list with a proven lead magnet.'
        },
        {
          question: 'How long does it typically take to see results?',
          answer: 'Results vary based on effort and strategy, but most affiliates see their first commissions within 30-90 days of consistent promotion. Focus on building relationships and providing value rather than just selling.'
        },
        {
          question: 'What\'s the key to high conversions?',
          answer: 'Success comes from building trust with your audience, using our proven email sequences, following up consistently, targeting the right audience, and focusing on the value our products provide rather than just the price.'
        },
        {
          question: 'How do top affiliates maximize their earnings?',
          answer: 'Top performers focus on email list building, use multiple traffic sources, consistently follow up with prospects, provide bonuses for their referrals, and upgrade to higher commission tiers (Reseller/Pro Reseller).'
        }
      ]
    }
  ];

  const supportResources = [
    {
      title: 'Affiliate Handbook',
      description: 'Complete step-by-step guide to affiliate success',
      icon: '📚'
    },
    {
      title: 'Marketing Guidelines',
      description: 'Compliance rules and best practices',
      icon: '📋'
    },
    {
      title: 'Video Tutorials',
      description: 'Visual guides for dashboard and tools',
      icon: '🎥'
    },
    {
      title: 'Success Stories',
      description: 'Real case studies from top affiliates',
      icon: '⭐'
    },
    {
      title: 'Marketing Templates',
      description: 'Ready-to-use emails, ads, and content',
      icon: '📄'
    },
    {
      title: 'Live Training Schedule',
      description: 'Weekly group coaching sessions',
      icon: '🗓️'
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Support & FAQ</h1>
          <p className="dashboard-welcome">Get help and find answers to maximize your success</p>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* FAQ Section */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">❓</div>
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="section-content">
              {faqCategories.map((category) => (
                <div key={category.id} className="course-item">
                  <h3>{category.title}</h3>
                  <div className="course-details">
                    {category.questions.map((faq, index) => (
                      <div key={index} className="faq-item">
                        <h4>{faq.question}</h4>
                        <p>{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">✉️</div>
              <h2>Contact Support</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <p style={{ marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    Can't find what you're looking for? Our support team is here to help you succeed. 
                    Please provide as much detail as possible so we can assist you quickly.
                  </p>
                  <form className="support-form">
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <select id="subject" className="form-input">
                        <option value="">Select a topic...</option>
                        <option value="account">Account & Login Issues</option>
                        <option value="payments">Payments & Commissions</option>
                        <option value="marketing">Marketing & Promotion</option>
                        <option value="technical">Technical Support</option>
                        <option value="products">Product Questions</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="priority">Priority Level</label>
                      <select id="priority" className="form-input">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        className="form-input"
                        rows="6"
                        placeholder="Please describe your issue in detail. Include any error messages, steps you've taken, and what you were trying to accomplish..."
                      ></textarea>
                    </div>
                    <button type="submit" className="cta-button">Submit Support Ticket</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="side-content">
          {/* Support Resources */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">📚</div>
              <h2>Support Resources</h2>
            </div>
            <div className="section-content">
              <div className="resources-list">
                {supportResources.map((resource, index) => (
                  <div key={index} className="resource-item">
                    <span className="resource-icon">{resource.icon}</span>
                    <div className="resource-info">
                      <h4>{resource.title}</h4>
                      <p>{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Contact */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">💬</div>
              <h2>Quick Contact</h2>
            </div>
            <div className="section-content">
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>support@revenue-ripple.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">⏰</span>
                  <span>Response within 24 hours</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">💬</span>
                  <span>Priority support for Pro Resellers</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🎯</span>
                  <span>Success coaching available</span>
                </div>
              </div>
            </div>
          </section>

          {/* Common Issues */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">🔧</div>
              <h2>Common Quick Fixes</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <h3>Link Not Tracking?</h3>
                <div className="course-details">
                  <p>Clear browser cache, test in incognito mode, ensure cookies are enabled.</p>
                </div>
              </div>
              <div className="course-item">
                <h3>Missing Commission?</h3>
                <div className="course-details">
                  <p>Check if customer used correct link, allow 24-48 hours for tracking updates.</p>
                </div>
              </div>
              <div className="course-item">
                <h3>Login Issues?</h3>
                <div className="course-details">
                  <p>Use password reset, check spam folder, ensure correct email address.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="section">
            <div className="section-header marketing">
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
                  <Link to="/affiliate-centre/training" className="cta-link">
                    <span className="item-icon">📚</span>
                    Training & Guides
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/payouts" className="cta-link">
                    <span className="item-icon">💰</span>
                    Earnings & Payouts
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

export default AffiliateSupport; 