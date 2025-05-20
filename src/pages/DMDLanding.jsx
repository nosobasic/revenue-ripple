import React from 'react';
import { Link } from 'react-router-dom';

export default function DMDLanding() {
  return (
    <div className="dmd-landing" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 900, width: '100%', background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2.5rem' }}>
        {/* Book Cover */}
        <div style={{ flex: 1, minWidth: 320, textAlign: 'center' }}>
          <img src="/assets/images/DMD-book.png" alt="Digital Marketing Domination Book Cover" style={{ width: '100%', maxWidth: 340, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }} />
        </div>
        {/* Content */}
        <div style={{ flex: 2, minWidth: 320 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '1rem', lineHeight: 1.1 }}>Unlock the Secrets to <span style={{ color: '#6366f1' }}>Digital Marketing Domination</span></h1>
          <h2 style={{ fontSize: '1.5rem', color: '#2563eb', fontWeight: 700, marginBottom: '1.5rem' }}>The Ultimate Guide to Building and Executing Winning Strategies</h2>
          <p style={{ fontSize: '1.15rem', color: '#374151', marginBottom: '2rem', lineHeight: 1.7 }}>
            Discover proven strategies for Email, Social Media, SEO, PPC, Content, Branding, Analytics, Affiliate Marketing, and more. This comprehensive ebook is packed with actionable insights, templates, and step-by-step walkthroughs to help you grow your business and dominate your niche.
          </p>
          <ul style={{ marginBottom: '2rem', color: '#166534', fontWeight: 600, fontSize: '1.1rem', listStyle: 'disc inside' }}>
            <li>Step-by-step marketing playbooks</li>
            <li>Expert social media growth hacks</li>
            <li>High-converting landing page formulas</li>
            <li>Affiliate & email marketing secrets</li>
            <li>Analytics and data-driven decision making</li>
          </ul>
          <Link to="/checkout?product=dmd" className="cta-button" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)', color: 'white', fontWeight: 700, fontSize: '1.25rem', padding: '1rem 2.5rem', borderRadius: 8, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.10)', transition: 'background 0.2s' }}>
            Buy Now for $7
          </Link>
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>What Readers Are Saying:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem 1.5rem', flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>"A must-have for any marketer!"</div>
                <div style={{ color: '#374151' }}>I doubled my leads in 2 weeks using the playbooks in this ebook. Highly recommended!</div>
                <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: 6 }}>— Sarah J.</div>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem 1.5rem', flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>"Packed with actionable strategies."</div>
                <div style={{ color: '#374151' }}>The templates and checklists alone are worth the price. My campaigns are finally converting!</div>
                <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: 6 }}>— Mike T.</div>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem 1.5rem', flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>"The only marketing guide you'll ever need."</div>
                <div style={{ color: '#374151' }}>Clear, concise, and full of real-world examples. I wish I had this years ago!</div>
                <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: 6 }}>— Linda G.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 