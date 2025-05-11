import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const ShoestringStartups = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">SHOESTRING STARTUPS</h1>
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
                  title="Shoestring Startups"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="video-description">
                <h3>About This Video</h3>
                <p>Launching on a tight budget? This guide walks you through how to get up and running with damn near nothing—and still win.</p>
                
                <h3>What You'll Learn</h3>
                <ul>
                  <li>How to start a business with minimal resources</li>
                  <li>Creative ways to save money and maximize impact</li>
                  <li>Stories of successful shoestring startups</li>
                  <li>Essential tools and strategies for lean launches</li>
                </ul>

                <h3>Expert Bio</h3>
                <p>[Expert name] is a startup founder who has built multiple businesses from the ground up with limited resources, proving you don't need a big budget to win.</p>
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
                <Link to="/training/videos/entrepreneurial" className="related-video-item">
                  <h4>Entrepreneurial Brainstorming</h4>
                  <p>Get in the mind of real entrepreneurs and see how they come up with ideas...</p>
                </Link>
                <Link to="/training/videos/bulletproof-branding" className="related-video-item">
                  <h4>Bulletproof Branding</h4>
                  <p>Your brand is your reputation. Learn how to build one that hits hard...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoestringStartups; 