import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const BacklinksSocial = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">RELEVANT BACKLINKS - SOCIAL BOOKMARKING</h1>
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
                  <h3>Want backlinks and more exposure?</h3>
                  <p>Drop your pages in the right directories and let users vote you up. This strategy boosts your rank and your reach.</p>
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
                <Link to="/training/guides/backlinks-article" className="related-guide-item">
                  <h4>Relevant Backlinks - Article Submission</h4>
                  <p>Backlinks are the secret sauce for getting to page one...</p>
                </Link>
                <Link to="/training/guides/seo-google" className="related-guide-item">
                  <h4>SEO - Slap Back @ Google</h4>
                  <p>SEO's a hustle. You can't control everything...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklinksSocial; 