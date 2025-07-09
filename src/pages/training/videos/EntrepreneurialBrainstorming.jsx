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
      <style>{`
        .dashboard {
          background: #f8fafc !important;
          min-height: 100vh;
        }
        .main-content, .side-content {
          padding-bottom: 2rem;
        }
        .video-container {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .modules-list button {
          color: #1e293b;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          font-weight: 500;
          transition: all 0.2s;
        }
        .modules-list button:hover {
          background: #e0e7ff;
          color: #2563eb;
          border-color: #2563eb;
        }
        .modules-list button.selected, .modules-list button[aria-current="true"] {
          background: #2563eb;
          color: #fff;
          border: 2px solid #2563eb;
          font-weight: bold;
        }
      `}</style>
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">ENTREPRENEURIAL BRAINSTORMING</h1>
          <div className="dashboard-welcome">Guest Expert Video Series</div>
        </div>
      </header>

      <div className="container dashboard-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div className="main-content" style={{ flex: '1 1 600px', maxWidth: 800, margin: '0 auto' }}>
          <div className="section">
            <div className="section-header">
              <h2>Video Modules</h2>
            </div>
            <div className="section-content">
              {/* Intro Video */}
              {course?.introVideo?.vimeoId && (
                <div className="video-container" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: 700, aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
                  <iframe
                    src={`https://player.vimeo.com/video/${course.introVideo.vimeoId}`}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Intro Video"
                  ></iframe>
                  </div>
                  <div className="video-description" style={{ width: '100%', maxWidth: 700 }}>
                    <h3>Introduction</h3>
                    <p>{course.description}</p>
                  </div>
                </div>
              )}

              {/* Overview and Details Section */}
              <div className="video-description" style={{ marginBottom: 32 }}>
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
                  Jordan Reyes is a seasoned startup strategist and serial entrepreneur with over 15 years of experience in launching, scaling, and advising tech-focused businesses. Having raised over $40 million in venture funding and taken two companies through successful exits, Jordan is known for his no-fluff approach to validating business models and building lean, profitable ventures. He's mentored hundreds of founders globally through programs like Techstars and Y Combinator’s Startup School, and is a frequent speaker on innovation, hustle culture, and early-stage growth.
                </p>
              </div>

              {/* Download Workbook Section */}
              <div className="video-container" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  borderRadius: 12, 
                  padding: '2rem', 
                  width: '100%', 
                  maxWidth: 700,
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
              </div>

              {/* Module Tabs/Buttons */}
              <div className="modules-list" style={{ marginBottom: 16 }}>
                {modules.map((mod, idx) => (
                  <button
                    key={mod.title}
                    onClick={() => setSelectedIdx(idx)}
                    className={selectedIdx === idx ? 'selected' : ''}
                    style={{
                      fontWeight: selectedIdx === idx ? 'bold' : '500',
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: selectedIdx === idx ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                      background: selectedIdx === idx ? '#2563eb' : '#f1f5f9',
                      color: selectedIdx === idx ? '#fff' : '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>

              {/* Inline video and description for selected module */}
              {selectedIdx !== null && modules[selectedIdx] && (
                <div className="video-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: 700, aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
                    <iframe
                      src={`https://player.vimeo.com/video/${modules[selectedIdx].video.vimeoId}`}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={modules[selectedIdx].title}
                    ></iframe>
                  </div>
                  <div className="video-description" style={{ marginTop: 16, width: '100%', maxWidth: 700 }}>
                    <h3>{modules[selectedIdx].title}</h3>
                    <p>{modules[selectedIdx].description}</p>
                  </div>
                </div>
              )}
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