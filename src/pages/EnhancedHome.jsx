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

export default function EnhancedHome() {
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Marketer",
      content: "Revenue Ripple has completely transformed how I approach marketing. The step-by-step guides are incredible!",
      stars: 5
    },
    {
      name: "Mike Chen",
      role: "E-commerce Owner",
      content: "The affiliate program alone has generated an extra $2,000/month for my business. Highly recommended!",
      stars: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Marketing Consultant",
      content: "Best investment I've made for my marketing education. The content is always up-to-date and actionable.",
      stars: 5
    }
  ];

  useEffect(() => {
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

      {/* Enhanced AI Section */}
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
            {testimonials.map((testimonial, index) => (
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
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}