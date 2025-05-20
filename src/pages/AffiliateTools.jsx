import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliateTools = () => {
  const handleDownload = (materialId, format) => {
    // This would typically be an API call to get the secure download URL
    const downloadUrl = `/api/downloads/${materialId}/${format}`;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', ''); // This will force download instead of navigation
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const marketingMaterials = [
    {
      id: 1,
      title: 'Membership Mastery',
      description: "As an affiliate/reseller, you're probably aware of the importance of building an email list for your business. That's why the Membership Mastery book can be an excellent lead magnet to help you achieve this goal. This comprehensive guide teaches readers how to create a membership site from scratch and monetize it, making it a valuable resource that your subscribers will appreciate. By offering this book as a freebie to your email list, you're not only providing them with valuable information, but you're also establishing a stronger connection with them. This can lead to increased loyalty and engagement, which are both critical for becoming a top Reseller.",
      formats: ['TXT', 'PDF'],
      sizes: ['728x90', '300x250', '160x600'],
      image: '/assets/images/images/Membership-Mastery.png',
      downloads: {
        TXT: '/assets/downloads/membership-mastery.txt',
        PDF: '/assets/downloads/membership-mastery.pdf'
      }
    },
    {
      id: 2,
      title: 'Unlock Your Marketing Potential',
      description: "An excellent guide to creating powerful marketing materials that will captivate and engage your target audience. From lead magnets that attract new subscribers to landing pages that convert visitors into customers, this book is packed with actionable tips and techniques that will help you unleash your marketing potential. You'll learn how to craft compelling headlines and write copy that resonates with your audience. Whether you're a seasoned marketer or just starting out, 'Unlock Your Marketing Potential' is an invaluable resource that will help you take your reselling to the next level.",
      formats: ['HTML', 'CSS'],
      features: ['Mobile-friendly', 'A/B Tested'],
      image: '/assets/images/images/Marketing-Potential-book.png',
      downloads: {
        HTML: '/assets/downloads/marketing-potential.html',
        CSS: '/assets/downloads/marketing-potential.css'
      }
    },
    {
      id: 3,
      title: 'Unleash the Power of Traffic',
      description: "An excellent guide to creating powerful marketing materials that will captivate and engage your target audience. From lead magnets that attract new subscribers to landing pages that convert visitors into customers, this book is packed with actionable tips and techniques that will help you unleash your marketing potential. You'll learn how to craft compelling headlines and write copy that resonates with your audience. Whether you're a seasoned marketer or just starting out, 'Unlock Your Marketing Potential' is an invaluable resource that will help you take your reselling to the next level.",
      formats: ['PNG', 'JPG'],
      platforms: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'],
      image: '/assets/images/images/Power-of-traffic-book.png',
      downloads: {
        PNG: '/assets/downloads/power-of-traffic.zip',
        JPG: '/assets/downloads/power-of-traffic-jpg.zip'
      }
    },
    {
      id: 4,
      title: 'Digital Marketing Domination Email Series',
      description: 'Learn how to dominate the digital marketing game.',
      formats: ['TXT', 'PDF'],
      features: ['Responsive', 'Customizable'],
      image: '/assets/images/images/DMD-book.png',
      downloads: {
        TXT: '/assets/downloads/digital-marketing.txt',
        PDF: '/assets/downloads/digital-marketing.pdf'
      }
    },
    {
      id: 5,
      title: 'Social Media Posts',
      description: 'Engaging social media content for all platforms',
      formats: ['PNG', 'JPG'],
      platforms: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'],
      image: '/assets/images/images/social-media-posts.png',
      downloads: {
        PNG: '/assets/downloads/social-media-posts.zip',
        JPG: '/assets/downloads/social-media-posts-jpg.zip'
      }
    },
    {
      id: 6,
      title: 'Landing Pages',
      description: 'Pre-built landing pages optimized for conversions',
      formats: ['HTML', 'CSS'],
      features: ['Mobile-friendly', 'A/B Tested'],
      image: '/assets/images/images/landing-pages.png',
      downloads: {
        HTML: '/assets/downloads/landing-pages.zip',
        CSS: '/assets/downloads/landing-pages-css.zip'
      }
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Affiliate & Reseller Tools</h1>
          <p className="dashboard-welcome">Lets get started. Download the following Revenue Ripple tools and resources below.</p>
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
                        <img src={material.image} alt={material.title} />
                        <div className="detail-group">
                          <strong>Formats:</strong>
                          <div className="format-buttons">
                            {material.formats.map((format) => (
                              <button
                                key={format}
                                className="format-button"
                                onClick={() => handleDownload(material.id, format)}
                              >
                                {format}
                              </button>
                            ))}
                          </div>
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
                      <div className="button-group">
                        <button className="cta-button">Download All</button>
                        {material.id === 1 && (
                          <button className="cta-button" style={{ marginLeft: '1rem' }}>Landing Page Info</button>
                        )}
                      </div>
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

      {/* Digital Marketing Domination Affiliate Section */}
      <div className="container">
        <section className="section affiliate-opportunity">
          <div className="section-header marketing">
            <div className="section-icon">💎</div>
            <h2>EXCLUSIVE OPPORTUNITY</h2>
          </div>
          <div className="section-content">
            <div className="opportunity-content">
              <p className="opportunity-intro">
                Underneath the captivating offering of our 12-month digital marketing email course, we have an exciting opportunity for our affiliate partners.
              </p>
              
              <p className="opportunity-description">
                We understand that not all your subscribers will be ready to jump into the full membership immediately. That's why we've developed a unique affiliate link specifically for our "Digital Marketing Domination" book. Priced at an easy $7 (RRP $297), it's a fantastic opportunity for subscribers who want to dip their toes into the world of digital marketing before committing to the full course.
              </p>

              <p className="opportunity-benefit">
                As an affiliate, you will earn a commission for every $7 book purchase made through your unique link. It's a win-win situation: you continue to earn, and your referrals get the chance to learn from our comprehensive guide to digital marketing at their own pace.
              </p>

              <div className="opportunity-cta">
                <p className="cta-text">
                  So why wait? Grab your unique affiliate link for the "Digital Marketing Domination" book and start increasing your earning potential today! (simply put your affiliate link into the emails where indicated)
                </p>
                <button className="cta-button">Get Your Affiliate Link</button>
              </div>
            </div>
          </div>
        </section>
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

      {/* Reseller PRO Upgrade Section */}
      <div className="container">
        <section className="section reseller-pro">
          <div className="section-header reseller">
            <div className="section-icon">🚀</div>
            <h2>Supercharge Your Earnings with This Game-Changing Upgrade!</h2>
          </div>
          <div className="section-content">
            <div className="reseller-pro-content">
              <p className="reseller-intro">
                If you're already reselling this membership site, you're in a strong position — but Reseller PRO is how you really level up. This isn't just an upgrade; it's a strategic move for serious earners. And if you're still just an affiliate? <Link to="/reseller-landing" className="inline-link">Click here to become a reseller</Link> first, then come back and take it up a notch.
              </p>

              <div className="reseller-benefits">
                <p className="benefit-highlight">
                  Reseller PRO puts you in the driver’s seat with 100% commissions on every membership *and* reseller program sale. No splits, no caps — just full control of your earning potential.
                </p>

                <p className="benefit-explanation">
                  You might be asking, “Is the extra $97/month worth it?” Look at it like this — Reseller PRO turns you from a participant to a true partner. It’s like stepping into the owner’s suite of your own marketing business, backed by tools, assets, and a system built to scale. 
                </p>

                <p className="benefit-cta">
                  So if you're ready to stop playing small and start stacking real commission checks, this is your next move. Upgrade now and make your traffic work smarter, not harder.
                </p>
              </div>

              <div className="reseller-pro-cta">
                <h3>Upgrade to Reseller PRO and take full control of your revenue.</h3>
                <div className="cta-box">
                  <h4>Make the Switch Today</h4>
                  <p className="cta-highlight">Earn 100% Commissions Promoting the Membership and Reseller Program</p>
                  <Link to="/pro-reseller-upsell" className="cta-button pro-button">Upgrade to Reseller PRO</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AffiliateTools; 