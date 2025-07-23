import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliateSupport = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    topic: '',
    urgency: 'normal'
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Here you would integrate with your booking system (Calendly, Acuity, etc.)
    const mailtoLink = `mailto:book@revenue-ripple.com?subject=Call Booking Request - ${bookingData.topic}&body=Hi,%0D%0A%0D%0AI'd like to book a call to discuss: ${bookingData.topic}%0D%0A%0D%0APreferred Date: ${bookingData.preferredDate}%0D%0APreferred Time: ${bookingData.preferredTime}%0D%0AUrgency: ${bookingData.urgency}%0D%0A%0D%0AName: ${bookingData.name}%0D%0AEmail: ${bookingData.email}%0D%0APhone: ${bookingData.phone}%0D%0A%0D%0AThanks!`;
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
    const mailtoLink = `mailto:support@revenue-ripple.com?subject=Support Request - ${topic}&body=Hi Support Team,%0D%0A%0D%0AI need help with: ${topic}%0D%0A%0D%0APlease provide details about your issue below:%0D%0A%0D%0A%0D%0A%0D%0AThanks!`;
    window.open(mailtoLink, '_blank');
  };

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
          answer: 'Commission rates vary by product and performance tier. Standard affiliate rates start at 20% and can increase up to 40% based on your sales volume and performance. Resellers earn 100% commission on every other sale, while Pro Resellers earn 100% on every sale.'
        },
        {
          question: 'How do I get my unique affiliate links?',
          answer: 'Once logged in to your affiliate dashboard, you can generate unique tracking links for any product in our catalog. These links contain your affiliate ID to ensure proper commission tracking.'
        },
        {
          question: 'What\'s the difference between Affiliate, Reseller, and Pro Reseller?',
          answer: 'Affiliates earn commissions on product sales. Resellers get additional marketing materials and earn 100% commission on every other membership sale. Pro Resellers ($97/month) earn 100% commission on ALL sales and get advanced marketing assets.'
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
          answer: 'Resellers get everything in the membership PLUS the right to resell the membership for 100% commission on every other sale, advanced marketing materials, reseller training, and higher-tier support.'
        },
        {
          question: 'What makes the Pro Reseller worth the upgrade?',
          answer: 'Pro Resellers earn 100% commission on EVERY sale (not every other), get exclusive premium marketing materials, advanced training modules, priority support, and can promote both membership and reseller programs.'
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
          {/* Book a Call Section - NEW */}
          <section className="section">
            <div className="section-header reseller" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="section-icon">📞</div>
              <h2>Book a 1-on-1 Call with the Owner</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '2rem', 
                    borderRadius: '12px', 
                    marginBottom: '2rem',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.5rem' }}>
                      🚀 Get Direct Access to Expert Guidance
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      Feeling stuck? Need personalized strategy advice? Book a direct call with the Revenue Ripple owner. 
                      Get answers to your specific questions, strategy review, or troubleshooting help that's tailored to your situation.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>🎯 What We'll Cover:</h4>
                        <ul style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                          <li>Strategy review & optimization</li>
                          <li>Technical troubleshooting</li>
                          <li>Marketing campaign analysis</li>
                          <li>Scaling your affiliate business</li>
                          <li>Product-specific guidance</li>
                        </ul>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>⏰ Call Details:</h4>
                        <ul style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                          <li>15-30 minute sessions</li>
                          <li>Flexible scheduling</li>
                          <li>Video or phone calls</li>
                          <li>Follow-up resources</li>
                          <li>Priority for Pro Resellers</li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowBookingForm(true)}
                      className="cta-button"
                      style={{ 
                        fontSize: '1.1rem', 
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      📞 Book Your Call Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Contact Options - NEW */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">💬</div>
              <h2>Quick Contact Options</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <p style={{ marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    Choose the best way to get help based on your needs. We're here to support your success!
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '1.5rem', 
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📧 Email Support
                      </h4>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Send us a detailed email for non-urgent issues, general questions, or when you need written documentation.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEmailSupport('Account & Login Issues')}
                          className="cta-link"
                          style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                        >
                          🔐 Account & Login Issues
                        </button>
                        <button 
                          onClick={() => handleEmailSupport('Payments & Commissions')}
                          className="cta-link"
                          style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                        >
                          💰 Payments & Commissions
                        </button>
                        <button 
                          onClick={() => handleEmailSupport('Marketing & Promotion')}
                          className="cta-link"
                          style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                        >
                          📈 Marketing & Promotion
                        </button>
                        <button 
                          onClick={() => handleEmailSupport('Technical Support')}
                          className="cta-link"
                          style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                        >
                          🔧 Technical Support
                        </button>
                        <button 
                          onClick={() => handleEmailSupport('Product Questions')}
                          className="cta-link"
                          style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem' }}
                        >
                          📚 Product Questions
                        </button>
                      </div>
                    </div>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '1.5rem', 
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🚨 Urgent Issues
                      </h4>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        For urgent matters that need immediate attention, use these priority contact methods.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEmailSupport('URGENT - Payment Issue')}
                          className="cta-link"
                          style={{ 
                            textAlign: 'left', 
                            padding: '0.75rem', 
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px'
                          }}
                        >
                          🚨 URGENT - Payment Issue
                        </button>
                        <button 
                          onClick={() => handleEmailSupport('URGENT - Account Access')}
                          className="cta-link"
                          style={{ 
                            textAlign: 'left', 
                            padding: '0.75rem', 
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px'
                          }}
                        >
                          🚨 URGENT - Account Access
                        </button>
                        <button 
                          onClick={() => handleEmailSupport('URGENT - Technical Problem')}
                          className="cta-link"
                          style={{ 
                            textAlign: 'left', 
                            padding: '0.75rem', 
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px'
                          }}
                        >
                          🚨 URGENT - Technical Problem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
              <h2>Detailed Support Ticket</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <div className="course-details">
                  <p style={{ marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    For complex issues that require detailed documentation, use this form to submit a comprehensive support ticket.
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
                <h3 style={{ color: '#fff', margin: 0 }}>📞 Book Your Call</h3>
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
                    What would you like to discuss? *
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
                    <option value="">Select a topic...</option>
                    <option value="Strategy Review & Optimization">Strategy Review & Optimization</option>
                    <option value="Technical Troubleshooting">Technical Troubleshooting</option>
                    <option value="Marketing Campaign Analysis">Marketing Campaign Analysis</option>
                    <option value="Scaling Your Affiliate Business">Scaling Your Affiliate Business</option>
                    <option value="Product-Specific Guidance">Product-Specific Guidance</option>
                    <option value="General Q&A">General Q&A</option>
                    <option value="Other">Other</option>
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
                    📞 Book Call
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

          {/* Enhanced Quick Contact */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">💬</div>
              <h2>Contact Information</h2>
            </div>
            <div className="section-content">
              <div className="contact-info">
                <div className="contact-item" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Email Support</strong>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>support@revenue-ripple.com</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>Response within 24 hours</div>
                  </div>
                </div>
                <div className="contact-item" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Book a Call</strong>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>1-on-1 with the owner</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>15-30 minute sessions</div>
                  </div>
                </div>
                <div className="contact-item" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span className="contact-icon">⭐</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Pro Reseller Priority</strong>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Faster response times</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>Direct access to owner</div>
                  </div>
                </div>
                <div className="contact-item" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span className="contact-icon">🎯</span>
                  <div>
                    <strong style={{ color: '#fff' }}>Success Coaching</strong>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Strategy & optimization</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>Personalized guidance</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Value Proposition */}
          <section className="section">
            <div className="section-header digital" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="section-icon">🚀</div>
              <h2>Why Our Support is Different</h2>
            </div>
            <div className="section-content">
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
                  💎 Premium Support Experience
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍💼</div>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem' }}>Direct Access</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>Talk directly to the owner</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem' }}>Fast Response</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>24-hour turnaround</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem' }}>Personalized</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>Tailored solutions</div>
                  </div>
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