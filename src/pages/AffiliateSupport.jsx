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
          answer: 'To become an affiliate, simply sign up through our affiliate program page, complete your profile, and start promoting our products using your unique affiliate links.'
        },
        {
          question: 'What commission rates can I expect?',
          answer: 'Commission rates vary by product and performance tier. Standard rates start at 20% and can increase up to 40% based on your sales volume and performance.'
        }
      ]
    },
    {
      id: 2,
      title: 'Payments & Payouts',
      questions: [
        {
          question: 'When will I receive my payments?',
          answer: 'Payments are processed on the 15th of each month for all cleared earnings from the previous month. Minimum payout threshold is $100.'
        },
        {
          question: 'What payment methods are available?',
          answer: 'We currently support PayPal, bank transfers, and cryptocurrency payments. You can set your preferred payment method in your account settings.'
        }
      ]
    }
  ];

  const supportResources = [
    {
      title: 'Affiliate Handbook',
      description: 'Complete guide to our affiliate program',
      icon: '📚'
    },
    {
      title: 'Marketing Guidelines',
      description: 'Best practices and compliance rules',
      icon: '📋'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step training videos',
      icon: '🎥'
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Support & FAQ</h1>
          <p className="dashboard-welcome">Get help and find answers</p>
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
                  <form className="support-form">
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        className="form-input"
                        placeholder="What's your question about?"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        className="form-input"
                        rows="4"
                        placeholder="Please provide details about your issue..."
                      ></textarea>
                    </div>
                    <button type="submit" className="cta-button">Submit Ticket</button>
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
                  <span>24/7 Support</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">⏱️</span>
                  <span>Response within 24h</span>
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