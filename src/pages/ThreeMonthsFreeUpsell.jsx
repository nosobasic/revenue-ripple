import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCheckCircle } from 'react-icons/fa';
import '../pages.css';

export default function ThreeMonthsFreeUpsell() {
  const handleThreeMonthsFreeUpgrade = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-pro-reseller-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        referrer_username: localStorage.getItem("ref_id") || "none",
        three_months_free: true 
      })
    });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="home">
      <Navbar />
      <section className="hero" style={{ background: 'none', paddingBottom: 0 }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#1e293b', textAlign: 'center' }}>
          Special Limited-Time Offer: <span style={{ color: '#2563eb' }}>3 Months Free</span>
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 500, textAlign: 'center', marginBottom: '2.5rem' }}>
          Get started with Pro Reseller today and enjoy your first 3 months completely free
        </p>
      </section>

      <div className="container">
        <div className="content-section" style={{ background: 'white', marginTop: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <div style={{ background: '#fef9c3', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#166534', fontWeight: 700, fontSize: '1.75rem', marginBottom: '1rem' }}>
              Save $291 Today!
            </h2>
            <p style={{ color: '#166534', fontSize: '1.1rem', marginBottom: 0 }}>
              That's 3 months of Pro Reseller benefits completely free
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div className="benefit-card">
              <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
                What You Get
              </h3>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> All Pro Reseller benefits</li>
                <li><FaCheckCircle className="checkmark" /> 100% commission on member referrals</li>
                <li><FaCheckCircle className="checkmark" /> Premium marketing tools</li>
                <li><FaCheckCircle className="checkmark" /> Priority support access</li>
              </ul>
            </div>

            <div className="benefit-card">
              <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem' }}>
                Why Upgrade Now
              </h3>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> Start earning higher commissions immediately</li>
                <li><FaCheckCircle className="checkmark" /> Get 3 months to test all premium features</li>
                <li><FaCheckCircle className="checkmark" /> No risk - cancel anytime</li>
                <li><FaCheckCircle className="checkmark" /> Limited time offer</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={handleThreeMonthsFreeUpgrade}
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
              Get Started - 3 Months Free
            </button>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              <Link to="/affiliate-centre" style={{ color: '#64748b', textDecoration: 'underline' }}>
                No thanks, take me to my dashboard
              </Link>
            </p>
          </div>
        </div>

        <div className="content-section" style={{ background: '#f8fafc', marginTop: '2rem', borderRadius: '12px', padding: '2rem' }}>
          <h3 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Don't Miss This Opportunity
          </h3>
          
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              This is your chance to experience the full power of our Pro Reseller program without any initial investment. 
              Use these 3 months to build your business and start earning higher commissions.
            </p>
            <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: 0, lineHeight: 1.7 }}>
              After the free period, you'll continue at our regular Pro Reseller rate of $97/month, 
              but by then, you'll have already started earning more with the premium tools and higher commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 