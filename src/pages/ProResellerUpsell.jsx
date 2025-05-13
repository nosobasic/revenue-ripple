import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCheckCircle } from 'react-icons/fa';
import '../pages.css';
import { useEffect } from 'react';

export default function ProResellerUpsell() {
  const navigate = useNavigate();

  const handleProResellerUpgrade = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-pro-reseller-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer_username: localStorage.getItem("ref_id") || "none" })
    });
    const data = await res.json();
    window.location.href = data.url;
  };

  useEffect(() => {
    // Redirect to 3 months free offer after 3 seconds
    const timer = setTimeout(() => {
      navigate('/three-months-free-upsell');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="home">
      <Navbar />
      <section className="hero" style={{ background: 'none', paddingBottom: 0 }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#1e293b', textAlign: 'center' }}>
          Upgrade to Pro Reseller and <span style={{ color: '#2563eb' }}>Double Your Earnings</span>
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 500, textAlign: 'center', marginBottom: '2.5rem' }}>
          Get exclusive access to premium tools and higher commissions with our Pro Reseller program
        </p>
      </section>

      <div className="container">
        <div className="content-section" style={{ background: 'white', marginTop: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Pro Reseller Benefits
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div className="benefit-card">
              <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
                Higher Commissions
              </h3>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> Earn 100% commission on all member referrals</li>
                <li><FaCheckCircle className="checkmark" /> Get 20% commission on other reseller signups</li>
                <li><FaCheckCircle className="checkmark" /> Priority payout processing</li>
              </ul>
            </div>

            <div className="benefit-card">
              <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
                Premium Tools
              </h3>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> Advanced analytics dashboard</li>
                <li><FaCheckCircle className="checkmark" /> Custom landing page builder</li>
                <li><FaCheckCircle className="checkmark" /> Automated email sequences</li>
              </ul>
            </div>

            <div className="benefit-card">
              <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
                Exclusive Support
              </h3>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> Priority support response</li>
                <li><FaCheckCircle className="checkmark" /> Monthly strategy calls</li>
                <li><FaCheckCircle className="checkmark" /> Access to mastermind group</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={handleProResellerUpgrade}
              className="cta-button"
              style={{ 
                fontSize: '1.25rem',
                padding: '1rem 2rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                marginBottom: '1rem'
              }}
            >
              Upgrade to Pro Reseller - $97/month
            </button>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              <Link to="/reseller-success" style={{ color: '#64748b', textDecoration: 'underline' }}>
                No thanks, I'll stick with the basic plan
              </Link>
            </p>
          </div>
        </div>

        <div className="content-section" style={{ background: '#f8fafc', marginTop: '2rem', borderRadius: '12px', padding: '2rem' }}>
          <h3 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            What Our Pro Resellers Say
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ color: '#1e293b', fontSize: '1rem', marginBottom: '1rem' }}>
                "Upgrading to Pro was the best decision I made. The advanced tools helped me scale my earnings to over $5,000/month."
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>- Sarah M., Pro Reseller</p>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ color: '#1e293b', fontSize: '1rem', marginBottom: '1rem' }}>
                "The priority support and strategy calls have been invaluable. I've doubled my conversion rate since upgrading."
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>- Michael T., Pro Reseller</p>
            </div>
          </div>
        </div>

        {/* Redirect Notice */}
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Wait! We have a special offer for you. Redirecting in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
} 