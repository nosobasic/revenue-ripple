import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const MarketingMistakes = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">TOP 10 INTERNET MARKETING MISTAKES</h1>
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
                  <h3>Save yourself the headache.</h3>
                  <p>These are the biggest marketing mistakes most people make. Avoid these and you'll already be ahead of 90% of your competition.</p>
                </div>
                <div className="guide-section">
                  <h3>🚫 Top 10 Internet Marketing Mistakes (and How to Dodge Them)</h3>
                  <p>Even the best marketers trip up now and then—but that doesn’t mean you have to. Let’s break down the top 10 mistakes that drain ad budgets and hurt performance, so you can move smarter and convert faster.</p>

                  <h4>❌ Mistake #1: Leaving the Content Network On</h4>
                  <p>When launching a campaign, <strong>turn off the Content Network</strong>. It often brings in irrelevant traffic from low-quality pages. Unless you're running a broad awareness campaign, uncheck “Content Network” in your Google Ads campaign settings and stick with “Search Network.”</p>

                  <h4>❌ Mistake #2: Stuffing Too Many Keywords in One Ad Group</h4>
                  <p>More keywords = more exposure, right? <strong>Wrong.</strong> Keep each ad group focused with 5–20 highly relevant keywords. Going overboard dilutes ad relevance and hurts your Quality Score.</p>

                  <h4>❌ Mistake #3: Poor Keyword Grouping</h4>
                  <p>Your ad group name, keywords, and ad copy need to stay on theme. For example:<br/>
                    <strong>Ad Group:</strong> Internet Marketing<br/>
                    <strong>Keywords:</strong> internet marketing tips, internet marketing book, best online marketing guide</p>

                  <h4>❌ Mistake #4: Only Using Broad Match Keywords</h4>
                  <p>Use a mix of match types:<br/>
                    <strong>Broad:</strong> Internet Marketing<br/>
                    <strong>Phrase:</strong> “Internet Marketing”<br/>
                    <strong>Exact:</strong> [Internet Marketing]<br/>
                    Balance reach and control for better targeting.</p>

                  <h4>❌ Mistake #5: Running on a Tiny Budget</h4>
                  <p>$5/day? That won’t cut it. If your budget is too low, you might not even get shown. Start higher, monitor performance, and optimize once you’ve got data.</p>

                  <h4>❌ Mistake #6: Using Duplicate URLs</h4>
                  <p>Only one ad per keyword+URL combo will show. Avoid duplicate URLs competing for the same terms. Either outbid or create unique landing pages for better conversions.</p>

                  <h4>❌ Mistake #7: Bidding Too High Out the Gate</h4>
                  <p>Don’t throw money at the wall. Start bids conservatively and aim for $0.50–$1.00/click max unless you're certain it will convert. High bids don’t guarantee high ROI.</p>

                  <h4>❌ Mistake #8: Low Ad Position</h4>
                  <p>If you’re not on page one, you’re invisible. Shoot for position 3–8 to balance visibility and cost. A better Quality Score helps without raising your bid.</p>

                  <h4>❌ Mistake #9: Using Vague or Untargeted Keywords</h4>
                  <p>Generic terms like “make money” or “membership site” get clicks but not conversions. Use specific, intent-based phrases like “affiliate site for coaches” to attract buyers.</p>

                  <h4>❌ Mistake #10: Testing Too Many Ads at Once</h4>
                  <p>Split testing works best with just two ads. Let them compete, keep the winner, and introduce a new challenger. Run it like a tournament.</p>
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
                <Link to="/training/guides/men-guide" className="related-guide-item">
                  <h4>Men Only To Read This Guide</h4>
                  <p>Exclusive game just for the fellas...</p>
                </Link>
                <Link to="/training/guides/building-mailing-list" className="related-guide-item">
                  <h4>Building a Mailing List</h4>
                  <p>If you're not collecting emails, you're leaving money on the table...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingMistakes; 