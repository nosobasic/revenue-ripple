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
                <p>Get in the mind of real entrepreneurs and see how they come up with money-making ideas from scratch. Simple systems, big results.</p>
                
                <h3>What You'll Learn</h3>
                <ul>
                  <li>How successful entrepreneurs generate business ideas</li>
                  <li>Techniques for effective brainstorming sessions</li>
                  <li>Methods to validate and refine your ideas</li>
                  <li>Real-world examples of successful business concepts</li>
                </ul>

                <h3>Expert Bio</h3>
                <p>[Expert name] is a successful entrepreneur with [X] years of experience in [industry]. They have founded multiple successful businesses and are passionate about helping others achieve their entrepreneurial dreams.</p>
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