import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const BuildingMailingList = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">BUILDING A MAILING LIST</h1>
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
                  <h3>If you're not collecting emails, you're leaving money on the table.</h3>
                  <p>Learn how to build a list that keeps paying you every time you hit send.</p>
                </div>

                <div className="guide-section">
                  <h3>Why Mailing Lists Still Dominate</h3>
                  <p>Ever exchanged your email for a freebie, newsletter, or exclusive offer? That's the power of a mailing list. It's how top marketers build long-term customer relationships and recurring revenue.</p>
                  <p>When someone opts in, they're giving you permission to stay in touch — to promote offers, share insights, and turn one-time visitors into loyal customers. Unlike spam (which is illegal), opt-in marketing is ethical, effective, and smart.</p>
                </div>

                <div className="guide-section">
                  <h3>Autoresponders: Your Secret Weapon</h3>
                  <p>Think of an autoresponder as your personal assistant for email marketing. It handles:</p>
                  <ul>
                    <li>Collecting emails</li>
                    <li>Sending pre-written follow-ups</li>
                    <li>Managing analytics and reports</li>
                  </ul>
                  <p>We recommend <a href="https://www.aweber.com" target="_blank" rel="noopener noreferrer">Aweber</a> — it's reliable, user-friendly, and designed for performance. Set it up once, add a form to your site, and it handles the rest. Schedule emails weekly, create drip sequences, or blast promotions — all from your dashboard.</p>
                </div>

                <div className="guide-section">
                  <h3>Adding a Form to Your Website</h3>
                  <p>You've got two solid options:</p>
                  <ol>
                    <li>Add a form or pop-up to an existing page</li>
                    <li>Build a dedicated squeeze page focused only on collecting emails</li>
                  </ol>
                  <p>With tools like Aweber, you get HTML or JavaScript code to embed — just copy and paste it into your site. The form appears instantly and starts collecting leads.</p>
                  <p><strong>Tip:</strong> Adding a form to an existing page is free and can drastically improve conversions without extra ad spend.</p>
                </div>

                <div className="guide-section">
                  <h3>Squeeze Pages That Convert</h3>
                  <p>A squeeze page is a minimalist landing page with one goal: collect emails.</p>
                  <p>They work because there are no distractions — just one call to action like: <br />
                  <em>"We've got something great to share — drop your email to get instant access."</em></p>
                  <p>Conversion rates are usually higher on squeeze pages because they're hyper-focused. Use this to grow your list faster.</p>
                </div>

                <div className="guide-section">
                  <h3>What to Say in Your Emails</h3>
                  <p>Your job isn't just to send emails — it's to deliver <strong>value</strong>.</p>
                  <p>Don't bombard people with nonstop sales pitches. Instead:</p>
                  <ul>
                    <li>Share helpful info that ties into your product</li>
                    <li>Educate them on your niche</li>
                    <li>Blend promotion with problem-solving</li>
                  </ul>
                  <p><strong>Example:</strong>  
                  If you're promoting antivirus software, your email might:
                    <ul>
                      <li>Explain new types of viruses</li>
                      <li>Show how users can stay protected</li>
                      <li>Then introduce your product as the solution</li>
                    </ul>
                  </p>
                  <p>This builds <strong>trust</strong> — and trust builds sales.</p>
                </div>

                <div className="guide-section">
                  <h3>Why This Works So Well</h3>
                  <p>Only a fraction of site visitors buy right away. A mailing list lets you follow up repeatedly — and that's where the money is.</p>
                  <p>Even with a list of 10,000 people:</p>
                  <ul>
                    <li>Just 0.5% buying a $45 product = $2,250+</li>
                    <li>One good promo email = instant income</li>
                  </ul>
                  <p>Big marketers often make $70K+ from one email blast. Why? Because email is <strong>personal</strong>, <strong>targeted</strong>, and <strong>repeatable</strong>.</p>
                </div>

                <div className="guide-section">
                  <h3>Tips for Long-Term List Success</h3>
                  <ul>
                    <li>Send a mix of helpful content and soft promotions</li>
                    <li>Don't overdo the sales — keep your list engaged</li>
                    <li>Promote complementary offers (ex: cameras → tripods, storage, editing tools)</li>
                    <li>Build real relationships — not just leads</li>
                  </ul>
                  <p>You don't need a list of 100K to win. Start with 100. Then 1,000. Then scale.</p>
                </div>

                <div className="guide-section">
                  <h3>Key Takeaways</h3>
                  <ul>
                    <li>Use autoresponders like Aweber to automate everything</li>
                    <li>Add forms to your site or create squeeze pages for higher opt-ins</li>
                    <li>Send valuable, readable content that builds trust</li>
                    <li>Promote smartly and consistently</li>
                    <li>A small but active list = BIG revenue</li>
                  </ul>
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
                <Link to="/training/guides/landing-components" className="related-guide-item">
                  <h4>Components of a Landing Page</h4>
                  <p>Landing pages are your digital pitchman...</p>
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

export default BuildingMailingList; 