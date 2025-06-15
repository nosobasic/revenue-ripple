import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import Navbar from '../components/Navbar';

export default function DMDLanding() {
  return (
    <div className="home">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .home::before {
          display: none !important;
        }
        .hero {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
          padding: 4rem 0 !important;
          color: white !important;
          position: relative !important;
          z-index: 1 !important;
          margin-top: 0 !important;
        }
        .hero::before {
          display: none !important;
        }
        .hero-title {
          color: white !important;
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: unset !important;
          animation: fadeInUp 0.8s ease-out;
          font-size: 2.5rem !important;
          font-weight: 700 !important;
          text-align: center !important;
          margin-bottom: 1.5rem !important;
          opacity: 1 !important;
        }
        .hero-subtitle {
          color: #e2e8f0 !important;
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: unset !important;
          animation: fadeInUp 0.8s ease-out 0.2s backwards;
          font-size: 1.25rem !important;
          font-weight: 500 !important;
          text-align: center !important;
          margin-bottom: 1.5rem !important;
          opacity: 1 !important;
        }
        .cta-button {
          display: inline-block !important;
          padding: 1rem 2rem !important;
          background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%) !important;
          color: white !important;
          text-decoration: none !important;
          border-radius: 0.5rem !important;
          font-weight: 600 !important;
          font-size: 1.1rem !important;
          transition: all 0.3s ease !important;
          border: none !important;
          cursor: pointer !important;
          animation: fadeInUp 0.8s ease-out 0.4s backwards;
          margin: 1rem 0 !important;
        }
        .cta-button:hover {
          background: linear-gradient(90deg, #1d4ed8 0%, #3730a3 100%) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
        }
        .stat-card {
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .testimonial-card {
          transition: all 0.3s ease;
        }
        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Unlock the Secrets to <span style={{ color: '#60a5fa' }}>Digital Marketing Domination</span>
        </h1>
        <p className="hero-subtitle">
          The Ultimate Guide to Building and Executing Winning Marketing Strategies in 2025
        </p>
        
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <div style={{display: 'inline-block', background: '#fef9c3', color: '#166534', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.5rem', animation: 'fadeInUp 0.8s ease-out 0.3s backwards'}}>Limited Time Offer: Only available this week!</div>
          <br />
          <div className="flex justify-center items-center" style={{ marginBottom: '0.5rem', animation: 'fadeInUp 0.8s ease-out 0.4s backwards' }}>
            <div className="flex text-yellow-400 mr-2">
              <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
            </div>
            <div style={{ fontWeight: 500, color: '#0f766e' }}>
              4.9/5 from 238 readers
            </div>
          </div>
          <Link to="/checkout?product=dmd" className="cta-button" aria-label="Purchase Digital Marketing Domination ebook for $7">
            Get Instant Access for $7
          </Link>
          <div style={{marginTop: '0.75rem', animation: 'fadeInUp 0.8s ease-out 0.5s backwards'}}>
            <img src="/assets/images/icons/trust-seal.png" alt="Trusted by marketers worldwide" style={{height: 32}} />
          </div>
        </div>
      </section>

      <div className="container">
        <div className="hero-flex" style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left Side: Book Cover */}
          <div className="hero-side" style={{ flex: 1, minWidth: 280, display: 'flex', justifyContent: 'center', animation: 'fadeInUp 0.8s ease-out 0.6s backwards' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src="/assets/images/images/DMD-book.png" 
                alt="Digital Marketing Domination Book Cover" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              />
              <div style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', color: 'white', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SAVE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>74%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side: Content */}
          <div className="hero-main" style={{ flex: 1, minWidth: 280 }}>
            <div className="content-section" style={{ background: 'white', marginTop: '0', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
                Discover proven strategies for:
              </h3>
              <p style={{ marginBottom: '1rem', color: '#4b5563', lineHeight: 1.6 }}>
                This comprehensive ebook is packed with actionable insights, templates, and step-by-step walkthroughs to help you grow your business and dominate your niche.
              </p>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> <b>Step-by-step marketing playbooks:</b> Follow proven frameworks to launch successful campaigns</li>
                <li><FaCheckCircle className="checkmark" /> <b>Social media growth hacks:</b> Grow your following using strategies from top influencers</li>
                <li><FaCheckCircle className="checkmark" /> <b>High-converting landing pages:</b> Copy templates that turn visitors into buyers</li>
                <li><FaCheckCircle className="checkmark" /> <b>Email marketing secrets:</b> Build automated sales funnels that work 24/7</li>
                <li><FaCheckCircle className="checkmark" /> <b>Data-driven optimization:</b> Use analytics to make smarter marketing choices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* What's Inside Section */}
      <section className="stats-section" style={{ background: '#f8fafc', padding: '2.5rem 0 1rem 0' }}>
        <div className="container">
          <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            What You'll Learn Inside
          </h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span role="img" aria-label="Email Marketing" style={{ fontSize: '2rem', color: '#2563eb' }}>📧</span>
              <div className="stat-number">Email Marketing Mastery</div>
              <p className="stat-label">Build and nurture your audience with high-converting email sequences</p>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="Social Media" style={{ fontSize: '2rem', color: '#059669' }}>📱</span>
              <div className="stat-number">Social Media Strategy</div>
              <p className="stat-label">Create viral content and build a loyal, engaged audience</p>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="SEO" style={{ fontSize: '2rem', color: '#f59e42' }}>🔍</span>
              <div className="stat-number">SEO Fundamentals</div>
              <p className="stat-label">Get found online with proven search engine optimization tactics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" style={{ background: 'none', paddingTop: 0 }}>
        <div className="container">
          <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            What Readers Are Saying
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.75rem' }}>
                <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>"A must-have for any marketer!"</div>
              <div style={{ fontSize: '1rem', color: '#374151' }}>
                I doubled my leads in 2 weeks using the playbooks in this ebook. Highly recommended!
              </div>
              <div style={{ marginTop: '1rem', fontWeight: 500, color: '#6b7280' }}>— Sarah J.</div>
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.75rem' }}>
                <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>"Packed with actionable strategies."</div>
              <div style={{ fontSize: '1rem', color: '#374151' }}>
                The templates and checklists alone are worth the price. My campaigns are finally converting!
              </div>
              <div style={{ marginTop: '1rem', fontWeight: 500, color: '#6b7280' }}>— Mike T.</div>
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.75rem' }}>
                <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
              </div>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>"The only marketing guide you'll ever need."</div>
              <div style={{ fontSize: '1rem', color: '#374151' }}>
                Clear, concise, and full of real-world examples. I wish I had this years ago!
              </div>
              <div style={{ marginTop: '1rem', fontWeight: 500, color: '#6b7280' }}>— Linda G.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="content-section" style={{ background: 'white', marginTop: '2rem' }}>
        <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.1rem', marginBottom: '0.5rem' }}>How will I receive the ebook?</h3>
            <p style={{ color: '#4b5563', fontSize: '1rem' }}>Immediately after purchase, you'll receive an email with download instructions. You can access your ebook instantly.</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Is this a one-time payment?</h3>
            <p style={{ color: '#4b5563', fontSize: '1rem' }}>Yes! This is a one-time payment of $7 with no recurring fees or hidden charges.</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.1rem', marginBottom: '0.5rem' }}>What if I'm not satisfied?</h3>
            <p style={{ color: '#4b5563', fontSize: '1rem' }}>We offer a no-questions-asked 30-day money-back guarantee. If you're not completely satisfied, just email us for a full refund.</p>
          </div>
        </div>
      </div>
      
      {/* Final CTA Section */}
      <div style={{ background: '#fef9c3', padding: '2rem 0', textAlign: 'center', marginTop: '2rem' }}>
        <div className="container">
          <h2 style={{ color: '#166534', fontWeight: 700, fontSize: '1.75rem', marginBottom: '1rem' }}>
            Ready To Unlock Your Marketing Potential?
          </h2>
          <p style={{ color: '#166534', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            Get instant access to the Digital Marketing Domination ebook today
          </p>
          
          <Link to="/checkout?product=dmd" className="cta-button" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem', background: '#2563eb', marginBottom: '1rem' }}>
            Get Instant Access for $7
          </Link>
          
          <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '1rem' }}>
            Instant download. 100% money-back guarantee.
          </p>
          
          <div style={{ marginTop: '1rem' }}>
            <img src="/assets/images/icons/trust-seal.png" alt="Trusted by marketers worldwide" style={{ height: 32, margin: '0 auto' }} />
          </div>
          
          <div style={{ marginTop: '1rem', background: '#fffde7', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '4px', color: '#166534', fontWeight: 600 }}>
            ✅ Mike in Texas just purchased 3 minutes ago
          </div>
        </div>
      </div>
    </div>
  );
}