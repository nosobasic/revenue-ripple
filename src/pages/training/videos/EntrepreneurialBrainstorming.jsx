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
              <h2>Video Modules</h2>
            </div>
            <div className="section-content">
              {/* Intro Video */}
              {course?.introVideo?.vimeoId && (
                <div className="video-container" style={{ marginBottom: 24 }}>
                  <iframe
                    src={`https://player.vimeo.com/video/${course.introVideo.vimeoId}`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Intro Video"
                  ></iframe>
                  <div className="video-description">
                    <h3>Introduction</h3>
                    <p>{course.description}</p>
                  </div>
                </div>
              )}

              {/* Module Tabs/Buttons */}
              <div className="modules-list" style={{ marginBottom: 16 }}>
                {modules.map((mod, idx) => (
                  <button
                    key={mod.title}
                    onClick={() => setModalIdx(idx)}
                    style={{
                      fontWeight: modalIdx === idx ? 'bold' : 'normal',
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: modalIdx === idx ? '2px solid #2563eb' : '1px solid #ccc',
                      background: modalIdx === idx ? '#e0e7ff' : '#fff',
                      cursor: 'pointer'
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
                    justifyContent: 'center'
                  }}
                  onClick={() => setModalIdx(null)}
                >
                  <div
                    className="modal-content"
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      padding: 24,
                      maxWidth: 700,
                      width: '90%',
                      position: 'relative'
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
                        cursor: 'pointer'
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <iframe
                      src={`https://player.vimeo.com/video/${modules[modalIdx].video.vimeoId}`}
                      width="100%"
                      height="400"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={modules[modalIdx].title}
                      style={{ borderRadius: 8 }}
                    ></iframe>
                    <div className="video-description" style={{ marginTop: 16 }}>
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