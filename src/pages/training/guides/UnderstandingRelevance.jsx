import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const UnderstandingRelevance = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">UNDERSTANDING RELEVANCE</h1>
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
                  <h3>You can have the dopest product on the planet, but if it's not speaking to the right people, it's useless.</h3>
                  <p>This guide walks you through aligning your keywords, ads, and landing pages so that everything speaks directly to the people most likely to buy.</p>
                </div>

                <div className="guide-section">
                  <h3>Why Relevance Runs the Game</h3>
                  <p>Too many marketers focus on pushing a product without understanding who it's for. Relevance is the secret weapon that helps you match your message to the mindset of your audience—so your offer hits harder and converts better.</p>
                </div>

                <div className="guide-section">
                  <h3>The Flow of Relevance</h3>
                  <ul>
                    <li><strong>Start with strong keywords:</strong> Think long-tail and specific</li>
                    <li><strong>Group ads by theme:</strong> Keep messaging consistent</li>
                    <li><strong>Write ads that match intent:</strong> Speak their language</li>
                    <li><strong>Send to relevant pages:</strong> Fulfill the promise you made in your ad</li>
                  </ul>
                  <img 
                    src="/public/assets/images/images/flow-relevance.png" 
                    alt="Flow of relevance visualization" 
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
                </div>

                <div className="guide-section">
                  <h3>Stop Using Weak Keywords</h3>
                  <p>Broad terms like "make money" or "internet marketing" don't tell you what the user actually wants. Instead, aim for specific phrases like "best affiliate program for college students" or "clickbank course review." These convert better because they speak to real, ready-to-buy intent.</p>
                </div>

                <div className="guide-section">
                  <h3>How Keyword Relevance Impacts Results</h3>
                  <p>Running ads on vague terms wastes your money. You might get clicks, but you won't get sales. Dial in on what your ideal customer is *actually* typing. This will lower your ad costs and get you higher quality leads.</p>
                </div>

                <div className="guide-section">
                  <h3>Match Your Page to the Search</h3>
                  <p>If someone searches for "healthy homemade dog food," don't drop them on a generic pet blog. Send them to a page that teaches them how to make it, why it matters, and where to buy what they need. That's relevance—and it's what gets you paid.</p>
                </div>

                <div className="guide-section">
                  <h3>Final Takeaway</h3>
                  <p>This ain't about blasting ads anymore—it's about making every click count. When your keywords, ads, and landing pages all line up, the game changes. Your costs go down, your conversions go up, and your business becomes way more profitable.</p>
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
                <Link to="/training/guides/purchase-cycle" className="related-guide-item">
                  <h4>Customer Purchase Cycle</h4>
                  <p>Before you sell anything, you gotta understand your buyers...</p>
                </Link>
                <Link to="/training/guides/men-guide" className="related-guide-item">
                  <h4>Men Only To Read This Guide</h4>
                  <p>Exclusive game just for the fellas...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderstandingRelevance; 