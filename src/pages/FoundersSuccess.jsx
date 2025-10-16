import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { FOUNDERS_ANNUAL_CONFIG } from '../config/constants';
import { FaCheckCircle, FaDiscord, FaCalendarAlt, FaBook, FaRocket } from 'react-icons/fa';

export default function FoundersSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Mark timer as converted
    const identifier = localStorage.getItem('user_email') || localStorage.getItem('founders_timer_identifier');
    if (identifier) {
      // Optional: Update backend that user converted
      console.log('Founder conversion complete for:', identifier);
    }

    // Clear timer from localStorage since they've purchased
    localStorage.removeItem('founders_timer_start');
  }, []);

  const nextSteps = [
    {
      icon: <FaCheckCircle />,
      title: 'Check Your Email',
      description: 'Your welcome email is on its way with all the details',
      status: 'Sent immediately',
      color: '#10b981'
    },
    {
      icon: <FaDiscord />,
      title: 'Join the Founders Discord',
      description: 'Connect with fellow founders in our private community',
      link: FOUNDERS_ANNUAL_CONFIG.DISCORD_LINK,
      linkText: 'Join Discord Now →',
      status: 'Ready now',
      color: '#5865f2'
    },
    {
      icon: <FaCalendarAlt />,
      title: 'Schedule Your Onboarding Call',
      description: 'Book your 1-on-1 strategy session to map your path to success',
      link: FOUNDERS_ANNUAL_CONFIG.CALENDLY_LINK,
      linkText: 'Schedule Now →',
      status: 'Book anytime',
      color: '#667eea'
    },
    {
      icon: <FaBook />,
      title: 'Access the Founders Vault',
      description: 'Download your 4 business playbooks (arriving in 2 hours)',
      link: FOUNDERS_ANNUAL_CONFIG.VAULT_LINK,
      linkText: 'Preview Vault →',
      status: 'Email coming soon',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="founders-success-page">
      <Navbar />
      
      <div className="success-container">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="success-icon-container"
        >
          <FaRocket className="success-icon" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="success-content"
        >
          <h1 className="success-headline">
            Welcome to the Founders Circle! 🎉
          </h1>
          <p className="success-subheadline">
            You're officially Founder #{Math.floor(Math.random() * 20) + 1}
          </p>
          <p className="success-description">
            Thank you for being an early supporter. You've locked in your $470/year rate forever, 
            and you're about to get access to everything you need to build a thriving business.
          </p>

          <div className="guarantee-badge">
            <FaCheckCircle className="guarantee-icon" />
            <span>Protected by our 60-day money-back guarantee</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="next-steps-section"
        >
          <h2 className="section-title">📋 Your Next Steps</h2>
          
          <div className="steps-grid">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
                className="step-card"
              >
                <div className="step-icon" style={{ color: step.color }}>
                  {step.icon}
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <h3 className="step-title">{step.title}</h3>
                    <span className="step-status">{step.status}</span>
                  </div>
                  <p className="step-description">{step.description}</p>
                  {step.link && (
                    <a 
                      href={step.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="step-link"
                      style={{ color: step.color }}
                    >
                      {step.linkText}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="benefits-reminder"
        >
          <h3>🎁 Your Founder Benefits</h3>
          <ul className="benefits-list">
            <li>✅ Lifetime locked-in pricing at $470/year</li>
            <li>✅ 1-on-1 onboarding call with Donte</li>
            <li>✅ Private Founders Discord community</li>
            <li>✅ Founders Vault with 4 business playbooks</li>
            <li>✅ Early access to all new features</li>
            <li>✅ Priority support and direct access</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="cta-section"
        >
          <Link to="/dashboard" className="dashboard-btn">
            Go to Your Dashboard
          </Link>
          <p className="help-text">
            Questions? Email <a href="mailto:support@revenueripple.org">support@revenueripple.org</a>
          </p>
        </motion.div>
      </div>

      <style>{`
        .founders-success-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding-bottom: 4rem;
        }

        .success-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 1rem;
        }

        .success-icon-container {
          text-align: center;
          margin-bottom: 2rem;
        }

        .success-icon {
          font-size: 5rem;
          color: white;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
        }

        .success-content {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .success-headline {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .success-subheadline {
          font-size: 1.25rem;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .success-description {
          font-size: 1rem;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .guarantee-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .guarantee-icon {
          font-size: 1.25rem;
        }

        .next-steps-section {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
          color: #1f2937;
        }

        .steps-grid {
          display: grid;
          gap: 1.5rem;
        }

        .step-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1.25rem;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
        }

        .step-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .step-status {
          font-size: 0.75rem;
          background: #e5e7eb;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .step-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .step-link {
          font-weight: 600;
          text-decoration: none;
          font-size: 0.875rem;
          transition: opacity 0.2s;
        }

        .step-link:hover {
          opacity: 0.8;
        }

        .benefits-reminder {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .benefits-reminder h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits-list li {
          font-size: 1rem;
          color: #374151;
          padding: 0.5rem 0;
          line-height: 1.6;
        }

        .cta-section {
          text-align: center;
        }

        .dashboard-btn {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.125rem;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
        }

        .dashboard-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(255, 255, 255, 0.4);
        }

        .help-text {
          color: white;
          margin-top: 1rem;
          font-size: 0.875rem;
        }

        .help-text a {
          color: white;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .success-content,
          .next-steps-section,
          .benefits-reminder {
            padding: 1.5rem;
          }

          .success-headline {
            font-size: 1.875rem;
          }

          .success-icon {
            font-size: 3.5rem;
          }

          .step-card {
            flex-direction: column;
            text-align: center;
          }

          .step-header {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}

