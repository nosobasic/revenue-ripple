import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const PurchaseCycle = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">CUSTOMER PURCHASE CYCLE</h1>
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
                  <h3>Before you sell anything, you gotta understand your buyers.</h3>
                  <p>This guide helps you dial in on what they want and why they're even shopping online in the first place.</p>
                </div>

                <div className="guide-section">
                  <h3>The 3 Phases of a Purchase</h3>
                  <ul>
                    <li><strong>Research Phase</strong>: Buyers want to learn before they commit. They watch videos, read reviews, and compare products.</li>
                    <li><strong>Decision Phase</strong>: Now they’re weighing their options. Which brand? Which price? This is your chance to stand out with clear value.</li>
                    <li><strong>Purchasing Phase</strong>: They’re ready. Keywords like “buy [product name]” mean they’re serious — and your ad needs to show up here.</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>Most Advertisers Get This Wrong</h3>
                  <p>Broad keywords like "golf clubs" seem targeted — but they’re not. People using those terms are still browsing. Go deeper. Look for:</p>
                  <ul>
                    <li>“TaylorMade R5 driver review”</li>
                    <li>“Best 56 degree wedge for beginners”</li>
                  </ul>
                  <p>These buyers know what they want. Show up with a specific offer and watch your conversions rise.</p>
                </div>

                <div className="guide-section">
                  <h3>Leverage Big Brand Awareness</h3>
                  <p>TV, radio, billboards — they prime customers. Your job is to be there when they go online to buy.</p>
                  <ul>
                    <li>Use product and brand-related keywords</li>
                    <li>Target searchers who’ve already seen the ads</li>
                  </ul>
                  <p>They already trust the brand. You just have to seal the deal.</p>
                </div>

                <div className="guide-section">
                  <h3>Study Your Own Habits</h3>
                  <p>Think back to your last online purchase. Where did you start? What sealed the deal? Use that experience to reverse-engineer your customer's path.</p>
                </div>

                <div className="guide-section">
                  <h3>Conclusion</h3>
                  <p>Smart marketers don’t just promote — they guide. They meet buyers at every step of the journey and help them move forward. Know the cycle. Build content for each stage. And always show up when it matters most.</p>
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
                <Link to="/training/guides/target-audiences" className="related-guide-item">
                  <h4>Target Audiences</h4>
                  <p>You can't sell to everybody...</p>
                </Link>
                <Link to="/training/guides/understanding-relevance" className="related-guide-item">
                  <h4>Understanding Relevance</h4>
                  <p>You can have the dopest product on the planet...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCycle; 