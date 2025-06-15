import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../pages.css';
import { FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Reseller() {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Helper to get referrer from URL or localStorage
  const getReferrer = () => {
    const params = new URLSearchParams(location.search);
    return params.get('ref') || localStorage.getItem('referrer') || null;
  };

  // Handler for all main CTAs
  const handleResellerCheckout = async () => {
    setLoading(true);
    try {
      const referrer_username = getReferrer();
      const response = await fetch('/create-reseller-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer_username }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
    setLoading(false);
  };

  return (
    <div className="home">
      <style>{`
        .home::before {
          display: none !important;
        }
        .hero-title, .hero-subtitle {
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: unset !important;
          color: #1e293b !important;
          opacity: 1 !important;
        }
        .hero-subtitle {
          color: #374151 !important;
        }
      `}</style>
      <Navbar />
      {/* Hero Section */}
      <section className="hero" style={{ background: 'none', paddingBottom: 0 }}>
        <h1 className="reseller-hero-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#1e293b', background: 'none', WebkitBackgroundClip: 'unset', WebkitTextFillColor: 'unset', textAlign: 'center' }}>
          Own Your Income: Earn Monthly PayPal Payments with 100% Reseller Rights!
        </h1>
        <p className="reseller-hero-subtitle" style={{ fontSize: '1.25rem', color: '#374151', fontWeight: 500, textAlign: 'center', marginBottom: '1.5rem' }}>
          <b>Hands-Free Income:</b> Get $47/month per referral sent straight to PayPal—no tech, no hassle.
        </p>
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <div style={{display: 'inline-block', background: '#fef9c3', color: '#166534', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.5rem'}}>Limited spots available! Secure your spot now.</div>
          <br />
          <div style={{ marginBottom: '0.5rem', fontWeight: 500, color: '#0f766e' }}>
            Trusted by 1,000+ Resellers Earning Monthly
          </div>
          <Link to="/register" className="cta-button" aria-label="Join the Reseller Program and Start Earning Now">
            Claim Your Spot — Start Earning Today
          </Link>
          <div style={{marginTop: '0.75rem'}}>
            <img src="/assets/icons/paypal-trust-badge.png" alt="PayPal Trusted" style={{height: 32}} />
          </div>
        </div>
        <div className="container">
          <div className="hero-flex" style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="hero-main" style={{ flex: 1, minWidth: 280 }}>
              <div className="content-section" style={{ background: 'white', marginTop: '1.5rem', marginBottom: 0 }}>
                <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
                  Create Your Account for Instant Access to:
                </h3>
                <ul className="checkmark-list">
                  <li><FaCheckCircle className="checkmark" /> <b>Powerful Lead Generation Tools:</b> Gain access to high-converting Lead Magnets, Email Indoctrination Series, and a 12-Month Email Course, specifically designed to attract and retain your audience.</li>
                  <li><FaCheckCircle className="checkmark" /> <b>Guaranteed Monthly Earnings:</b> Earn a steady $47/month for every referral to our membership, with 100% commission sent directly to your PayPal account.</li>
                  <li><FaCheckCircle className="checkmark" /> <b>Comprehensive Marketing Education:</b> Receive our exclusive "Unlock Your Marketing Potential" Manual, teaching you to craft irresistible hooks, captivating campaigns, and high-converting offers.</li>
                </ul>
              </div>
            </div>
            <div className="hero-testimonial" style={{ flex: 1, minWidth: 320, maxWidth: 420 }}>
              <div style={{ background: '#f8fafc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem', marginTop: '1.5rem' }}>
                <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Martin Avis</div>
                <div style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>
                  I'm not much of a membership site joiner or promoter, but I decided to take a look at this one. I don't promote anything to my list that I am not certain is great value, so I took the time to study the contents and make up my own mind.<br /><br />
                  It is all good – and more importantly there is stuff inside that I can learn from myself, as well as make money by reselling – and so I had no problem letting my readers know about it yesterday. <span style={{ background: '#fffde7', color: '#1e293b', fontWeight: 600 }}>So far I've made over 20 sales - and it is very early days yet.</span>
                </div>
                <div style={{ background: '#fef9c3', color: '#166534', fontWeight: 700, padding: '0.75rem 1rem', borderRadius: '6px' }}>
                  That's a residual income of more than $940 so far
                </div>
                <div style={{ fontSize: '0.95rem', color: '#374151', marginTop: '0.75rem' }}>
                  and a very nice injection of immediate cash from the OTOs.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      <div className="container">
        <div className="content-section" style={{ background: 'white', marginTop: '-2rem' }}>
          <h2 style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Ready To Enjoy Hands-Free Earnings? Join the Reseller Program Today……
          </h2>
          <h3 style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
            Create Your Account for Instant Access to:
          </h3>
          <ul className="checkmark-list">
            <li><FaCheckCircle className="checkmark" /> <b>Powerful Lead Generation Tools:</b> Gain access to high-converting Lead Magnets, Email Indoctrination Series, and a 12-Month Email Course, specifically designed to attract and retain your audience.</li>
            <li><FaCheckCircle className="checkmark" /> <b>Guaranteed Monthly Earnings:</b> Earn a steady $47/month for every referral to our membership, with 100% commission sent directly to your PayPal account.</li>
            <li><FaCheckCircle className="checkmark" /> <b>Comprehensive Marketing Education:</b> Receive our exclusive "Unlock Your Marketing Potential" Manual, teaching you to craft irresistible hooks, captivating campaigns, and high-converting offers.</li>
          </ul>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              className="cta-button"
              aria-label="Join the Reseller Program and Start Earning Now"
              onClick={handleResellerCheckout}
              disabled={loading}
            >
              {loading ? 'Redirecting…' : 'Claim Your Spot — Start Earning Today'}
            </button>
          </div>
        </div>
      </div>
       {/* Reseller Stats Section 1 */}
       <section className="stats-section" style={{ background: '#f8fafc', padding: '2.5rem 0 1rem 0' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span role="img" aria-label="Lead Generation" style={{ fontSize: '2rem', color: '#2563eb' }}>🔗</span>
              <div className="stat-number">10+ Lead Generation Tools</div>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="Earnings" style={{ fontSize: '2rem', color: '#059669' }}>💸</span>
              <div className="stat-number">$47 Per Referral - Paid Monthly</div>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="Traffic" style={{ fontSize: '2rem', color: '#f59e42' }}>🚦</span>
              <div className="stat-number">Expert Traffic Strategies</div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Testimonial Section */}
      <section className="testimonials-section" style={{ background: 'none', paddingTop: 0 }}>
        <div className="container">
          <div style={{ maxWidth: 500, margin: '0 auto', background: '#f8fafc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem', marginTop: '2rem' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Martin Avis</div>
            <div style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>
              I'm not much of a membership site joiner or promoter, but I decided to take a look at this one. I don't promote anything to my list that I am not certain is great value, so I took the time to study the contents and make up my own mind.<br /><br />
              It is all good – and more importantly there is stuff inside that I can learn from myself, as well as make money by reselling – and so I had no problem letting my readers know about it yesterday. <span style={{ background: '#fffde7', color: '#1e293b', fontWeight: 600 }}>So far I've made over 20 sales - and it is very early days yet.</span>
            </div>
            <div style={{ background: '#fef9c3', color: '#166534', fontWeight: 700, padding: '0.75rem 1rem', borderRadius: '6px' }}>
              That's a residual income of more than $940 so far
            </div>
            <div style={{ fontSize: '0.95rem', color: '#374151', marginTop: '0.75rem' }}>
              and a very nice injection of immediate cash from the OTOs.
            </div>
          </div>
        </div>
      </section>
      {/* Reseller Stats Section 2 */}
      <section className="stats-section" style={{ background: '#f8fafc', padding: '2.5rem 0 1rem 0' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span role="img" aria-label="No Scripts" style={{ fontSize: '2rem', color: '#e11d48' }}>❌</span>
              <div className="stat-number">No Membership Scripts</div>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="No Updating" style={{ fontSize: '2rem', color: '#6366f1' }}>🔄</span>
              <div className="stat-number">No Updating Content</div>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="No Managing" style={{ fontSize: '2rem', color: '#fbbf24' }}>🙅‍♂️</span>
              <div className="stat-number">No Managing Members</div>
            </div>
          </div>
        </div>
      </section>


      {/* Additional Content Section */}
      <section className="reseller-extra-section" style={{ background: '#f8fafc', padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem', marginBottom: '2rem' }}>
          <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Ever wanted to <b>run your own premium membership site</b>, but just didn't have the motivation to keep it updated every month with fresh, new content? I understand your dilemma…
          </p>
          <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            It really is difficult to keep a membership site updated and active, every single month. Not only that, but you need to spend the time to actively promote it so you can reap the rewards from your monthly efforts.
          </p>
          <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Needless to say, while running a membership site is extremely profitable and is just about the closest thing to a "reliable income" in the Internet Marketing field (since you get paid monthly like clockwork), <b>it demands a lot of your time and energy.</b>
          </p>
          <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Time and energy that you probably don't have.
          </p>
          <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            So, many people turn to trying to promote monthly memberships as an affiliate. There's three huge problems with that…
          </p>
          <ol style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '1rem' }}><b>There is a huge lack of memberships out there with affiliate programs.</b> I dare you to find 10 high quality memberships with affiliate programs that pay you monthly in less than 2 hours. I seriously doubt you'll be able to do it.</li>
            <li style={{ marginBottom: '1rem' }}><b>Despite the fact you get paid monthly, you don't get paid much.</b> These programs charge $30 or more per month and you end up getting something like 30% of the commission. That means you make $10 per month on a $30 per month program.</li>
            <li style={{ marginBottom: '1rem' }}><b>There's a huge number of dropouts with most memberships.</b> This is the one thing that most marketers won't admit. People drop out of memberships like flies, most of the time. That means your efforts are wasted.</li>
          </ol>
          <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: 0, lineHeight: 1.7 }}>
              I have thought of a solution that benefits everyone, though...you won't have to update the membership site at all, you get to keep all of the profits, and I'll even help you retain the members you drive to the site.<br /><br />
              In other words, a membership site that is completely autopilot for you - literally. You don't upload anything, you don't update, you don't even have to look at the site. You just drive customers, and you get paid every penny.<br /><br />
So for example if you were to send just 10 people to the site, $470 would be added to your income every month, send 50 people to the site and that monthly figure rises to $2,350, send 100 people to the site and you're almost at the $5k/month milestone etc. The more you promote the site, the more your MONTHLY revenue will be (you won't be getting one-off payments, you'll be getting paid every month)
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '2rem' }}>
            <p style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: 0, lineHeight: 1.7 }}>
              So...How would you like the ability to resell this site, my $47.00 per month membership about making money online, for 100% commissions every single month? If so, listen up...<br /><br />
              My team and I built this site as the ultimate resource for infopreneurs, seasoned and beginner alike, to have access to all of the newest videos, info products, workshops, and software packages, available month after month after month. The site is updated with new content EVERY DAY!<br /><br />
              The whole system works very well so when you refer someone to the site - they STAY subscribed!<br /><br />
              <span style={{ background: '#fef9c3', color: '#166534', fontWeight: 700, padding: '0.5rem 0.75rem', borderRadius: '6px' }}>-- Which simply means more money for you each month.</span>
            </p>
          </div>
        </div>
        {/* Reseller Stats Section 3 */}
      <section className="stats-section" style={{ background: '#f8fafc', padding: '2.5rem 0 1rem 0' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span role="img" aria-label="No Software" style={{ fontSize: '2rem', color: '#0ea5e9' }}>🛠️</span>
              <div className="stat-number">No Maintaining Software</div>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="No Copy" style={{ fontSize: '2rem', color: '#a21caf' }}>✍️</span>
              <div className="stat-number">No Writing Any Sales Copy</div>
            </div>
            <div className="stat-card">
              <span role="img" aria-label="No Hosting" style={{ fontSize: '2rem', color: '#64748b' }}>🌐</span>
              <div className="stat-number">No Hosting</div>
            </div>
          </div>
        </div>
      </section>

        {/* Reseller Toolkit Cards Section */}
        <section className="stats-section" style={{ background: 'none', padding: '3rem 0 1rem 0' }}>
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <img src="/assets/images/images/Membership-Mastery.png" alt="Membership Mastery" style={{ width: '100%', maxWidth: 180, margin: '0 auto 1rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
                <div className="stat-number" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Membership Mastery</div>
                <p className="stat-label">The ultimate guide to creating a thriving membership site from scratch and monetizing it!</p>
              </div>
              <div className="stat-card">
                <img src="/assets/images/images/Marketing-Potential-book.png" alt="Unlock Your Marketing Potential" style={{ width: '100%', maxWidth: 180, margin: '0 auto 1rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
                <div className="stat-number" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Unlock Your Marketing Potential</div>
                <p className="stat-label">Learn how to create high-converting lead magnets, landing pages, and snappy headlines.</p>
              </div>
              <div className="stat-card">
                <img src="/assets/images/images/Power-of-traffic-book.png" alt="Unleash the Power of Traffic" style={{ width: '100%', maxWidth: 180, margin: '0 auto 1rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
                <div className="stat-number" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Unleash the Power of Traffic</div>
                <p className="stat-label">Drive visitors to your landing page without Google and grow your audience fast.</p>
              </div>
              <div className="stat-card">
                <img src="/assets/images/images/DMD-book.png" alt="Digital Marketing Domination" style={{ width: '100%', maxWidth: 180, margin: '0 auto 1rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
                <div className="stat-number" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Digital Marketing Domination</div>
                <p className="stat-label">Learn how to create high-converting lead magnets, landing pages, and snappy headlines.</p>
              </div>
              <div className="stat-card">
                <img src="/assets/images/images/Social-Media-book.png" alt="Social Media Marketing" style={{ width: '100%', maxWidth: 180, margin: '0 auto 1rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
                <div className="stat-number" style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Social Media Marketing</div>
                <p className="stat-label">Master the art of growing your audience on platforms like Instagram, TikTok, and Facebook using proven social media growth hacks and automation tools.</p>
              </div>
            </div>
            <div>
              <h1>Get Three Months for the Price of One</h1>
              <p>
                So, you're thinking about joining our Reseller Program. Great! But let's cut to the chase. We're not here to woo you with the promise of dancing unicorns or a lifetime supply of tacos. Instead, we've got a deal that's as smooth as a buttered-up otter sliding down a rainbow.
                {/* ...rest of the promo content... */}
              </p>
            </div>
            <button
              className="cta-button"
              aria-label="Join the Reseller Program and Start Earning Now"
              onClick={handleResellerCheckout}
              disabled={loading}
            >
              {loading ? 'Redirecting…' : 'Claim Your Spot — Start Earning Today'}
            </button>
            <div>
              <h1>Still on the fence? Read what other Resellers have to say about the program...</h1>
            </div>
          </div>
        </section>
      </section>
      {/* Reviews Section */}
      <div className="container">
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"The Reseller Program is a total game-changer! I made my first $500 in less than a week. The tools and support are top-notch."</p>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Jessica Lee</h4>
                <p>Online Entrepreneur</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"I love how hands-off everything is. No tech headaches, just pure profit. Highly recommend to anyone looking for passive income!"</p>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Mike Johnson</h4>
                <p>Affiliate Marketer</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"The 3-month deal is insane value. I brought in 15 members and kept every penny. This is the easiest recurring income I've ever made."</p>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Sara Patel</h4>
                <p>Side Hustler</p>
              </div>
            </div>
          </div>
          {showAllReviews && (
            <>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"I was skeptical at first, but the results speak for themselves. The support team is always there to help. 10/10!"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>David Kim</h4>
                    <p>Digital Marketer</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"No content to update, no members to manage, just pure commissions. This is the future of online income."</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>Linda Garcia</h4>
                    <p>Work-from-Home Mom</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"I made more in my first month than I did in three months with other programs. The 100% commissions are real!"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>Chris Evans</h4>
                    <p>Solopreneur</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="show-more-container">
          <button 
            className="show-more-button"
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? 'Show Less' : 'Show More Reviews'}
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="faq-section" style={{ padding: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Frequently Asked Questions</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}><b>Do I need to build a website?</b> Nope! We provide the complete system—just drive traffic.</li>
          <li style={{ marginBottom: '1rem' }}><b>How do I get paid?</b> Payments are sent directly to your PayPal every month like clockwork.</li>
          <li style={{ marginBottom: '1rem' }}><b>Do I need any tech experience?</b> None. Everything is already set up and managed for you.</li>
        </ul>
      </section>
    </div>
  );
} 