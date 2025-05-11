import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const MenGuide = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">MEN ONLY TO READ THIS GUIDE</h1>
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
                  <h3>SUBJECT TITLE: This Guide Isn’t for Everyone – But You Opened It Anyway</h3>
                  <p><strong>A Simple Yet Powerful Marketing Principle: Curiosity Converts</strong></p>
                  <p>Hi Reader,</p>
                  <p>If you’re a woman reading this, you probably paused when the subject said <strong>“MEN ONLY.”</strong> Why? Curiosity. That alone demonstrates a psychological trigger you can—and should—use in your marketing.</p>
                  <p>If you’re a guy, maybe you thought it was something edgy or controversial. Again, curiosity pulled you in. That’s the point.</p>
                  <p><strong>Curiosity is one of the strongest tools in marketing.</strong> Whether it’s your:</p>
                  <ul>
                    <li>Email subject lines</li>
                    <li>YouTube video titles</li>
                    <li>Sales page headlines</li>
                    <li>Article intros</li>
                    <li>Ad copy</li>
                  </ul>
                  <p>… sparking curiosity gets people to click, scroll, and pay attention.</p>
                  <p>Don’t give it all away upfront. Tease. Create tension. Let people feel like they’ll miss something valuable if they don’t open, click, or keep reading.</p>
                  <p>Try swapping something dull like:<br />
                  <em>“Don’t write big paragraphs in articles”</em><br />
                  With something like:<br />
                  <em>“Doing this one thing will kill your articles instantly”</em> or <em>“Are you making this fatal writing mistake?”</em></p>
                  <p>See the difference? Same message. More clicks. More engagement.</p>
                  <p>This lesson is short, but deadly effective. Use it across every touchpoint of your marketing.</p>
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
                <Link to="/training/guides/marketing-mistakes" className="related-guide-item">
                  <h4>Top 10 Internet Marketing Mistakes</h4>
                  <p>Save yourself the headache...</p>
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

export default MenGuide; 