import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const SalesCopy = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">WRITING EFFECTIVE SALES COPY</h1>
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
                  <h3>Writing Sales Copy That Converts</h3>
                  <p>Sales copy is what drives action. It’s not about sounding clever—it’s about being clear, relevant, and convincing. If your words don’t move the reader to act, you’re leaving money on the table.</p>
                  <p>The best sales copy isn’t flashy. It’s focused. It talks directly to the person reading it, taps into what they want, and shows how your offer gets them there. Once you master this, you’ll be able to sell just about anything online.</p>

                  <h4>Benefits of Effective Sales Copy</h4>
                  <ul>
                    <li>Boosts conversions and revenue</li>
                    <li>Connects with customers emotionally</li>
                    <li>Increases upsells and lifetime value</li>
                    <li>Builds trust and credibility</li>
                    <li>Turns a one-time sale into a long-term buyer</li>
                  </ul>

                  <h4>Top Techniques to Include</h4>
                  <ul>
                    <li>Start with a strong headline—capture attention fast</li>
                    <li>Tell a story or share a personal experience</li>
                    <li>Use lists to highlight key points and benefits</li>
                    <li>Break down prices and show savings</li>
                    <li>Include social proof (like testimonials)</li>
                    <li>Make the action clear with a strong CTA (e.g., “Sign up today”)</li>
                  </ul>

                  <p>Sales copy isn’t just about what you say—it’s how it’s presented. Short paragraphs. Clear formatting. Direct language. And always speak to the customer’s goals, not your features.</p>
                </div>
                {/* Add more sections as needed */}
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
                <Link to="/training/guides/writing-ad-copy" className="related-guide-item">
                  <h4>Writing Ad Copy</h4>
                  <p>Your ads are your first impression...</p>
                </Link>
                <Link to="/training/guides/landing-optimization" className="related-guide-item">
                  <h4>Landing Page Optimization</h4>
                  <p>If people land on your page and bounce, you're wasting money...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesCopy; 