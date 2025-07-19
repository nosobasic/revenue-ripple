import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { courses } from '../../../data/courses';
import '../../../pages.css';

const course = courses.find(c => c.slug === 'entrepreneurial-brainstorming');
const modules = course ? course.modules : [];

const EntrepreneurialBrainstorming = () => {
  const [selectedIdx, setSelectedIdx] = React.useState(null);

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">ENTREPRENEURIAL BRAINSTORMING</h1>
          <div className="dashboard-welcome">Guest Expert Video Series</div>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2>Video Content</h2>
            </div>
            <div className="section-content">
              {/* Intro Video */}
              {course?.introVideo?.vimeoId && (
                <div className="video-container">
                  <iframe
                    width="100%"
                    height="600"
                    src={`https://player.vimeo.com/video/${course.introVideo.vimeoId}`}
                    title="Introduction"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="video-description">
                <h3>About This Video</h3>
                <p>
                  Discover the art of entrepreneurial brainstorming and how to generate, validate, and refine startup ideas. This session is designed to help you unlock your creative potential and turn ideas into actionable business opportunities.
                </p>
                <h3>What You'll Learn</h3>
                <ul>
                  <li>How to brainstorm and validate business ideas</li>
                  <li>Techniques for creative problem-solving</li>
                  <li>Real-world examples of successful startups</li>
                  <li>How to avoid common pitfalls in the ideation phase</li>
                </ul>
                <h3>Expert Bio</h3>
                <p>
                  Jordan Reyes is a seasoned startup strategist and serial entrepreneur with over 15 years of experience in launching, scaling, and advising tech-focused businesses. Having raised over $40 million in venture funding and taken two companies through successful exits, Jordan is known for his no-fluff approach to validating business models and building lean, profitable ventures. He's mentored hundreds of founders globally through programs like Techstars and Y Combinator's Startup School, and is a frequent speaker on innovation, hustle culture, and early-stage growth.
                </p>
              </div>

              {/* Download Workbook Section */}
              <div className="video-container" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderRadius: 12, 
                padding: '2rem', 
                color: 'white',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>📚 Download Your Workbook</h3>
                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                  Get your hands on our comprehensive entrepreneurial brainstorming workbook. 
                  This interactive guide includes worksheets, templates, and exercises to help you 
                  apply what you learn from the videos.
                </p>
                <a 
                  href="/assets/downloads/revenue_ripple_entrepreneurial_brainstorm.docx" 
                  download
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    border: '2px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  📥 Download Workbook (DOCX)
                </a>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  Free download • No registration required
                </p>
              </div>

              {/* Additional Module Videos */}
              {modules.map((mod, idx) => (
                <div key={mod.title} className="video-container">
                  <iframe
                    width="100%"
                    height="600"
                    src={`https://player.vimeo.com/video/${mod.video.vimeoId}`}
                    title={mod.title}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  
                  <div className="video-description">
                    <h3>{mod.title}</h3>
                    <p>{mod.description}</p>
                  </div>
                </div>
              ))}
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