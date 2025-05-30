import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const EntrepreneurialBrainstorming = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">ENTREPRENEURIAL BRAINSTORMING</h1>
          <div className="dashboard-welcome">Guest Expert Video</div>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2>Video Content</h2>
            </div>
            <div className="section-content">
              <div className="video-container">
                {/* Replace VIDEO_ID with actual YouTube video ID */}
                <iframe
                  width="100%"
                  height="600"
                  src="https://www.youtube.com/embed/VIDEO_ID"
                  title="Entrepreneurial Brainstorming"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="video-description">
                <h3>About This Video</h3>
                <p>Discover how top-performing entrepreneurs transform everyday experiences into million-dollar ideas. This session breaks down practical brainstorming systems, real-world validation techniques, and lean startup strategies to help you launch faster, smarter, and with more confidence.</p>
                
                <h3>What You'll Learn</h3>
                <ul>
                  <li>How to generate business ideas from real-life problems and markets</li>
                  <li>Fast, practical research techniques to validate demand</li>
                  <li>How to test offers before building a full product</li>
                  <li>Steps for building a Minimum Viable Product (MVP)</li>
                  <li>Brand positioning strategies for long-term growth</li>
                </ul>

                <h3>Expert Bio</h3>
                <p>Jordan Blake is a seasoned founder and startup strategist who’s helped launch over a dozen successful digital products. With 12+ years in the tech and education space, Jordan specializes in turning ideas into action. His approach blends lean startup methodology with real-world hustle — perfect for first-time founders and serial entrepreneurs alike.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <h2>Related Videos</h2>
            </div>
            <div className="section-content">
              <div className="related-videos">
                <Link to="/training/videos/bulletproof-branding" className="related-video-item">
                  <h4>Bulletproof Branding</h4>
                  <p>Your brand is your reputation. Learn how to build one that hits hard...</p>
                </Link>
                <Link to="/training/videos/shoestring-startups" className="related-video-item">
                  <h4>Shoestring Startups</h4>
                  <p>Launching on a tight budget? This guide walks you through...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurialBrainstorming; 