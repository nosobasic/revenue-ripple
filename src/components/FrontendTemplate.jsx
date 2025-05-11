import React from 'react';

const FrontendTemplate = () => {
  return (
    <div className="frontend-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Revenue Ripple</h1>
        <p className="hero-subtitle">
          Transform your digital marketing skills and start earning passive income with our comprehensive reseller program.
        </p>
      </section>

      {/* Features Section */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="feature-title">Lightning-Fast Setup</h3>
          <p className="feature-description">
            Get started in minutes with our easy-to-use platform and comprehensive training materials.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="feature-title">High Commission Rates</h3>
          <p className="feature-description">
            Earn up to 50% commission on every sale with our generous affiliate program.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="feature-title">Secure Platform</h3>
          <p className="feature-description">
            Your data and transactions are protected with enterprise-grade security measures.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">50%</div>
            <div className="stat-label">Commission Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Active Resellers</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Earning?</h2>
        <p className="cta-description">
          Join our reseller program today and start building your passive income stream.
        </p>
        <a href="/register" className="cta-button">
          Get Started Now
        </a>
      </section>
    </div>
  );
};

export default FrontendTemplate; 