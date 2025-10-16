import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import FoundersTimer from '../components/FoundersTimer';
import FoundersSpotCounter from '../components/FoundersSpotCounter';
import PlanSwitcher from '../components/PlanSwitcher';
import { API_ENDPOINTS, FOUNDERS_ANNUAL_CONFIG } from '../config/constants';
import { FaCheckCircle, FaShieldAlt, FaLock } from 'react-icons/fa';

export default function FoundersAnnualCheckout() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerStarted, setTimerStarted] = useState(null);

  useEffect(() => {
    // Track page visit and start timer
    const identifier = localStorage.getItem('user_email') || `anon_${Date.now()}`;
    
    fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.FOUNDERS.TIMER_START}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    })
      .then(res => res.json())
      .then(data => {
        if (data.timer_started_at) {
          setTimerStarted(data.timer_started_at);
          localStorage.setItem('founders_timer_start', data.timer_started_at);
        }
      })
      .catch(err => console.error('Timer start error:', err));
  }, []);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const endpoint = selectedPlan === 'annual' 
        ? API_ENDPOINTS.FOUNDERS_ANNUAL_SESSION 
        : API_ENDPOINTS.FOUNDERS_MONTHLY_SESSION;

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrer_username: localStorage.getItem('ref_id') || 'none',
          timer_started_at: timerStarted
        })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error connecting to server. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleTimerExpiry = () => {
    // Show waitlist or redirect
    alert('This exclusive offer has expired. Contact us to join the waitlist.');
  };

  return (
    <div className="founders-checkout-page">
      <Navbar />
      
      <div className="founders-checkout-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="checkout-content"
        >
          {/* Hero Section */}
          <div className="hero-section">
            <h1 className="main-headline">
              {FOUNDERS_ANNUAL_CONFIG.MARKETING_COPY.HEADLINE}
            </h1>
            <p className="sub-headline">
              {FOUNDERS_ANNUAL_CONFIG.MARKETING_COPY.SUBHEADLINE}
            </p>
          </div>

          {/* Timer */}
          <FoundersTimer 
            timerStartedAt={timerStarted} 
            onExpiry={handleTimerExpiry}
          />

          {/* Spot Counter */}
          <FoundersSpotCounter />

          {/* Plan Switcher */}
          <PlanSwitcher 
            defaultPlan="annual"
            onPlanChange={setSelectedPlan}
          />

          {/* Bonuses Section */}
          <div className="bonuses-section">
            <h2 className="section-title">🎁 Your Founder Benefits</h2>
            <div className="bonuses-grid">
              {FOUNDERS_ANNUAL_CONFIG.BONUSES.map((bonus, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bonus-card"
                >
                  <div className="bonus-icon">{bonus.icon}</div>
                  <h3 className="bonus-title">{bonus.title}</h3>
                  <p className="bonus-description">{bonus.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="quick-links-section">
            <div className="quick-link-card">
              <h3>📅 Schedule Your Onboarding</h3>
              <p>Book your 1-on-1 call after checkout</p>
              <a 
                href={FOUNDERS_ANNUAL_CONFIG.CALENDLY_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="preview-link"
              >
                Preview Calendar →
              </a>
            </div>
            <div className="quick-link-card">
              <h3>💬 Join the Discord</h3>
              <p>Connect with other founders</p>
              <a 
                href={FOUNDERS_ANNUAL_CONFIG.DISCORD_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="preview-link"
              >
                Preview Community →
              </a>
            </div>
            <div className="quick-link-card">
              <h3>📚 Access the Vault</h3>
              <p>4 playbooks for business growth</p>
              <a 
                href={FOUNDERS_ANNUAL_CONFIG.VAULT_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="preview-link"
              >
                Preview Resources →
              </a>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="checkout-cta-section">
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="checkout-btn"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <FaLock className="btn-icon" />
                  {selectedPlan === 'annual' 
                    ? `Secure Your Founder Spot - $${FOUNDERS_ANNUAL_CONFIG.ANNUAL_PRICE}`
                    : `Continue with Monthly - $${FOUNDERS_ANNUAL_CONFIG.MONTHLY_PRICE}/mo`
                  }
                </>
              )}
            </button>
            
            <div className="trust-badges">
              <div className="trust-badge">
                <FaShieldAlt />
                <span>Secure Checkout</span>
              </div>
              <div className="trust-badge">
                <FaCheckCircle />
                <span>{FOUNDERS_ANNUAL_CONFIG.GUARANTEE_DAYS}-Day Guarantee</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>What happens after I join?</h4>
                <p>You'll receive immediate access to the Founders Vault, Discord invite within 5 minutes, and instructions to schedule your 1-on-1 onboarding call.</p>
              </div>
              <div className="faq-item">
                <h4>Is this really locked in forever?</h4>
                <p>Yes! Your $470/year rate is guaranteed for life. Even if we raise prices to $997/year next month, you'll always pay $470.</p>
              </div>
              <div className="faq-item">
                <h4>What's the refund policy?</h4>
                <p>Full 60-day money-back guarantee. If you're not satisfied for any reason, email support for a complete refund - no questions asked.</p>
              </div>
              <div className="faq-item">
                <h4>Why only 20 spots?</h4>
                <p>As a solo founder, I can only provide high-touch support to a limited number of members. This ensures every founder gets the attention they deserve.</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      <style>{`
        .founders-checkout-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding-bottom: 4rem;
        }

        .founders-checkout-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .checkout-content {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .hero-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .main-headline {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .sub-headline {
          font-size: 1.25rem;
          color: #6b7280;
          margin: 0;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .bonuses-section {
          margin: 3rem 0;
        }

        .bonuses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .bonus-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .bonus-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .bonus-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .bonus-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .bonus-description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
        }

        .quick-links-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }

        .quick-link-card {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.25rem;
          text-align: center;
        }

        .quick-link-card h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .quick-link-card p {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .preview-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .preview-link:hover {
          color: #764ba2;
        }

        .checkout-cta-section {
          margin: 3rem 0 2rem;
          text-align: center;
        }

        .checkout-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1.25rem 2.5rem;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          max-width: 500px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }

        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
        }

        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.25rem;
        }

        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .trust-badge svg {
          color: #10b981;
          font-size: 1.25rem;
        }

        .faq-section {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
        }

        .faq-grid {
          display: grid;
          gap: 1.5rem;
        }

        .faq-item {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.25rem;
        }

        .faq-item h4 {
          font-size: 1.125rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .faq-item p {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .checkout-content {
            padding: 1.5rem;
          }

          .main-headline {
            font-size: 1.875rem;
          }

          .sub-headline {
            font-size: 1rem;
          }

          .bonuses-grid {
            grid-template-columns: 1fr;
          }

          .quick-links-section {
            grid-template-columns: 1fr;
          }

          .checkout-btn {
            font-size: 1rem;
            padding: 1rem 1.5rem;
          }

          .trust-badges {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

