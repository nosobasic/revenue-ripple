import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const AnalyzingData = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">ANALYZING DATA</h1>
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
                  <h3>Clicks mean nothing if you're not watching the numbers.</h3>
                  <p>This section shows you how to spot what's working, cut what's not, and scale up like a pro.</p>
                </div>

                <div className="guide-section">
                  <h3>Evaluate & Test Your Campaign</h3>
                  <p>After launching your campaign and seeing traffic, it's time to optimize. The smartest marketers don't just guess — they test. This phase helps you evaluate what's converting and what's just wasting budget.</p>
                  <p>Most results come from a small handful of keywords. If 20% of your ads are doing 80% of the work, it's time to clean house. Look at your CTRs, conversions, landing pages, and sales copy. Identify the weak links.</p>
                </div>

                <div className="guide-section">
                  <h3>Which Keywords Are Making You Money?</h3>
                  <p><strong>Test:</strong> Use Google's Sales Conversion Tracking to log conversions by keyword.</p>
                  <p>Many affiliate programs let you append Google tracking code to URLs. That way, every sale shows up under the keyword that triggered it. You can even request merchants add your code to their confirmation pages.</p>
                  <p>Once enabled, this data makes it obvious which 10–20% of your keywords are driving the bulk of your sales. Drop the rest or improve your copy to turn them around.</p>
                </div>

                <div className="guide-section">
                  <h3>Split Test to Improve Your Ads</h3>
                  <p><strong>Test:</strong> A/B split test your ad copy inside Google Ads.</p>
                  <p>Create two versions of your ad with different messaging, same destination URL. Turn OFF ad optimization so they run evenly. Once a winner is clear (better CTR), replace the loser and test again.</p>
                  <p><strong>Tip:</strong> Try testing headlines with your exact keyword, strong calls-to-action, or curiosity angles like questions. Even "scam" phrasing works in some cases.</p>
                </div>

                <div className="guide-section">
                  <h3>Track Traffic Source Quality with Opt-In Forms</h3>
                  <p><strong>Test:</strong> Split test traffic from different search engines.</p>
                  <p>Set up multiple landing pages — one for Google, Yahoo, MSN, etc. Each page gets its own opt-in form tagged with a unique ID (use tools like Aweber). This lets you measure which traffic source delivers the most leads.</p>
                  <img
                    src="/assets/images/analyzing-data.png"
                    alt="Analyzing Data"
                    className="guide-image"
                  />
                  <p>Example:</p>
                  <ul>
                    <li><strong>Google:</strong> yourpage.com/googletraffic.html</li>
                    <li><strong>Yahoo:</strong> yourpage.com/yahootraffic.html</li>
                    <li><strong>MSN:</strong> yourpage.com/msntraffic.html</li>
                  </ul>
                  <p>Then calculate: <strong>Traffic Cost ÷ Opt-Ins = Cost Per Lead (CPL)</strong>. Lower CPL means higher quality traffic.</p>
                </div>

                <div className="guide-section">
                  <h3>Conclusion</h3>
                  <p>These aren't just ideas — they're battle-tested techniques. By testing ad performance, opt-in forms, and keyword results, you'll gain the clarity to build leaner, more profitable campaigns. Testing saves money and multiplies results. Start simple, iterate often, and watch your margins grow.</p>
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

export default AnalyzingData; 