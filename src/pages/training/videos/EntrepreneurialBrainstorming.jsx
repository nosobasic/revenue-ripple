import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { courses } from '../../../data/courses';
import '../../../pages.css';

const course = courses.find(c => c.slug === 'entrepreneurial-brainstorming');
const modules = course ? course.modules : [];

const EntrepreneurialBrainstorming = () => {
  const [modalIdx, setModalIdx] = React.useState(null);

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
        .modal-backdrop {
          z-index: 2000 !important;
        }
        .modal-content {
          z-index: 2100 !important;
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

              {/* Module Tabs/Buttons */}
              <div className="modules-list" style={{ marginBottom: 16 }}>
                {modules.map((mod, idx) => (
                  <button
                    key={mod.title}
                    onClick={() => setModalIdx(idx)}
                    className={modalIdx === idx ? 'selected' : ''}
                    style={{
                      fontWeight: modalIdx === idx ? 'bold' : '500',
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: modalIdx === idx ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                      background: modalIdx === idx ? '#2563eb' : '#f1f5f9',
                      color: modalIdx === idx ? '#fff' : '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>

              {/* Modal for selected module */}
              {modalIdx !== null && modules[modalIdx] && (
                <div
                  className="modal-backdrop"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setModalIdx(null)}
                >
                  <div
                    className="modal-content"
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      padding: 24,
                      maxWidth: 800,
                      width: '95vw',
                      position: 'relative',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setModalIdx(null)}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'transparent',
                        border: 'none',
                        fontSize: 24,
                        cursor: 'pointer',
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div style={{ position: 'relative', width: '100%', maxWidth: 700, aspectRatio: '16/9', background: '#000', borderRadius: 8, overflow: 'hidden' }}>
                      <iframe
                        src={`https://player.vimeo.com/video/${modules[modalIdx].video.vimeoId}`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={modules[modalIdx].title}
                      ></iframe>
                    </div>
                    <div className="video-description" style={{ marginTop: 16, width: '100%', maxWidth: 700 }}>
                      <h3>{modules[modalIdx].title}</h3>
                      <p>{modules[modalIdx].description}</p>
                    </div>
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