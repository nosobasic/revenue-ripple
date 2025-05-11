import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const KeywordTechnique = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">COMMON KEYWORD TECHNIQUE</h1>
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
                  <h3>The Common Keyword Technique (CKT)</h3>
                  <p>This simple method improves Quality Score, lowers ad costs, and boosts click-through rates by keeping your ad groups laser-focused around specific keyword phrases.</p>
                </div>

                <div className="guide-section">
                  <h3>Why This Works</h3>
                  <p>Search engines like Google reward relevance. The more tightly your keywords, ads, and landing pages align, the higher your Quality Score — which means:</p>
                  <ul>
                    <li>Cheaper cost-per-click (CPC)</li>
                    <li>Better ad positions</li>
                    <li>More impressions and conversions</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>How to Use It</h3>
                  <p>Your ad campaign is structured in two layers:</p>
                  <ul>
                    <li><strong>Campaign:</strong> High-level container for a product or service</li>
                    <li><strong>Ad Group:</strong> Group of ads/keywords centered around a shared phrase</li>
                  </ul>
                  <p>Choose 2–3 “core” words and use them to theme your keywords. That’s the CKT.</p>

                  <p><strong>Example:</strong></p>
                  <ul>
                    <li>Campaign Name: PRODUCT NAME</li>
                    <li>Ad Group Name: Make Money Home</li>
                  </ul>

                  <p>Keywords:</p>
                  <pre>
make money at home  
[make money at home]  
"make money at home"  
make money from home  
[make money from home]  
"make money from home"  
how to make money at home  
"how to make money at home"  
                  </pre>
                </div>

                <div className="guide-section">
                  <h3>Sample Ad</h3>
                  <pre>
Make Money From Home  
Want To Make Extra Money  
From Home? Find Out How.  
PRODUCT NAME  
                  </pre>
                  <p>Notice how the phrase “make money home” is echoed throughout the ad. Google highlights matching terms, improving CTR and relevance. Your ad group name should reflect the keywords inside it.</p>
                </div>

                <div className="guide-section">
                  <h3>Bonus Tip</h3>
                  <p>If your ad can’t naturally include all the keywords in your group, it’s too broad. Break it into smaller, tighter ad groups. Every keyword should fit cleanly into the ad copy for best results.</p>
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
                <Link to="/training/guides/analyzing-data" className="related-guide-item">
                  <h4>Analyzing Data</h4>
                  <p>Clicks mean nothing if you're not watching the numbers...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordTechnique; 