import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { courses } from '../../../data/courses';
import '../../../pages.css';

const course = courses.find(c => c.slug === 'entrepreneurial-brainstorming');
const modules = course ? course.modules : [];

const EntrepreneurialBrainstorming = () => {
  const [selected, setSelected] = React.useState(0);
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
              <div className="modules-list" style={{ marginBottom: 16 }}>
                {modules.map((mod, idx) => (
                  <button
                    key={mod.title}
                    onClick={() => setSelected(idx)}
                    style={{
                      fontWeight: selected === idx ? 'bold' : 'normal',
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: selected === idx ? '2px solid #2563eb' : '1px solid #ccc',
                      background: selected === idx ? '#e0e7ff' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>
              {modules[selected] && (
                <div className="video-container" style={{ marginTop: 16 }}>
                  <iframe
                    src={`https://player.vimeo.com/video/${modules[selected].video.vimeoId}`}
                    width="100%"
                    height="480"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={modules[selected].title}
                  ></iframe>
                  <div className="video-description">
                    <h3>{modules[selected].title}</h3>
                    <p>{modules[selected].description}</p>
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