import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const TargetAudiences = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">TARGET AUDIENCES</h1>
          <div className="dashboard-welcome">Marketing Training & Guide</div>
        </div>
      </header>
      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2>Target Audience Breakdown</h2>
            </div>
            <div className="section-content">
              <div className="guide-content">
                <div className="guide-intro">
                  <h3>🎯 Target Audiences</h3>
                  <p>If you're trying to make money online, your target audience is almost anyone—because almost everyone wants more income. From students to retirees, this opens the door to billions of potential customers.</p>
                  <img 
                    src="/assets/images/images/target.png" 
                    alt="Target audience visualization" 
                    className="guide-image"
                    style={{
                      width: '100%',
                      maxWidth: '800px',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      margin: '2rem auto',
                      display: 'block'
                    }}
                  />
                  <p>That said, broad targeting won't cut it. You need <strong>specific</strong>, profitable audiences. Below are high-performing niches you can dig into:</p>
                  <ul>
                    <li>Making Money</li>
                    <li>Work From Home</li>
                    <li>Entrepreneurs</li>
                    <li>Google Ads</li>
                    <li>Clickbank</li>
                    <li>Affiliate Marketing</li>
                    <li>Email Marketing</li>
                    <li>Data Entry</li>
                    <li>Home Business</li>
                    <li>Self-Employment</li>
                    <li>SEO & PPC Marketing</li>
                    <li>Become a Millionaire</li>
                  </ul>
                  <p><strong>Sub-Niches to consider:</strong></p>
                  <ul>
                    <li>College Students</li>
                    <li>Veterans</li>
                    <li>Unemployed or Laid Off</li>
                    <li>Baby Boomers</li>
                    <li>People with Debt or Low Salary</li>
                    <li>Freelancers & Website Builders</li>
                  </ul>
                  <p>Align your campaigns with the needs and pain points of these groups to convert them into customers or leads.</p>
                </div>
                <div className="guide-section">
                  <h3>💡 Example Niche: Clickbank</h3>
                  <p>Most people know of Clickbank, but few understand how to profit from it. Many are misled by outdated tactics and black hat advice.</p>
                  <p>Stand out by explaining:</p>
                  <ul>
                    <li>How Clickbank works (honestly)</li>
                    <li>The best products to promote</li>
                    <li>The role of community and real support</li>
                  </ul>
                  <p>Use keyword data to guide campaigns. High-traffic search terms include "Clickbank affiliate," "make money with Clickbank," and "Clickbank tutorial." Create articles or videos targeting those exact terms.</p>
                </div>
                <div className="guide-section">
                  <h3>🧠 Digging Deeper into Niche Understanding</h3>
                  <p>Each audience thinks, speaks, and searches differently. Your job is to speak their language, address their worries, and guide them to your offer like a friend would.</p>
                  <p>Study online forums, surveys, keyword data, and feedback to know what they want—and deliver it clearly.</p>
                </div>
                <div className="guide-section">
                  <h3>🔍 Spotlight: Minimum Wage Workers</h3>
                  <p>This audience is overworked and underpaid. They're looking for ways to level up—cheaply and quickly. Common search terms include "how to make money from home" and "side hustle ideas."</p>
                  <p>Offer stories, tutorials, and tools tailored to people who may not have money—but have hunger to learn.</p>
                </div>
                <div className="guide-section">
                  <h3>🏠 Spotlight: Real Estate</h3>
                  <p>Realtors often have money but lack online strategy. They pay big for leads and just need direction on how to convert more of their traffic.</p>
                  <p>Use guides, landing pages, and ads to help them build digital presence. You'll win their trust and their wallets.</p>
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
                <Link to="/training/guides/market-research" className="related-guide-item">
                  <h4>Market Research</h4>
                  <p>Before you run a campaign, find your pocket of profit...</p>
                </Link>
                <Link to="/training/guides/purchase-cycle" className="related-guide-item">
                  <h4>Customer Purchase Cycle</h4>
                  <p>Before you sell anything, you gotta understand your buyers...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetAudiences; 