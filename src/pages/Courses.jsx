import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../pages.css';
import { FaGraduationCap, FaPlay } from 'react-icons/fa';

const Courses = () => {
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Alphabetized list of all courses
  const courses = [
    {
      id: 'affiliate-marketing',
      title: 'Affiliate Marketing',
      description: 'Learn how to successfully promote products and earn commissions through affiliate marketing.'
    },
    {
      id: 'affiliate-recruiting',
      title: 'Affiliate Recruiting',
      description: 'Master the strategies for building and managing a successful affiliate network.'
    },
    {
      id: 'automation',
      title: 'Marketing Automation',
      description: 'Automate your marketing tasks and scale your business. Learn advanced automation strategies and tools.'
    },
    {
      id: 'banner-ads',
      title: 'Banner Ads',
      description: 'Learn how to create and optimize banner ads for maximum reach and conversions.'
    },
    {
      id: 'cold-calling',
      title: 'Cold Calling',
      description: 'Master the art of effective cold calling and closing deals.'
    },
    {
      id: 'ecommerce',
      title: 'eCommerce',
      description: 'Learn how to build and run a successful online store.'
    },
    {
      id: 'email-marketing',
      title: 'Email Marketing',
      description: 'Master email marketing in record time with our comprehensive guide. Learn everything from list building to advanced automation.'
    },
    {
      id: 'freelancing',
      title: 'Freelancing',
      description: 'Learn how to build a successful freelancing business.'
    },
    {
      id: 'funnel-building',
      title: 'Funnel Building',
      description: 'Create high-converting sales funnels that turn visitors into customers.'
    },
    {
      id: 'geo-targeting',
      title: 'Geo Targeting',
      description: 'Learn how to target specific geographic areas with your marketing campaigns.'
    },
    {
      id: 'lead-generation',
      title: 'Lead Generation',
      description: 'Master lead generation strategies to grow your business.'
    },
    {
      id: 'linkedin-ads',
      title: 'LinkedIn Ads',
      description: 'Create effective advertising campaigns on LinkedIn.'
    },
    {
      id: 'linkedin-marketing',
      title: 'LinkedIn Marketing (Organic)',
      description: 'Learn how to use LinkedIn for organic growth and lead generation.'
    },
    {
      id: 'messenger-marketing',
      title: 'Messenger Marketing',
      description: 'Master Facebook Messenger for marketing and automation.'
    },
    {
      id: 'newsfeed-ads',
      title: 'Newsfeed Ads',
      description: 'Create effective ads for social media newsfeeds.'
    },
    {
      id: 'online-learning',
      title: 'Online Learning',
      description: 'Create and sell successful online courses.'
    },
    {
      id: 'outsourcing',
      title: 'Outsourcing',
      description: 'Learn how to effectively delegate and manage remote teams.'
    },
    {
      id: 'paid-traffic',
      title: 'Paid Traffic',
      description: 'Master paid advertising across multiple platforms.'
    },
    {
      id: 'pinterest-marketing',
      title: 'Pinterest Marketing',
      description: 'Learn how to use Pinterest to drive traffic and sales.'
    },
    {
      id: 'search-ads',
      title: 'Search Advertising',
      description: 'Master search engine advertising campaigns.'
    },
    {
      id: 'seo',
      title: 'SEO',
      description: 'Learn search engine optimization from the ground up.'
    },
    {
      id: 'social-marketing',
      title: 'Social Marketing',
      description: 'Master social media platforms for business growth.'
    },
    {
      id: 'split-testing',
      title: 'Split Testing',
      description: 'Learn how to optimize through effective A/B testing.'
    },
    {
      id: 'twitter-ads',
      title: 'Twitter Timeline Advertising',
      description: 'Create effective advertising campaigns on Twitter.'
    },
    {
      id: 'web-design',
      title: 'Web Design',
      description: 'Learn to build professional, responsive websites from scratch.'
    },
    {
      id: 'ai-essentials',
      title: 'AI Essentials',
      description: 'Master the fundamentals of artificial intelligence and its practical applications in business.'
    },
    {
      id: 'ai-agent-fundamentals',
      title: 'AI Agent Fundamentals',
      description: 'Learn how to build and deploy AI agents for automation and enhanced productivity.'
    },
    {
      id: 'prompt-engineering',
      title: 'Prompt Engineering',
      description: 'Master the art of crafting effective prompts for AI language models to get optimal results.'
    }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">VIDEO COURSES</h1>
          <div className="dashboard-welcome">Comprehensive Training Library</div>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section-group">
            <h2 className="section-title">Video Courses</h2>
            <p className="section-subtitle">Master the skills you need with our comprehensive video training library</p>
            <div className="section">
              <div className="section-header">
                <FaGraduationCap className="section-icon" />
                <h2>ALL COURSES</h2>
              </div>
              <div className="section-content">
                {courses.map((course) => (
                  <div 
                    key={course.id}
                    className={`course-item ${expandedSection === course.id ? 'expanded' : ''}`}
                    onClick={() => toggleSection(course.id)}
                  >
                    <h3>{course.title}</h3>
                    {expandedSection === course.id && (
                      <div className="course-details">
                        <p>{course.description}</p>
                        <Link to={`/courses/${course.id}`} className="cta-link">
                          <FaPlay style={{ marginRight: '8px' }} />
                          Start Course →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Content - Message from owner */}
        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <h2>Message from the owner:</h2>
            </div>
            <div className="section-content">
              <div className="owner-message">
                <p>From affiliate marketing and SEO to paid ads and social media, these courses break down what actually works in the world of online marketing. No fluff—just real strategies you can apply to start growing your business today.</p>
                <p>You'll learn how to run ad campaigns that convert, bring in quality leads, and drive consistent traffic. We'll also show you how to build optimized funnels, landing pages that sell, and how to rank higher on search engines without wasting time.</p>
                <p>Whether you're just getting started or looking to sharpen your skills and scale up, this content is built to deliver value fast. It's taught by people who've done it—not just theory, but actual tactics that work in today's market.</p>
                <p>If you're serious about growing your brand or business, tap into these videos and start leveling up. And if you've got questions or need support, hit us up—we've got you.</p>
                <p>Let's get it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses; 