import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function ResellerSuccess() {
  useEffect(() => {
    // Add any post-purchase tracking or analytics here
  }, []);

  return (
    <div className="frontend-container">
      {/* Success Message */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to the Revenue Ripple Reseller Program! 🎉</h1>
        <p className="hero-subtitle">
          Congratulations on joining our exclusive reseller program. You're now part of a community of successful digital marketers.
        </p>
      </section>

      {/* Next Steps */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="feature-title">Access Your Dashboard</h3>
          <p className="feature-description">
            Your reseller dashboard is now active. Log in to access your unique affiliate links, marketing materials, and performance tracking.
          </p>
          <Link to="/affiliate-centre" className="cta-link">Go to Dashboard</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="feature-title">Review Training Materials</h3>
          <p className="feature-description">
            Access our comprehensive training resources to learn the best strategies for promoting Revenue Ripple products.
          </p>
          <Link to="/training" className="cta-link">Start Training</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="feature-title">Join the Community</h3>
          <p className="feature-description">
            Connect with other successful resellers in our private community. Share strategies and get support from top performers.
          </p>
          <Link to="/community" className="cta-link">Join Community</Link>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="stats-section">
        <h2 className="section-title">Your Reseller Benefits</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">40%</div>
            <div className="stat-label">Commission Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">$1000+</div>
            <div className="stat-label">Average Monthly Earnings</div>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="content-section">
        <h2 className="section-title">Quick Start Guide</h2>
        <div className="grid-layout">
          <div className="course-item">
            <h3>Marketing Materials</h3>
            <div className="course-details">
              <p>Access our pre-made marketing materials including banners, email templates, and social media posts.</p>
              <Link to="/marketing-materials" className="cta-link">Get Materials</Link>
            </div>
          </div>
          <div className="course-item">
            <h3>Sales Funnel Setup</h3>
            <div className="course-details">
              <p>Learn how to set up your sales funnel for maximum conversions and earnings.</p>
              <Link to="/funnel-setup" className="cta-link">Setup Guide</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="cta-section">
        <h2 className="cta-title">Need Help Getting Started?</h2>
        <p className="cta-description">
          Our support team is here to help you succeed. Schedule a one-on-one onboarding call with our experts.
        </p>
        <Link to="/schedule-call" className="cta-button">
          Schedule Onboarding Call
        </Link>
      </section>
    </div>
  );
}