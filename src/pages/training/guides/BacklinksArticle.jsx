import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const BacklinksArticle = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">RELEVANT BACKLINKS - ARTICLE SUBMISSION</h1>
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
                    .guide-image-block {
                      margin: 2rem 0;
                      text-align: center;
                    }
                    .guide-image-block figcaption {
                      margin-top: 1rem;
                      font-style: italic;
                      color: #666;
                    }
                  `}
                </style>

                <div className="guide-intro">
                  <h3>RELEVANT BACKLINKS - ARTICLE SUBMISSION</h3>
                  <p>To rank high in Google, especially for competitive keywords, you need "authority." That authority is built through PageRank and Keyword Authority — both of which are strengthened with backlinks. Here's how to earn them the right way.</p>
                </div>

                <div className="guide-section">
                  <h4>What Is a Backlink?</h4>
                  <p>A backlink is a link from another website that points to your site. For example, if banana.com links to yoursite.com, that's a backlink. The more relevant and trustworthy that site is, the more SEO juice you get.</p>
                </div>

                <figure className="guide-image-block">
                  <img src="/assets/images/images/backlinks.png" alt="Backlinks Overview" className="guide-image" />
                  <figcaption>Understanding how backlinks work is crucial for SEO success.</figcaption>
                </figure>

                <div className="guide-section">
                  <h4>PageRank Explained</h4>
                  <p>PageRank measures how many other websites link to your page and how authoritative those sites are. A link from a blog no one knows won't help much. A link from a trusted, high-traffic site can do wonders for your ranking.</p>
                  <figure className="guide-image-block">
                    <img src="/assets/images/images/backlinks02.png" alt="Backlinks Strategy" className="guide-image" />
                    <figcaption>Strategic backlink building leads to better search rankings.</figcaption>
                  </figure>
                </div>

                <div className="guide-section">
                  <h4>Keyword Authority</h4>
                  <p>Keyword Authority reflects how well your page ranks for a specific keyword. You build it by optimizing your content and earning backlinks from pages that are topically relevant to your keyword.</p>
                </div>

                <div className="guide-section">
                  <h4>The Role of Anchor Text</h4>
                  <p>Anchor text is the clickable text of a backlink. Google pays attention to what those words say. Instead of linking with "click here," try using something like "best SEO tools" — it's descriptive, relevant, and boosts your keyword authority.</p>
                </div>

                <div className="guide-section">
                  <h4>How to Maximize Keyword Authority</h4>
                  <p>Try to earn backlinks that meet two or more of the following:</p>
                  <ul>
                    <li>The site is in your niche or industry</li>
                    <li>The content on the page linking to you uses your keyword</li>
                    <li>The anchor text uses your keyword</li>
                  </ul>
                  <p>The more these line up, the more weight your backlink carries.</p>
                </div>

                <div className="guide-section">
                  <h4>Article Submission: Your SEO Secret Weapon</h4>
                  <p>Writing articles isn't just about traffic — it's about trust. Google loves quality content and so do article directories. Focus on being informative, not salesy.</p>
                  <p><strong>Sample Article Structure:</strong></p>
                  <ul>
                    <li><strong>Title:</strong> Use your keyword naturally</li>
                    <li><strong>Body:</strong> Write 400–700 words that educate</li>
                    <li><strong>Author Box:</strong> Link back to your site with relevant anchor text</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h4>Submission Strategy</h4>
                  <p>Use a distribution service like Article Marketer to publish your article across thousands of directories. This creates a steady stream of backlinks over time — no spam, just gradual growth.</p>
                </div>

                <div className="guide-section">
                  <h4>Final Tips</h4>
                  <ul>
                    <li>Use original content — don't copy and paste the same article everywhere</li>
                    <li>Stay consistent — 1 article a week builds momentum over time</li>
                    <li>Don't sell — teach. Educate your readers to build credibility and trust</li>
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
                <Link to="/training/guides/backlinks-social" className="related-guide-item">
                  <h4>Relevant Backlinks - Social Bookmarking</h4>
                  <p>Want backlinks and more exposure? Drop your pages in the right directories...</p>
                </Link>
                <Link to="/training/guides/article-marketing" className="related-guide-item">
                  <h4>Article Marketing Getting Started</h4>
                  <p>Write articles, post 'em on the right sites, and let Google do the rest...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklinksArticle; 