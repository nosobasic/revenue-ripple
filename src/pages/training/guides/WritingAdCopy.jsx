import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const WritingAdCopy = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">WRITING AD COPY</h1>
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
                  <h3>Your ads are your first impression.</h3>
                  <p>If your copy doesn’t get attention, no one’s clicking. Great ad copy isn’t just about words—it’s about persuasion, clarity, and standing out in a noisy feed.</p>
                </div>

                <div className="guide-section">
                  <h4>What is Ad Copy?</h4>
                  <p>Ad copy is the message in your ads that gets people to stop scrolling and take action. Whether you're using Google Ads, Meta, or TikTok, the right copy is your first handshake with potential customers. If it’s weak, your ad dollars are wasted.</p>
                </div>

                <div className="guide-section">
                  <h4>3 Core Elements of Effective Ad Copy</h4>
                  <ul>
                    <li><strong>Relevance:</strong> Your copy should mirror the search or scroll intent. Include keywords your ideal audience is actually using.</li>
                    <li><strong>Clarity:</strong> Be direct. Avoid fluff. Let them know what they’re getting and why it matters.</li>
                    <li><strong>Hook:</strong> Stop the scroll. Ask a powerful question, show a benefit, or spark curiosity.</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h4>Tips for Better CTR (Click-Through Rate)</h4>
                  <ul>
                    <li>Use action-driven language like "Get Access," "Try Free," or "Claim Your Offer."</li>
                    <li>Ask engaging questions like "Is This the #1 Side Hustle of 2025?"</li>
                    <li>Don’t copy what other ads are doing—stand out by sounding real, not robotic.</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h4>Examples</h4>
                  <p><strong>Ad Example A:</strong> “Work From Home & Earn $75/Survey – Sign Up Today”<br />
                  This uses a bold benefit, keyword relevance, and urgency.</p>

                  <p><strong>Ad Example B:</strong> “Unlimited Downloads – Just $0.99/mo”<br />
                  Highlights the offer clearly and shows the value upfront.</p>
                </div>

                <div className="guide-section">
                  <h4>Pro Tip</h4>
                  <p>Including emotional triggers like “scam” can spike curiosity and increase clicks—but use them wisely and ethically. For example: “Is [Product Name] a Scam or the Real Deal?”</p>
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
                <Link to="/training/guides/sales-copy" className="related-guide-item">
                  <h4>Writing Effective Sales Copy</h4>
                  <p>Sales copy is what turns visits into money...</p>
                </Link>
                <Link to="/training/guides/marketing-mistakes" className="related-guide-item">
                  <h4>Top 10 Internet Marketing Mistakes</h4>
                  <p>Save yourself the headache...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingAdCopy; 