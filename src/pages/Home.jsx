import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import ReferralTracker from '../components/ReferralTracker.js';
import { FaRocket, FaChartLine, FaUsers, FaHeadset, FaCheckCircle, FaStar, FaGraduationCap, FaHandshake, FaBook } from 'react-icons/fa';
import { MdDashboard, MdInventory, MdPeople } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const { user } = useAuth();

  return (
    <div className="home">
      <ReferralTracker />
      <Navbar />
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h1 className="hero-title">
            Marketing Is Complicated...
            <span style={{ display: 'block' }}>Revenue Ripple Makes It Easy.</span>
          </h1>
          
          <p className="hero-subtitle">
            As a Member You'll Get Instant Access To The Walkthroughs, "Watch Over Our Shoulder" Videos, Trainings, and Support You Need TO GET MARKETING DONE.
          </p>
          
          <div style={{ marginTop: '2rem' }}>
            {!user && (
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary">Get Started</Link>
                <Link to="/courses" className="btn btn-secondary">View Courses</Link>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div className="content-text">
              <h2>Ready To Get Started To Make Marketing Easy?</h2>
              <h3>Create Your Account for Instant Access to:</h3>
              <ul className="checkmark-list">
                <li><FaCheckCircle className="checkmark" /> 46 comprehensive marketing tutorials and 25 expert-led video courses, continuously updated to stay ahead of the curve.</li>
                <li><FaCheckCircle className="checkmark" /> A members-only affiliate program, empowering you to earn as you learn.</li>
                <li><FaCheckCircle className="checkmark" /> Dedicated support from our experienced team, always on hand to address your queries and guide your growth.</li>
                <li><FaCheckCircle className="checkmark" /> PLUS, stay competitive with access to a growing library of marketing resources, tailored to help you achieve success in today's ever-evolving landscape.</li>
              </ul>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/checkout" className="cta-button">
                  <FaHandshake style={{ marginRight: '8px' }} />
                  Join Now for Only $47/month
                </Link>
              </div>
            </div>
            <div className="content-image">
              <img 
                src="/assets/images/images/rev-rip-device.png" 
                alt="Revenue Ripple Platform" 
                className="device-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.section 
        className="stats-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <FaBook className="stat-icon" />
              <div className="stat-number">Step-By-Step</div>
              <p className="stat-label">Playbooks</p>
              <Link to="/playbooks" className="stat-cta">Explore Playbooks</Link>
            </div>
            <div className="stat-card">
              <FaGraduationCap className="stat-icon" />
              <div className="stat-number">Up-To-Date</div>
              <p className="stat-label">Trainings</p>
              <Link to="/training" className="stat-cta">Start Learning</Link>
            </div>
            <div className="stat-card">
              <FaHeadset className="stat-icon" />
              <div className="stat-number">All Your</div>
              <p className="stat-label">Questions Answered</p>
              <Link to="/support" className="stat-cta">Get Support</Link>
            </div>
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <div className="stat-number">500+</div>
              <p className="stat-label">Active Users</p>
              <Link to="/community" className="stat-cta">Join Community</Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Courses Section */}
      <motion.section 
        className="courses-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">Benefits of Membership</h2>
          <hr />
          <h1 className="section-title">25 Expert-Led Video Courses
          That GET STUFF DONE</h1>
          <div className="courses-grid">
            <h2 className="course-category-title">Foundational Skills</h2>
            {/* Website Design Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/4.png" alt="Website Design Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Website Design</h3>
                <p className="course-description">
                  Looking to create an effective website for your business? Our Website Design course has got you covered. From choosing the right layout and color scheme to optimizing your website for search engines, we'll provide you with the skills and knowledge you need to create a professional and effective website that represents your brand.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
                <Link to="/courses/website-design" className="course-cta">Preview Course</Link>
              </div>
            </div>

            {/* Social Media Marketing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/3.png" alt="Social Media Marketing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Social Media Marketing</h3>
                <p className="course-description">
                  Wanna know how to market your business on social media like a pro? Our Social Media Marketing course will teach you how to create engaging content, optimize your profiles, and connect with your target audience on all the major social media platforms, including Facebook, Instagram, Twitter, and Youtube.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Email Marketing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/6.png" alt="Email Marketing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Email Marketing</h3>
                <p className="course-description">
                  Looking to boost your revenue with email marketing? Our Email Marketing course covers the essentials of email platform basics, content creation, and automation techniques that will help you create effective email campaigns that engage and convert your audience.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* SEO Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/7.png" alt="SEO Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">SEO</h3>
                <p className="course-description">
                  Master the art of data-driven decision making. Learn how to track, analyze, and interpret key metrics across all your marketing channels to optimize your campaigns and maximize ROI.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* E-commerce Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/8.png" alt="E-commerce Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">E-commerce</h3>
                <p className="course-description">
                  Build and optimize your online store for maximum conversions. Learn essential e-commerce strategies, from product page optimization to checkout flow improvements and customer retention tactics.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            <h2 className="course-category-title">Revenue Drivers</h2>
            {/* Affiliate Marketing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/2.png" alt="Affiliate Marketing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Affiliate Marketing</h3>
                <p className="course-description">
                  Transform your online presence into a revenue-generating machine. Discover proven monetization strategies, from digital products to subscription models, and implement them in your business.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Paid Traffic Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/10.png" alt="Paid Traffic Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Paid Traffic</h3>
                <p className="course-description">
                  Looking to drive more traffic to your website through paid advertising? Our Paid Traffic course will teach you how to set up and optimize your ad campaigns on all the major advertising platforms, including Google Ads and Facebook Ads.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Funnel Building Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/1.png" alt="Funnel Building Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Funnel Building</h3>
                <p className="course-description">
                  Want to maximize your sales? Our Funnel Building course will teach you how to create effective sales funnels that convert your audience into customers. From creating high-converting landing pages to optimizing your upsell and downsell offers, we'll cover all the essential elements of funnel building.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Freelancing Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/5.png" alt="Freelancing Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Freelancing</h3>
                <p className="course-description">
                  Looking to become a successful freelancer? Our Freelancing course covers everything you need to know to start and grow your own freelancing business, from finding clients to setting your rates and building a portfolio.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Marketing Automation Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/12.png" alt="Marketing Automation Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Marketing Automation</h3>
                <p className="course-description">
                  Ready to save time and streamline your marketing efforts? Our Marketing Automation course teaches you how to automate your marketing processes using the latest tools and techniques, so that you can focus on what you do best - growing your business.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* Online Learning Course */}
            <div className="course-card">
              <div className="course-image">
                <img src="/assets/images/images/11.png" alt="Online Learning Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Online Learning</h3>
                <p className="course-description">
                  Learn how to create and sell your own online course with our course. We'll teach you everything you need to know, from choosing the right topic to creating engaging content and marketing your course effectively. With our Online Learning course, turn your expertise into profit.
                </p>
                <div className="course-pricing">
                  <p className="retail-price">Retail Price: <span className="strikethrough">$197</span></p>
                  <p className="membership-status">Included with Membership</p>
                </div>
              </div>
            </div>

            {/* More Courses Summary */}
            <div className="course-card summary-card">
              <div className="course-image">
                <img src="/public/assets/images/images/courses-preview.png" alt="Online Learning Course" />
              </div>
              <div className="course-content">
                <h3 className="course-title">Plus 14 More Courses Inside</h3>
                <div className="course-pricing">
                  <p className="retail-price">Total Retail Value: <span className="strikethrough">$2,758</span></p>
                  <p className="membership-status">All Included with Membership</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Affiliate Program Section */}
      <motion.section 
        className="affiliate-program-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">The Revenue Ripple Affiliate Program</h2>
          <h3 className="section-subtitle">(Unlock a World of Earning Potential—Faster Than You Can Say 'Cha-Ching')</h3>
          
          <div className="affiliate-content">
            <div className="affiliate-text">
              <p className="affiliate-description">
                Whether you're just getting started or already know your way around funnels and tracking links, our members-only affiliate program is built to help you win. It's stacked with tools, training, and proven resources to help you start earning fast—no fluff, just what works.
              </p>
              <Link to="/affiliate-program" className="affiliate-cta">Learn More About Affiliate Program</Link>
            </div>

            <div className="affiliate-image">
              <img 
                src="/public/assets/images/images/ebook-explosion.png" 
                alt="Affiliate Program Materials" 
                className="responsive-image"
              />
            </div>

            <div className="affiliate-text">
              <p className="affiliate-description">
                You'll get access to lead magnets, landing pages, promo scripts, and full walkthroughs so you're never guessing what to do next. We're even dropping exclusive digital books and templates in the mix—because we're not just teaching you how to make money, we're handing you the blueprint.
              </p>
              <div className="affiliate-visual-highlight">
                <img src="/assets/images/images/affiliate-dashboard-preview.png" alt="Affiliate Dashboard Preview" className="responsive-image" />
                <p className="caption">Real dashboard. Real payouts. Real growth.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* What is Revenue Ripple Section */}
      <motion.section 
        className="what-is-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">WHAT IS REVENUE RIPPLE?</h2>
          <p className="what-is-description">
            Whether you're a beginner looking for a place to start or a seasoned marketer looking to uplevel 
            your skills, Revenue Ripple has everything you need to get marketing DONE. Our platform is like 
            a personal coach, but without the awkward eye contact. We offer 46 comprehensive marketing 
            tutorials, 25 expert-led video courses, and a growing library of resources to help you stay ahead 
            of the curve. Plus, our exclusive affiliate program means you can earn while you learn and turn 
            your marketing skills into profit! And our experienced team is always here to support you, like having a mentor in your pocket—minus the awkward small talk. Revenue Ripple truly is an unfair advantage for any 
            marketer. So why wait? Join today and take your marketing game to the next level!
          </p>
          <div className="workspace-image">
            <img src="/assets/images/images/rev-rip-pic.png" alt="Clean modern workspace with Revenue Ripple platform" />
          </div>
          <div className="what-is-cta-container">
            <Link to="/pricing" className="what-is-cta primary">View Pricing Plans</Link>
            <Link to="/demo" className="what-is-cta secondary">Request Demo</Link>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">What Our Members Say</h2>
          <div className="testimonials-grid">
            {/* Initial testimonials that are always shown */}
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates since implementing their strategies."</p>
              <div className="testimonial-author">
                <img src="/public/assets/images/images/profile-pic1.png" alt="Profile of Sarah Johnson" className="testimonial-avatar" />
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Digital Marketing Consultant</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"The ROI from implementing Revenue Ripple's strategies has been incredible. Their step-by-step approach made complex marketing concepts easy to understand and implement."</p>
              <div className="testimonial-author">
                <img src="/public/assets/images/images/profile-pic2.png" alt="Profile of Michael Chen" className="testimonial-avatar" />
                <div className="author-info">
                  <h4>Gloria Chen</h4>
                  <p>E-commerce Entrepreneur</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"As a beginner in digital marketing, I was overwhelmed until I found Revenue Ripple. Their platform gave me the confidence and skills I needed to launch my own agency."</p>
              <div className="testimonial-author">
                <img src="/public/assets/images/images/profile-pic3.png" alt="Profile of Paul Rodriguez" className="testimonial-avatar" />
                <div className="author-info">
                  <h4>Paul Rodriguez</h4>
                  <p>Agency Founder</p>
                </div>
              </div>
            </div>

            {showAllTestimonials && (
              <>
                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The affiliate program is a game-changer! Not only am I learning valuable skills, but I'm also earning while implementing what I learn. It's a win-win situation."</p>
                  <div className="testimonial-author">
                    <img src="/public/assets/images/images/profile-pic4.png" alt="Profile of David Thompson" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>David Thompson</h4>
                      <p>Affiliate Marketer</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The support team is incredible! They're always there to help and the community is so encouraging. It's like having a marketing family that wants you to succeed."</p>
                  <div className="testimonial-author">
                    <img src="/public/assets/images/images/profile-pic5.png" alt="Profile of Adin Parker" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>Adin Parker</h4>
                      <p>Small Business Owner</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The video courses are pure gold! Each lesson is packed with actionable insights that I could implement immediately. My social media engagement has tripled!"</p>
                  <div className="testimonial-author">
                    <img src="/public/assets/images/images/profile-pic6.png" alt="Profile of James Wilson" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>James Wilson</h4>
                      <p>Social Media Manager</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"I love how the platform keeps updating with new content and strategies. It helps me stay ahead of the curve in this fast-paced digital marketing world."</p>
                  <div className="testimonial-author">
                    <img src="/public/assets/images/images/profile-pic7.png" alt="Profile of Nina Patel" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>Nina Patel</h4>
                      <p>Marketing Director</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The ROI tracking templates and analytics tutorials helped me prove the value of my marketing efforts to clients. My retainer rates have doubled!"</p>
                  <div className="testimonial-author">
                    <img src="/public/assets/images/images/profile-pic8.png" alt="Profile of Alex Foster" className="testimonial-avatar" />
                    <div className="author-info">
                      <h4>Alex Foster</h4>
                      <p>Marketing Analytics Specialist</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="show-more-container">
            <button 
              className="show-more-button"
              onClick={() => setShowAllTestimonials(!showAllTestimonials)}
            >
              {showAllTestimonials ? 'Show Less' : 'Show More Reviews'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* No Free Trial Section */}
      <motion.section 
        className="no-free-trial-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">No Free Trial?</h2>
          <h3>What about a guarantee?</h3>
          <p className="no-free-trial-description">
            Free trials are cool in theory—until you're left with nothing but an expired login and the sour aftertaste of wasted time. We don't do the whole "test drive" thing over here. Why? Because growth doesn't come from dabbling—it comes from committing.

            At Revenue Ripple, we're not trying to attract tire-kickers or fence-sitters. We're looking for the go-getters, the doers, the ones ready to make moves and invest in themselves. When you put real skin in the game, that's when real results show up.

            Now, don't get it twisted—we're not heartless. That's why we back it up with a 30-day money-back guarantee. If it's not for you or doesn't deliver what you expected, no hard feelings. We'll refund you, no questions asked. It's like going on a first date, realizing we're not your type, and still parting ways with respect (and maybe a follow on Instagram).

            So if you're ready to level up, we've got your back—and your wallet—covered.

            Access Revenue Ripple Today.
          </p>
          <div className="no-free-trial-cta">
            <Link to="/checkout" className="cta-button">
              Join Now for Only $47/month
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        className="final-cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="section-title">Ready to Transform Your Marketing?</h2>
          <p className="cta-description">
            Join thousands of successful marketers who have already transformed their businesses with Revenue Ripple.
            Start your journey today and get instant access to all our premium features.
          </p>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/checkout" className="cta-button">
              Join Now for Only $47/month
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}