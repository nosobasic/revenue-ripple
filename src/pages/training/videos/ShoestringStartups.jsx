import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { courses } from '../../../data/courses';
import '../../../pages.css';

const course = courses.find(c => c.slug === 'shoestring-startups');
const modules = course ? course.modules : [];

const ShoestringStartups = () => {
  const [expandedSections, setExpandedSections] = React.useState({
    intro: true, // Start with intro expanded
    workbook: false,
    ...Object.fromEntries(modules.map((_, idx) => [`module-${idx}`, false]))
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">SHOESTRING STARTUPS</h1>
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
              {/* Intro Video Tab */}
              {course?.introVideo?.vimeoId && (
                <div className="video-tab">
                  <button 
                    className="video-tab-header"
                    onClick={() => toggleSection('intro')}
                  >
                    <span>🎬 Introduction Video</span>
                    <span className="tab-icon">
                      {expandedSections.intro ? '−' : '+'}
                    </span>
                  </button>
                  {expandedSections.intro && (
                    <div className="video-tab-content">
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
                      <div className="video-description">
                        <h3>About This Video</h3>
                        <p>
                          Launching on a tight budget? This guide walks you through how to get up and running with damn near nothing—and still win. Learn proven strategies for building successful startups without breaking the bank.
                        </p>
                        <h3>What You'll Learn</h3>
                        <ul>
                          <li>How to start a business with minimal resources</li>
                          <li>Creative ways to save money and maximize impact</li>
                          <li>Stories of successful shoestring startups</li>
                          <li>Essential tools and strategies for lean launches</li>
                          <li>How to scale your business while keeping costs low</li>
                        </ul>
                        <h3>Expert Bio</h3>
                        <p>
                          Mike Rodriguez is a serial entrepreneur and startup advisor who has built multiple businesses from the ground up with limited resources. Having launched three successful companies with less than $5,000 each, Mike has proven that you don't need a big budget to win. He's helped over 200 entrepreneurs launch their businesses and has been featured in major publications for his innovative approach to lean startup methodology.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Download Workbook Tab */}
              <div className="video-tab">
                <button 
                  className="video-tab-header"
                  onClick={() => toggleSection('workbook')}
                >
                  <span>📚 Download Workbook</span>
                  <span className="tab-icon">
                    {expandedSections.workbook ? '−' : '+'}
                  </span>
                </button>
                {expandedSections.workbook && (
                  <div className="video-tab-content">
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      borderRadius: 12, 
                      padding: '2rem', 
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>📚 Download Your Shoestring Startup Worksheet</h3>
                      <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                        Get your hands on our comprehensive shoestring startup worksheet. 
                        This interactive guide includes lean startup worksheets, budget templates, 
                        and exercises to help you launch your business on a shoestring budget.
                      </p>
                      <a 
                        href="/assets/downloads/Shoestring_Startup_Worksheet.docx" 
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
                        📥 Download Shoestring Startup Worksheet (DOCX)
                      </a>
                      <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                        Free download • No registration required
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Module Videos Tabs */}
              {modules.map((mod, idx) => (
                <div key={mod.title} className="video-tab">
                  <button 
                    className="video-tab-header"
                    onClick={() => toggleSection(`module-${idx}`)}
                  >
                    <span>🎥 {mod.title}</span>
                    <span className="tab-icon">
                      {expandedSections[`module-${idx}`] ? '−' : '+'}
                    </span>
                  </button>
                  {expandedSections[`module-${idx}`] && (
                    <div className="video-tab-content">
                      <div className="video-container">
                        <iframe
                          width="100%"
                          height="600"
                          src={`https://player.vimeo.com/video/${mod.video.vimeoId}`}
                          title={mod.title}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="video-description">
                        <h3>{mod.title}</h3>
                        <p>{mod.description}</p>
                      </div>
                    </div>
                  )}
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
                <Link to="/training/videos/entrepreneurial-brainstorming" className="related-video-item">
                  <h4>Entrepreneurial Brainstorming</h4>
                  <p>Discover how top-performing entrepreneurs transform everyday experiences into million-dollar ideas...</p>
                </Link>
                <Link to="/training/videos/mindset-mastery" className="related-video-item">
                  <h4>Mindset Mastery</h4>
                  <p>Master the mental game of entrepreneurship. Learn how to develop the mindset...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .video-tab {
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .video-tab-header {
          width: 100%;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 600;
          color: #1e293b;
          transition: all 0.2s ease;
        }
        
        .video-tab-header:hover {
          background: #e2e8f0;
        }
        
        .tab-icon {
          font-size: 1.5rem;
          font-weight: bold;
          color: #64748b;
        }
        
        .video-tab-content {
          background: white;
          padding: 1.5rem;
        }

        .related-videos {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .related-video-item {
          display: block;
          padding: 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .related-video-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .related-video-item h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }

        .related-video-item p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ShoestringStartups; 