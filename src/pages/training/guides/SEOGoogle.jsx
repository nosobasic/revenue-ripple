import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const SEOGoogle = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">SEO - SLAP BACK @ GOOGLE</h1>
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
                  <h3>SEO: SLAPPING BACK AT GOOGLE — THE SMART WAY</h3>
                  <p>Search Engine Optimization (SEO) is how your site shows up <em>organically</em> in Google, Yahoo, or Bing—without paying for ads. Top rankings = more visibility = free traffic. But with everyone chasing that same free traffic, the competition is fierce.</p>
                  <img 
                    src="/public/assets/images/images/seo-slap.png" 
                    alt="SEO strategy infographic" 
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
                  <p>If you're launching your first site, SEO can feel like trying to fight giants. But here's the truth: you don't need to outrank Fortune 500 companies across the board. You just need <strong>targeted wins</strong>—ranking for specific phrases that drive your ideal customers to your site.</p>
                  <p>This guide will show you how to stack the SEO odds in your favor so you get relevant traffic that converts.</p>
                </div>

                <h4>How to Get Your Site Indexed and Ranked</h4>
                <p>Getting indexed just means getting noticed and listed by search engines. But it's not automatic or guaranteed. Google, Yahoo, and Bing each use different ranking algorithms, so your job is to make your site as friendly to all of them as possible. That starts with content—and lots of it.</p>

                <h4>SEO Checklist: What Google Actually Looks For</h4>
                <ul>
                  <li><strong>✅ Content:</strong> No fluff. No filler. Use 300–500 words per page of useful, keyword-relevant material.</li>
                  <li><strong>✅ Keyword Density:</strong> Sprinkle your main keyword 2–5% across your page to make intent clear.</li>
                  <li><strong>✅ Title Tags:</strong> Your title is prime real estate. Make sure it's catchy and includes your main keyword.</li>
                  <li><strong>✅ Multi-Page Structure:</strong> Single-page sites are weak. Create multiple relevant pages and link them together.</li>
                  <li><strong>✅ Keyword Focus:</strong> Avoid broad terms like "shoes." Go for phrases like "custom red running shoes for flat feet."</li>
                  <li><strong>✅ Incoming Links:</strong> Earn backlinks from forums, blogs, and directories. Avoid link exchanges or farms.</li>
                </ul>

                <h4>SEO & Google Ads: Why It Matters</h4>
                <p>Want to run ads <em>and</em> rank high organically? Your landing page must match your ad's focus. Google rewards alignment. If your ad says "Buy Blue Running Shoes" but your page talks about socks—you'll pay more per click and get lower rankings.</p>

                <h4>Final Takeaway</h4>
                <p>The modern SEO game is all about <strong>relevance</strong>. Build real pages. Create real content. Use real keywords. The more aligned your content is to the user's search, the more Google will favor you—and the less you'll spend on ads.</p>
                <p><em>Apply these SEO tactics to every page, especially your landing pages for paid ads. You'll get better rankings, lower ad costs, and way more traffic.</em></p>
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
                <Link to="/training/guides/backlinks-social" className="related-guide-item">
                  <h4>Relevant Backlinks - Social Bookmarking</h4>
                  <p>Want backlinks and more exposure? Drop your pages in the right directories...</p>
                </Link>
                <Link to="/training/guides/backlinks-article" className="related-guide-item">
                  <h4>Relevant Backlinks - Article Submission</h4>
                  <p>Backlinks are the secret sauce for getting to page one...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOGoogle; 