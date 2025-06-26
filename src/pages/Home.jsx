import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import ReferralTracker from '../components/ReferralTracker.js';
import { FaRocket, FaChartLine, FaUsers, FaHeadset, FaCheckCircle, FaStar, FaGraduationCap, FaHandshake, FaBook, FaQuoteLeft, FaRobot, FaBrain, FaCode } from 'react-icons/fa';
import { MdDashboard, MdInventory, MdPeople } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

// Enhanced components
import AnimatedNavbar from '../components/enhanced/AnimatedNavbar';
import { MotionCard } from '../components/enhanced/MotionCard';
import { MotionButton } from '../components/enhanced/MotionButton';
import { AnimatedSection } from '../components/enhanced/AnimatedSection';
import { ParallaxText } from '../components/enhanced/ParallaxText';
import { BackgroundPattern, GlowOrb } from '../components/enhanced/FloatingElements';
import { StatsGrid } from '../components/enhanced/StatsGrid';

import './Home.css';

export default function Home() {
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const { user } = useAuth();
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Stats data for the enhanced stats grid
  const statsData = [
    {
      icon: FaBook,
      number: "Step-By-Step",
      label: "Playbooks",
      description: { text: "Explore Playbooks", link: "/playbooks" },
      isString: true
    },
    {
      icon: FaGraduationCap,
      number: "Up-To-Date",
      label: "Trainings",
      description: { text: "Start Learning", link: "/training" },
      isString: true
    },
    {
      icon: FaHeadset,
      number: "All Your",
      label: "Questions Answered",
      description: { text: "Get Support", link: "/support" },
      isString: true
    },
    {
      icon: FaUsers,
      number: "500+",
      label: "Active Users",
      description: { text: "Join Community", link: "/community" },
      isString: false
    }
  ];

  useEffect(() => {
    // Debug environment variables
    console.log('Environment Variables:', {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
    });
  }, []);

  return (
    <div className="home overflow-hidden">
      <ReferralTracker />
      <AnimatedNavbar />
      
      {/* Enhanced Hero Section */}
      <BackgroundPattern className="min-h-screen">
        <motion.section 
          ref={heroRef}
          className="hero relative pt-20 pb-16"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <GlowOrb className="-top-32 -right-32" size="large" />
          <GlowOrb className="-bottom-32 -left-32" size="medium" />
          
          <div className="container relative z-10">
            <AnimatedSection direction="up" stagger={true}>
              <ParallaxText className="text-center mb-8">
                <motion.h1 
                  className="hero-title text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Marketing Is Complicated...
                  <motion.span 
                    className="block text-blue-600"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    Revenue Ripple Makes It Easy.
                  </motion.span>
                </motion.h1>
              </ParallaxText>
              
              <motion.p 
                className="hero-subtitle text-xl text-gray-600 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                As a Member You'll Get Instant Access To The Walkthroughs, "Watch Over Our Shoulder" Videos, Trainings, and Support You Need TO GET MARKETING DONE.
              </motion.p>
              
              {!user && (
                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <MotionButton
                    as={Link}
                    to="/checkout"
                    variant="primary"
                    magnetic={true}
                    glow={true}
                    className="text-lg px-8 py-4"
                  >
                    <FaRocket className="mr-2" />
                    Begin Checkout - $47/month
                  </MotionButton>
                </motion.div>
              )}
            </AnimatedSection>
          </div>
        </motion.section>
      </BackgroundPattern>

      {/* Enhanced Content Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <AnimatedSection direction="left">
              <div className="content-text">
                <motion.h2 
                  className="text-4xl font-bold text-gray-900 mb-6"
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.8 }}
                >
                  Ready To Get Started To Make Marketing Easy?
                </motion.h2>
                <motion.h3 
                  className="text-2xl font-semibold text-blue-600 mb-8"
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Create Your Account for Instant Access to:
                </motion.h3>
                
                <motion.ul 
                  className="space-y-6 mb-8"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                    }
                  }}
                  initial="hidden"
                  whileInView="visible"
                >
                  {[
                    "46 comprehensive marketing tutorials and 25 expert-led video courses, continuously updated to stay ahead of the curve.",
                    "A members-only affiliate program, empowering you to earn as you learn.",
                    "Dedicated support from our experienced team, always on hand to address your queries and guide your growth.",
                    "PLUS, stay competitive with access to a growing library of marketing resources, tailored to help you achieve success in today's ever-evolving landscape."
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaCheckCircle className="text-blue-600 mr-4 mt-1 flex-shrink-0" />
                      </motion.div>
                      <span className="text-gray-700 text-lg leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <MotionButton
                    as={Link}
                    to="/checkout"
                    variant="primary"
                    magnetic={true}
                    glow={true}
                    className="text-lg px-8 py-4"
                  >
                    <FaHandshake className="mr-2" />
                    Join Now for Only $47/month
                  </MotionButton>
                </motion.div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection direction="right">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img 
                  src="/assets/images/images/rev-rip-device.png" 
                  alt="Revenue Ripple Platform" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  whileInView={{ 
                    opacity: 1,
                    rotateY: 0,
                    scale: 1
                  }}
                  initial={{ 
                    opacity: 0,
                    rotateY: -15,
                    scale: 0.9
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl pointer-events-none" />
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Join Thousands of Successful Marketers</h2>
            <p className="text-xl text-blue-100">See what makes Revenue Ripple the go-to platform for marketing success</p>
          </motion.div>
          <StatsGrid stats={statsData} />
        </div>
      </section>

      {/* Enhanced Courses Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Benefits of Membership</h2>
            <h1 className="text-4xl font-bold text-gray-900 mb-8">25+ Expert-Led Video Courses<br />That GET STUFF DONE</h1>
          </motion.div>
          <AnimatedSection>
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
                <img src="/assets/images/images/courses-preview.png" alt="Online Learning Course" />
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
          </AnimatedSection>
        </div>
      </section>

      {/* Enhanced AI Education Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container">
          <AnimatedSection>
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6 }}
              >
                AI-Powered Marketing Education
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Learn to leverage AI for unprecedented marketing success
              </motion.p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: FaRobot,
                  title: "AI Fundamentals",
                  description: "Master the basics of AI and machine learning. Learn how to use AI tools to automate tasks, analyze data, and make data-driven decisions that drive real results."
                },
                {
                  icon: FaBrain,
                  title: "Prompt Engineering",
                  description: "Learn to craft effective prompts that get the best results from AI tools. Create compelling content, generate ideas, and optimize your marketing copy with precision."
                },
                {
                  icon: FaCode,
                  title: "AI Automation",
                  description: "Discover how to automate your marketing workflows with AI. Save time, reduce errors, and scale your marketing efforts efficiently with cutting-edge tools."
                }
              ].map((feature, index) => (
                <MotionCard 
                  key={index}
                  delay={index * 0.2}
                  className="p-8 text-center hover:shadow-2xl"
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="w-10 h-10 text-blue-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </MotionCard>
              ))}
            </div>

            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <MotionButton
                as={Link}
                to="/checkout"
                variant="primary"
                magnetic={true}
                glow={true}
                className="text-lg px-10 py-4"
              >
                <FaRocket className="mr-2" />
                Begin Checkout - $47/month
              </MotionButton>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

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
                src="/assets/images/images/ebook-explosion.png" 
                alt="Affiliate Program Materials" 
                className="responsive-image"
              />
            </div>

            <div className="affiliate-text">
              <p className="affiliate-description">
                You'll get access to lead magnets, landing pages, promo scripts, and full walkthroughs so you're never guessing what to do next. We're even dropping exclusive digital books and templates in the mix—because we're not just teaching you how to make money, we're handing you the blueprint.
              </p>
              <div className="affiliate-visual-highlight">
                <img src="/assets/images/images/Affilate-reseller-earnings-dash.png" alt="Affiliate Dashboard Preview" className="responsive-image" />
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

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Members Say</h2>
            <p className="text-xl text-gray-600">Real results from real marketers</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Digital Marketing Consultant",
                content: "Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates since implementing their strategies.",
                image: "/assets/images/images/profile-pic1.png",
                stars: 5
              },
              {
                name: "Gloria Chen",
                role: "E-commerce Entrepreneur",
                content: "The ROI from implementing Revenue Ripple's strategies has been incredible. Their step-by-step approach made complex marketing concepts easy to understand and implement.",
                image: "/assets/images/images/profile-pic2.png",
                stars: 5
              },
              {
                name: "Paul Rodriguez",
                role: "Agency Founder",
                content: "As a beginner in digital marketing, I was overwhelmed until I found Revenue Ripple. Their platform gave me the confidence and skills I needed to launch my own agency.",
                image: "/assets/images/images/profile-pic3.png",
                stars: 5
              }
            ].map((testimonial, index) => (
              <MotionCard 
                key={index}
                delay={index * 0.2}
                className="p-8 relative"
              >
                <motion.div
                  className="absolute top-6 left-6 text-blue-200 text-6xl opacity-20"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FaQuoteLeft />
                </motion.div>
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex text-yellow-400 text-xl mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  >
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.4 + i * 0.1 }}
                      >
                        ★
                      </motion.span>
                    ))}
                  </motion.div>
                  
                  <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="border-t pt-4 flex items-center">
                    <img src={testimonial.image} alt={`Profile of ${testimonial.name}`} className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </MotionCard>
            ))}
                    </div>
        </div>
      </section>

      {/* Legacy Testimonials Section - Keeping for expanded view */}
      <section style={{ display: 'none' }}>
        <div className="container">
          <div className="testimonials-grid">
            {showAllTestimonials && (
              <>
                <div className="testimonial-card">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">"The affiliate program is a game-changer! Not only am I learning valuable skills, but I'm also earning while implementing what I learn. It's a win-win situation."</p>
                  <div className="testimonial-author">
                    <img src="/assets/images/images/profile-pic4.png" alt="Profile of David Thompson" className="testimonial-avatar" />
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
                    <img src="/assets/images/images/profile-pic5.png" alt="Profile of Adin Parker" className="testimonial-avatar" />
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
                    <img src="/assets/images/images/profile-pic6.png" alt="Profile of James Wilson" className="testimonial-avatar" />
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
                    <img src="/assets/images/images/profile-pic7.png" alt="Profile of Nina Patel" className="testimonial-avatar" />
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
                    <img src="/assets/images/images/profile-pic8.png" alt="Profile of Alex Foster" className="testimonial-avatar" />
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
      </section>

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
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MotionButton
              as={Link}
              to="/checkout"
              variant="primary"
              magnetic={true}
              glow={true}
              className="text-lg px-8 py-4"
            >
              Join Now for Only $47/month
            </MotionButton>
          </motion.div>
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
        
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MotionButton
              as={Link}
              to="/checkout"
              variant="primary"
              magnetic={true}
              glow={true}
              className="text-lg px-8 py-4"
            >
              Join Now for Only $47/month
            </MotionButton>
          </motion.div>
        </div>
      </motion.section>

      {/* Floating See More Reviews Button */}
      <button
        onClick={() => setShowTestimonialModal(true)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 1200,
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        aria-label="See More Reviews"
      >
        <FaQuoteLeft style={{ fontSize: '1.25rem' }} /> See More Reviews
      </button>
      {/* Testimonial Modal Overlay */}
      {showTestimonialModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowTestimonialModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              maxWidth: '700px',
              width: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTestimonialModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#4b5563',
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2563eb' }}>What Our Members Say</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Render all testimonials, including the extra ones */}
              {/* Always show all testimonials in the modal */}
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"Revenue Ripple transformed my marketing game! The tutorials are incredibly detailed and easy to follow. I've seen a 300% increase in my conversion rates since implementing their strategies."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic1.png" alt="Profile of Sarah Johnson" className="testimonial-avatar" />
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
                  <img src="/assets/images/images/profile-pic2.png" alt="Profile of Michael Chen" className="testimonial-avatar" />
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
                  <img src="/assets/images/images/profile-pic3.png" alt="Profile of Paul Rodriguez" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Paul Rodriguez</h4>
                    <p>Agency Founder</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"The affiliate program is a game-changer! Not only am I learning valuable skills, but I'm also earning while implementing what I learn. It's a win-win situation."</p>
                <div className="testimonial-author">
                  <img src="/assets/images/images/profile-pic4.png" alt="Profile of David Thompson" className="testimonial-avatar" />
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
                  <img src="/assets/images/images/profile-pic5.png" alt="Profile of Adin Parker" className="testimonial-avatar" />
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
                  <img src="/assets/images/images/profile-pic6.png" alt="Profile of James Wilson" className="testimonial-avatar" />
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
                  <img src="/assets/images/images/profile-pic7.png" alt="Profile of Nina Patel" className="testimonial-avatar" />
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
                  <img src="/assets/images/images/profile-pic8.png" alt="Profile of Alex Foster" className="testimonial-avatar" />
                  <div className="author-info">
                    <h4>Alex Foster</h4>
                    <p>Marketing Analytics Specialist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}