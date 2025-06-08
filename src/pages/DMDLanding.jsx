import React from 'react';
import { Link } from 'react-router-dom';
// import './DMDLanding.css';

export default function DMDLanding() {
  return (
    <div className="dmd-landing">
      <div className="dmd-container animate-on-scroll">
        {/* Book Cover */}
        <div className="dmd-book-cover">
          <img src="/assets/images/images/DMD-book.png" alt="Digital Marketing Domination Book Cover" className="dmd-book-image" />
        </div>
        {/* Content */}
        <div className="dmd-content">
          <h1 className="dmd-title">Unlock the Secrets to <span className="dmd-highlight">Digital Marketing Domination</span></h1>
          <p className="dmd-subtitle">The Ultimate Guide to Building and Executing Winning Strategies</p>
          <p className="dmd-description">
            Discover proven strategies for Email, Social Media, SEO, PPC, Content, Branding, Analytics, Affiliate Marketing, and more. This comprehensive ebook is packed with actionable insights, templates, and step-by-step walkthroughs to help you grow your business and dominate your niche.
          </p>
          <ul className="dmd-list">
            <li>Step-by-step marketing playbooks</li>
            <li>Expert social media growth hacks</li>
            <li>High-converting landing page formulas</li>
            <li>Affiliate & email marketing secrets</li>
            <li>Analytics and data-driven decision making</li>
          </ul>
          <div className="dmd-urgency-banner">
            <p className="urgency-text">🔥 Limited Time Offer: Only available this week!</p>
          </div>
          <Link to="/checkout?product=dmd" className="cta-button" aria-label="Purchase Digital Marketing Domination ebook for $7">
            Get Instant Access for $7
          </Link>
          <p className="dmd-cta-subtext">
            Instant download. 100% money-back guarantee.
          </p>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <img src="/assets/images/icons/trust-seal.png" alt="Trusted by marketers worldwide" style={{ width: 120, marginBottom: '1rem' }} />
            <div className="dmd-social-proof" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.95rem', color: '#475569' }}>
              <p>✅ Mike in Texas just purchased 3 minutes ago</p>
            </div>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <h3 className="dmd-testimonials-title">What Readers Are Saying:</h3>
            <div className="dmd-testimonials">
              <div className="dmd-testimonial" style={{ maxWidth: 300 }}>
                <div className="dmd-testimonial-quote">"A must-have for any marketer!"</div>
                <div className="dmd-testimonial-text">I doubled my leads in 2 weeks using the playbooks in this ebook. Highly recommended!</div>
                <div className="dmd-testimonial-author">— Sarah J.</div>
              </div>
              <div className="dmd-testimonial" style={{ maxWidth: 300 }}>
                <div className="dmd-testimonial-quote">"Packed with actionable strategies."</div>
                <div className="dmd-testimonial-text">The templates and checklists alone are worth the price. My campaigns are finally converting!</div>
                <div className="dmd-testimonial-author">— Mike T.</div>
              </div>
              <div className="dmd-testimonial" style={{ maxWidth: 300 }}>
                <div className="dmd-testimonial-quote">"The only marketing guide you'll ever need."</div>
                <div className="dmd-testimonial-text">Clear, concise, and full of real-world examples. I wish I had this years ago!</div>
                <div className="dmd-testimonial-author">— Linda G.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}