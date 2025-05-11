import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TripwireSuccess = () => {
  const handleMembershipUpsell = async () => {
    const res = await fetch("http://localhost:3001/create-membership-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer_username: localStorage.getItem("ref_id") || "none" })
    });
    const data = await res.json();
    window.location.href = data.url;
  };

  useEffect(() => {
    // Add any post-purchase tracking or analytics here
  }, []);

  return (
    <div className="frontend-container">
      {/* Success Message */}
      <section className="hero-section">
        <h1 className="hero-title">Thank You for Your Purchase! 🎉</h1>
        <p className="hero-subtitle">
          You've taken the first step towards building your digital marketing empire. Your access to the Digital Marketing Domination Book is being processed.
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
          <h3 className="feature-title">Check Your Email</h3>
          <p className="feature-description">
            We've sent your book access details to your email. Please check your inbox (and spam folder) for the download link.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="feature-title">Start Learning</h3>
          <p className="feature-description">
            Dive into the book and start implementing the strategies. The sooner you start, the faster you'll see results.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="feature-title">Join Our Community</h3>
          <p className="feature-description">
            Connect with other digital marketers in our exclusive community. Share experiences and learn from others.
          </p>
        </div>
      </section>

      {/* Upsell Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Take Your Business to the Next Level?</h2>
        <p className="cta-description">
          Upgrade to our Pro Reseller Program and unlock even more powerful tools and higher commissions.
        </p>
        <button className="cta-button" onClick={handleMembershipUpsell}>
          Upgrade to Full Membership
        </button>
      </section>

      {/* Support Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Satisfaction Guarantee</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">30</div>
            <div className="stat-label">Day Money-Back</div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="content-section">
        <h2 className="section-title">Additional Resources</h2>
        <div className="grid-layout">
          <div className="course-item">
            <h3>Getting Started Guide</h3>
            <div className="course-details">
              <p>Learn how to make the most of your new purchase with our comprehensive guide.</p>
              <Link to="/guides/getting-started" className="cta-link">Read Guide</Link>
            </div>
          </div>
          <div className="course-item">
            <h3>Video Tutorials</h3>
            <div className="course-details">
              <p>Watch step-by-step video tutorials to help you implement the strategies.</p>
              <Link to="/tutorials" className="cta-link">Watch Tutorials</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TripwireSuccess;