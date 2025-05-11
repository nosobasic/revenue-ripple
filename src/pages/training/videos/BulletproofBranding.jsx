import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import '../../../pages.css';

const BulletproofBranding = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">BULLETPROOF BRANDING</h1>
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
                  title="Bulletproof Branding"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="video-description">
                <h3>About This Video</h3>
                <p>Your brand is your reputation. Learn how to build one that hits hard and sticks with people long after they scroll past.</p>
                
                <h3>What You'll Learn</h3>
                <ul>
                  <li>How to create a memorable brand identity</li>
                  <li>Branding strategies that work in any industry</li>
                  <li>Common branding mistakes and how to avoid them</li>
                  <li>Real-world examples of powerful brands</li>
                </ul>

                <h3>Expert Bio</h3>
                <p>[Expert name] is a branding specialist with [X] years of experience helping companies and entrepreneurs build unforgettable brands.</p>
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

export default BulletproofBranding; 