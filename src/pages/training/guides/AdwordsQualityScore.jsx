import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const AdwordsQualityScore = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">ADWORDS QUALITY SCORE</h1>
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
                <style>
                  {`
                    .guide-image {
                      max-width: 100%;
                      height: auto;
                      display: block;
                      margin: 2rem auto;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      max-height: 500px;
                      object-fit: contain;
                    }
                  `}
                </style>
                <div className="guide-intro">
                  <h3>Understanding Google's Quality Score</h3>
                  <p>Google doesn't just reward the highest bidder. Instead, it prioritizes ads that are relevant and helpful to users. If your ad delivers value and matches what people are searching for, Google will reward you with better placement—without overpaying.</p>
                </div>

                <div className="guide-section">
                  <h3>What is Quality Score?</h3>
                  <p>Quality Score is Google's rating of how relevant and useful your ads, keywords, and landing pages are to someone seeing your ad. It's a major factor in determining your cost-per-click (CPC) and your ad's position in search results.</p>
                </div>

                <div className="guide-section">
                  <h3>Minimum Bid QS vs Ad Rank QS</h3>
                  <ul>
                    <li><strong>Minimum Bid QS:</strong> The minimum you need to bid for your ad to be eligible to show.</li>
                    <li><strong>Ad Rank QS:</strong> Determines where your ad ranks on the page compared to others.</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>Factors That Influence Minimum Bid Quality Score</h3>
                  <ul>
                    <li><strong>Landing page quality</strong> — how useful and relevant it is to the visitor.</li>
                    <li><strong>Keyword-to-page relevance</strong> — how well your keywords match your landing page.</li>
                    <li><strong>Keyword-to-ad relevance</strong> — how well your keywords align with your ad copy.</li>
                    <li><strong>Display URL CTR</strong> — past performance of your display URLs.</li>
                    <li><strong>Keyword CTR</strong> — historical click-through rates for each keyword.</li>
                    <li><strong>Account history</strong> — overall CTRs from your campaigns.</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>Factors That Influence Ad Rank Quality Score</h3>
                  <ul>
                    <li><strong>CTR of your keyword</strong></li>
                    <li><strong>CTR of your ad</strong></li>
                    <li><strong>CTR of your display URL</strong></li>
                    <li><strong>Search query relevance to your keyword</strong></li>
                    <li><strong>Search query relevance to your ad</strong></li>
                    <li><strong>Account-wide CTR history</strong></li>
                  </ul>
                  <p><strong>Note:</strong> Landing page quality is <em>not</em> used in calculating Ad Rank QS.</p>
                </div>

                <div className="guide-section">
                  <h3>Example Breakdown</h3>
                  <p>Let's say we have three ads:</p>
                  <ul>
                    <li><strong>Ad 1</strong>: $0.75 Max CPC × QS 5 = <strong>375</strong></li>
                    <li><strong>Ad 2</strong>: $0.50 Max CPC × QS 10 = <strong>500</strong> (Top Rank)</li>
                    <li><strong>Ad 3</strong>: $0.25 Max CPC × QS 2 = <strong>50</strong></li>
                  </ul>
                  <p>Even though Ad 2 has the lowest bid, it ranks first because its Quality Score is highest.</p>
                  <img
                    src="/assets/images/adrank.png"
                    alt="Ad Rank Breakdown Example"
                    className="guide-image"
                  />
                </div>

                <div className="guide-section">
                  <h3>Why Quality Score Matters</h3>
                  <p>Quality Score gives smaller advertisers the chance to beat big players by running better campaigns. You don't need the highest budget—you need the smartest strategy. Google rewards relevance and user experience above all.</p>
                </div>

                <div className="guide-section">
                  <h3>Best Practices</h3>
                  <ul>
                    <li>Group keywords into tightly themed ad groups</li>
                    <li>Write ad copy that includes keywords and addresses the searcher's intent</li>
                    <li>Build landing pages that match your ads and offer clear value</li>
                    <li>Use negative keywords to block irrelevant traffic</li>
                    <li>Track CTR and replace underperforming ads and keywords</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h3>Tracking and Improving Your Score</h3>
                  <p>You can view Quality Scores in your Google Ads dashboard. Watch for terms like "Great," "OK," or "Poor" next to your keywords. These give a high-level view, but real improvement comes from regularly reviewing CTRs, refining ads, and optimizing landing pages.</p>
                  <img
                    src="/assets/images/quality-score-summary-diagram.png"
                    alt="Quality Score Summary Diagram"
                    className="guide-image"
                  />
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
                <Link to="/training/guides/analyzing-data" className="related-guide-item">
                  <h4>Analyzing Data</h4>
                  <p>Clicks mean nothing if you're not watching the numbers...</p>
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

export default AdwordsQualityScore; 