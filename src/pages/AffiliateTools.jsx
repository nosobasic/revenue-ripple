import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliateTools = () => {
  const marketingMaterials = [
    {
      id: 1,
      title: 'Banner Ads',
      description: 'High-converting banner ads in various sizes',
      formats: ['PNG', 'JPG'],
      sizes: ['728x90', '300x250', '160x600']
    },
    {
      id: 2,
      title: 'Email Templates',
      description: 'Ready-to-use email templates for your campaigns',
      formats: ['HTML'],
      features: ['Responsive', 'Customizable']
    },
    {
      id: 3,
      title: 'Social Media Posts',
      description: 'Engaging social media content for all platforms',
      formats: ['PNG', 'JPG'],
      platforms: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram']
    },
    {
      id: 4,
      title: 'Landing Pages',
      description: 'Pre-built landing pages optimized for conversions',
      formats: ['HTML', 'CSS'],
      features: ['Mobile-friendly', 'A/B Tested']
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Affiliate & Reseller Tools</h1>
          <p className="dashboard-welcome">Marketing Materials & Resources</p>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* Marketing Materials Section */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">🎨</div>
              <h2>Marketing Materials</h2>
            </div>
            <div className="section-content">
              <div className="grid-layout">
                {marketingMaterials.map((material) => (
                  <div key={material.id} className="course-item">
                    <h3>{material.title}</h3>
                    <div className="course-details">
                      <p>{material.description}</p>
                      <div className="material-details">
                        <div className="detail-group">
                          <strong>Formats:</strong>
                          <span>{material.formats.join(', ')}</span>
                        </div>
                        {material.sizes && (
                          <div className="detail-group">
                            <strong>Sizes:</strong>
                            <span>{material.sizes.join(', ')}</span>
                          </div>
                        )}
                        {material.platforms && (
                          <div className="detail-group">
                            <strong>Platforms:</strong>
                            <span>{material.platforms.join(', ')}</span>
                          </div>
                        )}
                        {material.features && (
                          <div className="detail-group">
                            <strong>Features:</strong>
                            <span>{material.features.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <button className="cta-button">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Link Generator Section */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">🔗</div>
              <h2>Link Generator</h2>
            </div>
            <div className="section-content">
              <div className="course-item">
                <h3>Create Custom Tracking Links</h3>
                <div className="course-details">
                  <p>Generate unique tracking links for different marketing channels and campaigns.</p>
                  <div className="link-generator">
                    <input 
                      type="text" 
                      placeholder="Enter your destination URL"
                      className="form-input"
                    />
                    <input 
                      type="text" 
                      placeholder="Campaign name (optional)"
                      className="form-input"
                    />
                    <button className="cta-button">Generate Link</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="side-content">
          {/* Quick Stats */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">📊</div>
              <h2>Quick Stats</h2>
            </div>
            <div className="section-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Active Campaigns</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Total Clicks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Conversions</div>
                </div>
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

      {/* Pro Guide Section */}
      <div className="container">
        <section className="section pro-guide">
          <div className="section-header marketing">
            <div className="section-icon">📈</div>
            <h2>How to Use These Resources Like a Pro</h2>
          </div>
          <div className="section-content">
            <div className="guide-content">
              <p className="guide-intro">Here's how to get the most out of the tools and materials we've put together for you.</p>
              
              <div className="guide-steps">
                <div className="guide-step">
                  <h3>1. Start with the Basics</h3>
                  <p>Start by diving into "Unlock Your Marketing Potential" and then follow it up with "Unleash the Power of Traffic." These two guides are packed with actionable strategies that'll set you up to confidently dominate the digital marketing game.</p>
                </div>

                <div className="guide-step">
                  <h3>2. Set Up Your Funnel</h3>
                  <p>Next, set up your GetResponse account (or whichever autoresponder you prefer) and build a landing page designed to convert. Inside the Membership Mastery bundle, you'll find a proven lead magnet (covered in detail in the first book) that you can offer in exchange for email sign-ups. We'll also walk you through exactly what to include on your landing page so it hits the mark. Got your own lead magnet? Even better — feel free to run with that.</p>
                </div>

                <div className="guide-step">
                  <h3>3. Scale Your Marketing</h3>
                  <p>But don't stop there. You're not just creating a single funnel — you're building a marketing machine. Go ahead and set up a second landing page, this one dedicated to the Digital Marketing Domination (DMD) book. Why settle for one high-converting offer when you can launch two? You're here to scale, not stall.</p>
                </div>

                <div className="guide-step">
                  <h3>4. Access Advanced Tools</h3>
                  <p>From there, head over to the DMD affiliate sign-up page — think of it like getting access to the backstage pass of this whole operation. Once inside, you'll grab your unique affiliate link and unlock a full set of ready-to-use marketing tools. It's your official ticket into the big leagues.</p>
                </div>

                <div className="guide-step">
                  <h3>5. Automate Your Success</h3>
                  <p>Now that you've got your funnels live, it's time to open up your autoresponder and load in your indoctrination sequence — yes, that's a real term. You're laying the foundation for building trust and long-term engagement with your audience. After that, plug in the 26 bi-weekly lessons from the Digital Domination series. These emails are designed to educate, engage, and convert — on autopilot.</p>
                </div>

                <div className="guide-step">
                  <h3>6. Drive Traffic</h3>
                  <p>Finally, revisit "Unleash the Power of Traffic." This is where you'll put your foot on the gas and start driving quality traffic to your pages using the strategies laid out inside. Stick to the plan, and you'll see results.</p>
                </div>
              </div>

              <div className="guide-closing">
                <p>Appreciate you being part of the team — your energy and commitment are what keep this community strong. Keep pushing forward and let's build something amazing.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AffiliateTools; 