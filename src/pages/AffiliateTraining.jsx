import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliateTraining = () => {
  const trainingModules = [
    {
      id: 1,
      title: 'Getting Started',
      description: 'Essential knowledge for new affiliates',
      lessons: [
        { title: 'Affiliate Program Overview', duration: '15 min', completed: true },
        { title: 'Setting Up Your Account', duration: '20 min', completed: true },
        { title: 'Understanding Commissions', duration: '25 min', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Marketing Strategies',
      description: 'Proven methods to promote effectively',
      lessons: [
        { title: 'Email Marketing Basics', duration: '30 min', completed: false },
        { title: 'Social Media Promotion', duration: '25 min', completed: false },
        { title: 'Content Marketing', duration: '35 min', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Advanced Techniques',
      description: 'Take your affiliate marketing to the next level',
      lessons: [
        { title: 'Conversion Optimization', duration: '40 min', completed: false },
        { title: 'Advanced Tracking', duration: '30 min', completed: false },
        { title: 'Scaling Your Campaigns', duration: '45 min', completed: false }
      ]
    }
  ];

  const successStories = [
    {
      id: 1,
      name: 'Sarah Johnson',
      earnings: '$12,450',
      strategy: 'Email Marketing',
      quote: 'Started with zero experience, now earning consistent monthly income.'
    },
    {
      id: 2,
      name: 'Mike Chen',
      earnings: '$8,750',
      strategy: 'Social Media',
      quote: 'Found my niche and scaled quickly using the training materials.'
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Affiliate Training</h1>
          <p className="dashboard-welcome">Learn & Master Affiliate Marketing</p>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* Training Modules */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">📚</div>
              <h2>Training Modules</h2>
            </div>
            <div className="section-content">
              {trainingModules.map((module) => (
                <div key={module.id} className="course-item">
                  <h3>{module.title}</h3>
                  <div className="course-details">
                    <p>{module.description}</p>
                    <div className="lessons-list">
                      {module.lessons.map((lesson, index) => (
                        <div key={index} className="lesson-item">
                          <div className="lesson-info">
                            <span className={`lesson-status ${lesson.completed ? 'completed' : ''}`}>
                              {lesson.completed ? '✓' : '○'}
                            </span>
                            <span className="lesson-title">{lesson.title}</span>
                          </div>
                          <span className="lesson-duration">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                    <button className="cta-button">Start Module</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Success Stories */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">🏆</div>
              <h2>Success Stories</h2>
            </div>
            <div className="section-content">
              <div className="grid-layout">
                {successStories.map((story) => (
                  <div key={story.id} className="course-item">
                    <h3>{story.name}</h3>
                    <div className="course-details">
                      <div className="success-details">
                        <div className="detail-group">
                          <strong>Earnings:</strong>
                          <span>{story.earnings}</span>
                        </div>
                        <div className="detail-group">
                          <strong>Strategy:</strong>
                          <span>{story.strategy}</span>
                        </div>
                      </div>
                      <p className="success-quote">"{story.quote}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="side-content">
          {/* Progress Overview */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">📊</div>
              <h2>Your Progress</h2>
            </div>
            <div className="section-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">2/9</div>
                  <div className="stat-label">Lessons Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">22%</div>
                  <div className="stat-label">Overall Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">1/3</div>
                  <div className="stat-label">Modules Completed</div>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">📋</div>
              <h2>Navigation</h2>
            </div>
            <div className="section-content">
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre" className="cta-link">
                    <span className="item-icon">🏠</span>
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/tools" className="cta-link">
                    <span className="item-icon">🛠️</span>
                    Marketing Tools
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/payouts" className="cta-link">
                    <span className="item-icon">💰</span>
                    Earnings & Payouts
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link to="/affiliate-centre/support" className="cta-link">
                    <span className="item-icon">💬</span>
                    Support & FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AffiliateTraining; 