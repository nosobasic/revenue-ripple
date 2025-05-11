import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const PPCStart = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">PPC GETTING STARTED</h1>
          <div className="dashboard-welcome">Marketing Training & Guide</div>
        </div>
      </header>
      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2>Guide Content</h2>
            </div>
            <div className="section-content">
              <div className="guide-content">
                <div className="guide-intro">
                  <h3>PPC Getting Started</h3>
                  <p><strong>Pay-Per-Click (PPC)</strong> advertising is one of the fastest and most reliable ways to drive traffic and generate income online. Once set up right, PPC campaigns can send highly targeted visitors to your site 24/7—on your terms.</p>
                  <p>The goal is simple: spend less on ads than you make in profit. If you're earning $30 per sale and paying $0.50 per click, you break even after 60 clicks. If you're converting better than that, you're winning. If not—you’re losing money. This guide helps you win.</p>
                </div>
                <div className="guide-section">
                  <h4>1. Setting Up Your PPC Account</h4>
                  <p>Start by creating a Google Ads account. You don’t need a finished product or website—just set up a “practice” campaign. Use a placeholder URL and keep your bid low to get familiar with the platform.</p>
                  <p>Pro tip: Google dominates the ad space, but Bing and Microsoft Ads can offer additional high-converting traffic too.</p>
                </div>
                <div className="guide-section">
                  <h4>2. Researching Markets & Keywords</h4>
                  <p>Success in PPC depends on relevance—between your ad, your landing page, and your audience. It’s not about picking the “best” niche. It’s about understanding what your target customer cares about and how to speak their language.</p>
                </div>
                <div className="guide-section">
                  <h4>3. Keyword Strategy</h4>
                  <p>Pick keywords that match both your product and landing page. Group them into 5–15 tight clusters. For example, a group for “make money” might include:</p>
                  <ul>
                    <li>make money online</li>
                    <li>make money from home</li>
                    <li>make money with a blog</li>
                  </ul>
                  <p>Use bolded common terms in your ad headlines for higher click-through rates. Test, optimize, repeat.</p>
                </div>
                <div className="guide-section">
                  <h4>4. Writing & Testing Ads</h4>
                  <p>Great ad copy grabs attention, builds curiosity, and invites clicks. Run A/B tests with different CTAs, formatting, and offers. Keep what works, cut what doesn’t.</p>
                </div>
                <div className="guide-section">
                  <h4>5. Landing Pages & Analytics</h4>
                  <p>Your landing page should match the promise of your ad. Track visitor behavior using tools like Google Analytics to improve time on site and conversion rate.</p>
                </div>
                <div className="guide-section">
                  <h4>6. Quality Score Matters</h4>
                  <p>Google rewards relevance. A high Quality Score means lower ad costs and better placements. Focus on:</p>
                  <ul>
                    <li>Keyword-to-ad relevance</li>
                    <li>Ad-to-landing page alignment</li>
                    <li>Click-through rates</li>
                  </ul>
                </div>
                <div className="guide-section">
                  <h4>Final Thoughts</h4>
                  <p>Once you build a campaign that converts, it can run profitably for months or even years. Stick to the fundamentals—tight keywords, relevant content, smart testing—and scale what works.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <h2>Related Guides</h2>
            </div>
            <div className="section-content">
              <div className="related-guides">
                <Link to="/training/guides/adwords-quality" className="related-guide-item">
                  <h4>Adwords Quality Score</h4>
                  <p>Google don't just reward the biggest spender...</p>
                </Link>
                <Link to="/training/guides/keyword-technique" className="related-guide-item">
                  <h4>Common Keyword Technique</h4>
                  <p>This trick makes your ad campaigns way tighter...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPCStart; 