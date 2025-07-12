import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';

const AffiliateTraining = () => {
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStepCompletion = (stepId) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const trainingSteps = [
    {
      id: 1,
      title: 'Start with the Basics',
      description: 'Foundation knowledge for successful affiliate marketing',
      details: 'Start by diving into "Unlock Your Marketing Potential" and then follow it up with "Unleash the Power of Traffic." These two guides are packed with actionable strategies that\'ll set you up to confidently dominate the digital marketing game.',
      resources: [
        { name: 'Unlock Your Marketing Potential', type: 'eBook', status: 'Available' },
        { name: 'Unleash the Power of Traffic', type: 'eBook', status: 'Available' }
      ],
      estimatedTime: '2-3 hours reading'
    },
    {
      id: 2,
      title: 'Set Up Your Funnel',
      description: 'Create your first converting landing page',
      details: 'Next, set up your GetResponse account (or whichever autoresponder you prefer) and build a landing page designed to convert. Inside the Membership Mastery bundle, you\'ll find a proven lead magnet (covered in detail in the first book) that you can offer in exchange for email sign-ups. We\'ll also walk you through exactly what to include on your landing page so it hits the mark. Got your own lead magnet? Even better — feel free to run with that.',
      resources: [
        { name: 'GetResponse Setup Guide', type: 'Guide', status: 'Available' },
        { name: 'Membership Mastery Bundle', type: 'Lead Magnet', status: 'Available' },
        { name: 'Landing Page Templates', type: 'Template', status: 'Available' }
      ],
      estimatedTime: '4-6 hours setup'
    },
    {
      id: 3,
      title: 'Scale Your Marketing',
      description: 'Build a marketing machine with multiple funnels',
      details: 'But don\'t stop there. You\'re not just creating a single funnel — you\'re building a marketing machine. Go ahead and set up a second landing page, this one dedicated to the Digital Marketing Domination (DMD) book. Why settle for one high-converting offer when you can launch two? You\'re here to scale, not stall.',
      resources: [
        { name: 'DMD Landing Page Template', type: 'Template', status: 'Available' },
        { name: 'Scaling Strategies Guide', type: 'Guide', status: 'Available' }
      ],
      estimatedTime: '3-4 hours setup'
    },
    {
      id: 4,
      title: 'Access Advanced Tools',
      description: 'Get your backstage pass to the big leagues',
      details: 'From there, head over to the DMD affiliate sign-up page — think of it like getting access to the backstage pass of this whole operation. Once inside, you\'ll grab your unique affiliate link and unlock a full set of ready-to-use marketing tools. It\'s your official ticket into the big leagues.',
      resources: [
        { name: 'DMD Affiliate Sign-up', type: 'Access', status: 'Available' },
        { name: 'Unique Affiliate Link', type: 'Link', status: 'Generate' },
        { name: 'Advanced Marketing Tools', type: 'Toolset', status: 'Available' }
      ],
      estimatedTime: '1-2 hours setup'
    },
    {
      id: 5,
      title: 'Automate Your Success',
      description: 'Set up your indoctrination sequence and email automation',
      details: 'Now that you\'ve got your funnels live, it\'s time to open up your autoresponder and load in your indoctrination sequence — yes, that\'s a real term. You\'re laying the foundation for building trust and long-term engagement with your audience. After that, plug in the 26 bi-weekly lessons from the Digital Domination series. These emails are designed to educate, engage, and convert — on autopilot.',
      resources: [
        { name: 'Indoctrination Sequence Template', type: 'Email Series', status: 'Available' },
        { name: '26 Bi-weekly Lessons', type: 'Email Series', status: 'Available' },
        { name: 'Autoresponder Setup Guide', type: 'Guide', status: 'Available' }
      ],
      estimatedTime: '2-3 hours setup'
    },
    {
      id: 6,
      title: 'Drive Traffic',
      description: 'Put your foot on the gas and start driving quality traffic',
      details: 'Finally, revisit "Unleash the Power of Traffic." This is where you\'ll put your foot on the gas and start driving quality traffic to your pages using the strategies laid out inside. Stick to the plan, and you\'ll see results.',
      resources: [
        { name: 'Traffic Generation Strategies', type: 'Guide', status: 'Available' },
        { name: 'Traffic Tracking Tools', type: 'Tools', status: 'Available' }
      ],
      estimatedTime: 'Ongoing'
    }
  ];

  const progressPercentage = Math.round((completedSteps.length / trainingSteps.length) * 100);

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">Affiliate Training & Success Path</h1>
          <p className="dashboard-welcome">Master the 6-step process to affiliate success</p>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          {/* Training Progress */}
          <section className="section">
            <div className="section-header marketing">
              <div className="section-icon">🎯</div>
              <h2>Your Success Journey</h2>
            </div>
            <div className="section-content">
              <div className="progress-overview">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="progress-text">{progressPercentage}% Complete - {completedSteps.length} of {trainingSteps.length} steps finished</p>
              </div>
            </div>
          </section>

          {/* Training Steps */}
          <section className="section">
            <div className="section-header affiliate">
              <div className="section-icon">📚</div>
              <h2>Step-by-Step Training</h2>
            </div>
            <div className="section-content">
              {trainingSteps.map((step) => (
                <div key={step.id} className={`course-item ${completedSteps.includes(step.id) ? 'completed' : ''}`}>
                  <div className="step-header">
                    <h3>
                      <span className="step-number">Step {step.id}</span>
                      {step.title}
                    </h3>
                    <button 
                      className={`completion-toggle ${completedSteps.includes(step.id) ? 'completed' : ''}`}
                      onClick={() => toggleStepCompletion(step.id)}
                    >
                      {completedSteps.includes(step.id) ? '✓' : '○'}
                    </button>
                  </div>
                  <div className="course-details">
                    <p className="step-description">{step.description}</p>
                    <div className="step-details">
                      <p>{step.details}</p>
                    </div>
                    <div className="step-resources">
                      <h4>Resources Needed:</h4>
                      <div className="resources-grid">
                        {step.resources.map((resource, index) => (
                          <div key={index} className="resource-item">
                            <span className="resource-name">{resource.name}</span>
                            <span className="resource-type">{resource.type}</span>
                            <span className={`resource-status ${resource.status.toLowerCase()}`}>
                              {resource.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="step-meta">
                      <span className="estimated-time">⏱️ {step.estimatedTime}</span>
                      <Link to="/affiliate-centre/tools" className="cta-button">
                        Access Resources
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Success Tips */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">💡</div>
              <h2>Pro Tips for Success</h2>
            </div>
            <div className="section-content">
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>🎯 Focus on Quality</h4>
                  <p>Don't rush through the steps. Take time to properly set up each funnel and test everything before moving to the next step.</p>
                </div>
                <div className="tip-card">
                  <h4>📊 Track Everything</h4>
                  <p>Monitor your landing page conversion rates, email open rates, and click-through rates. Data drives decisions.</p>
                </div>
                <div className="tip-card">
                  <h4>🔄 Consistency is Key</h4>
                  <p>Success in affiliate marketing comes from consistent effort. Follow the process and trust the system.</p>
                </div>
                <div className="tip-card">
                  <h4>🤝 Build Relationships</h4>
                  <p>Your indoctrination sequence isn't just about selling - it's about building trust with your audience.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="side-content">
          {/* Quick Progress Stats */}
          <section className="section">
            <div className="section-header digital">
              <div className="section-icon">📊</div>
              <h2>Training Progress</h2>
            </div>
            <div className="section-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{completedSteps.length}</div>
                  <div className="stat-label">Steps Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{progressPercentage}%</div>
                  <div className="stat-label">Overall Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{trainingSteps.length - completedSteps.length}</div>
                  <div className="stat-label">Steps Remaining</div>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="section">
            <div className="section-header reseller">
              <div className="section-icon">🚀</div>
              <h2>Next Steps</h2>
            </div>
            <div className="section-content">
              <div className="next-steps">
                {completedSteps.length === 0 ? (
                  <p>Start with Step 1: Download and read "Unlock Your Marketing Potential"</p>
                ) : completedSteps.length === trainingSteps.length ? (
                  <p>🎉 Congratulations! You've completed all training steps. Now focus on driving traffic and optimizing your funnels.</p>
                ) : (
                  <p>Continue with Step {completedSteps.length + 1}: {trainingSteps[completedSteps.length].title}</p>
                )}
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="section">
            <div className="section-header marketing">
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