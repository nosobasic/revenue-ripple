import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const LandingComponents = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">COMPONENTS OF A LANDING PAGE</h1>
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
                  <h3>Landing pages are your digital pitchman.</h3>
                  <p>Whether it's reviews or testimonials, this guide shows you how to build pages that warm people up and get them to click 'buy.'</p>
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
                <Link to="/training/guides/landing-optimization" className="related-guide-item">
                  <h4>Landing Page Optimization</h4>
                  <p>If people land on your page and bounce, you're wasting money...</p>
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

export default LandingComponents; 