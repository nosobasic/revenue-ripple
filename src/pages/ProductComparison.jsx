import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  FaRocket, 
  FaEye, 
  FaTools, 
  FaDollarSign,
  FaCheckCircle,
  FaTimes,
  FaGraduationCap,
  FaChartLine,
  FaUsers,
  FaBolt,
  FaCrown,
  FaStar,
  FaArrowRight,
  FaShieldAlt,
  FaBrain,
  FaSearch,
  FaCrosshairs,
  FaLightbulb
} from 'react-icons/fa';
import '../pages.css';

export default function ProductComparison() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFAQ, setShowFAQ] = useState(false);
  const navigate = useNavigate();

  const products = [
    {
      id: 'education',
      name: 'Marketing Education',
      tagline: 'Master Digital Marketing',
      icon: FaGraduationCap,
      price: '$47',
      period: '/month',
      originalPrice: '$97',
      category: 'education',
      popular: false,
      badge: 'CORE PLATFORM',
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      description: 'Comprehensive marketing education platform with 46 tutorials and 25 video courses',
      features: [
        { name: '46 Marketing Tutorials', included: true },
        { name: '25 Expert Video Courses', included: true },
        { name: 'Affiliate Program Access', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Monthly Live Sessions', included: true },
        { name: 'Course Completion Certificates', included: true },
        { name: 'Mobile Learning App', included: true },
        { name: 'Community Forum Access', included: true }
      ],
      benefits: [
        'Build marketing skills from zero to expert',
        'Access continuously updated content',
        'Learn from industry professionals',
        'Implement proven strategies'
      ],
      cta: 'Start Learning',
      link: '/checkout'
    },
    {
      id: 'ai-tracker',
      name: 'AI Visibility Tracker',
      tagline: 'Dominate AI Search',
      icon: FaEye,
      price: '$79',
      period: '/month',
      originalPrice: '$149',
      category: 'tools',
      popular: true,
      badge: 'NEW LAUNCH',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      description: 'Track and optimize your business visibility across AI platforms like ChatGPT and Perplexity',
      features: [
        { name: '15+ AI Platform Monitoring', included: true },
        { name: 'Daily Visibility Reports', included: true },
        { name: 'Competitor Intelligence', included: true },
        { name: 'AI Content Optimization', included: true },
        { name: 'Real-time Alerts', included: true },
        { name: 'Custom Keywords Tracking', included: true },
        { name: 'White-label Reports', included: false },
        { name: 'API Access', included: false }
      ],
      benefits: [
        'Increase discoverability by 73%',
        'Stay ahead of competitors',
        'Optimize for AI algorithms',
        'Get early warning alerts'
      ],
      cta: 'Start Free Trial',
      link: '/ai-visibility-tracker'
    },
    {
      id: 'command-center',
      name: 'Command Center',
      tagline: 'Business Automation Hub',
      icon: FaTools,
      price: '$197',
      period: '/month',
      originalPrice: '$397',
      category: 'tools',
      popular: false,
      badge: 'PREMIUM TOOL',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      description: 'AI-powered DevOps dashboard for monitoring and automating your entire business',
      features: [
        { name: 'Business System Monitoring', included: true },
        { name: 'Automated Issue Detection', included: true },
        { name: 'Performance Optimization', included: true },
        { name: 'Revenue Tracking Dashboard', included: true },
        { name: 'Custom Automation Workflows', included: true },
        { name: 'Priority Technical Support', included: true },
        { name: 'White-label Deployment', included: true },
        { name: 'Custom Integrations', included: true }
      ],
      benefits: [
        'Prevent costly downtime',
        'Automate routine tasks',
        'Monitor all systems in one place',
        'Scale operations efficiently'
      ],
      cta: 'View Demo',
      link: '/command-center'
    },
    {
      id: 'reseller',
      name: 'Reseller Program',
      tagline: 'Earn Monthly Income',
      icon: FaDollarSign,
      price: '100%',
      period: 'Commission',
      originalPrice: null,
      category: 'monetization',
      popular: false,
      badge: 'EARN MONEY',
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      description: 'Earn recurring monthly income by promoting Revenue Ripple products',
      features: [
        { name: '$47/month per Referral', included: true },
        { name: '100% Commission on Sales', included: true },
        { name: 'Professional Marketing Materials', included: true },
        { name: 'Monthly PayPal Payments', included: true },
        { name: 'Performance Analytics', included: true },
        { name: 'Reseller Training Program', included: true },
        { name: 'Priority Affiliate Support', included: true },
        { name: 'Custom Landing Pages', included: true }
      ],
      benefits: [
        'Build passive income stream',
        'No inventory or shipping',
        'Professional sales materials',
        'Proven high-converting offers'
      ],
      cta: 'Start Earning',
      link: '/special'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: FaStar },
    { id: 'education', name: 'Education', icon: FaGraduationCap },
    { id: 'tools', name: 'Business Tools', icon: FaTools },
    { id: 'monetization', name: 'Earning', icon: FaDollarSign }
  ];

  const bundles = [
    {
      name: 'Complete Growth Bundle',
      description: 'Everything you need to build, grow, and monetize your business',
      products: ['education', 'ai-tracker', 'command-center'],
      originalPrice: '$323',
      bundlePrice: '$197',
      savings: '$126',
      popular: true
    },
    {
      name: 'Marketing Mastery Bundle',
      description: 'Learn marketing and track your AI visibility',
      products: ['education', 'ai-tracker'],
      originalPrice: '$126',
      bundlePrice: '$97',
      savings: '$29',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee on all products. No questions asked.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. You can cancel your subscription at any time from your account settings.'
    },
    {
      question: 'Do I need technical skills for the Command Center?',
      answer: 'No technical skills required. Our Command Center is designed to be user-friendly with guided setup.'
    },
    {
      question: 'How quickly can I start earning with the Reseller Program?',
      answer: 'You can start earning immediately. Most active resellers see their first commission within 30 days.'
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="home">
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
            Choose Your Business
            <span style={{ display: 'block', color: '#2563eb' }}>
              Growth Path
            </span>
          </h1>
          
          <p className="hero-subtitle">
            Compare all Revenue Ripple products and find the perfect solution for your business goals. 
            Start with one product or combine them for maximum growth potential.
          </p>
        </div>
      </motion.section>

      {/* Category Filter */}
      <motion.section
        style={{ padding: '2rem 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '50px',
                  background: selectedCategory === category.id ? '#2563eb' : 'white',
                  color: selectedCategory === category.id ? 'white' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <category.icon />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Comparison */}
      <motion.section
        style={{ padding: '4rem 0' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: product.popular ? '0 8px 25px rgba(37, 99, 235, 0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                  border: product.popular ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  position: 'relative',
                  textAlign: 'center'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {product.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    <FaCrown style={{ marginRight: '0.5rem' }} />
                    MOST POPULAR
                  </div>
                )}
                
                <div style={{
                  display: 'inline-block',
                  background: product.gradient,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem'
                }}>
                  {product.badge}
                </div>
                
                <product.icon style={{
                  fontSize: '3rem',
                  color: product.color,
                  marginBottom: '1rem'
                }} />
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  {product.name}
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {product.tagline}
                </p>
                
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    color: product.color
                  }}>
                    {product.price}
                  </span>
                  <span style={{ color: '#64748b' }}>{product.period}</span>
                  {product.originalPrice && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{
                        fontSize: '1rem',
                        color: '#64748b',
                        textDecoration: 'line-through'
                      }}>
                        Was {product.originalPrice}
                      </span>
                    </div>
                  )}
                </div>
                
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem',
                  lineHeight: 1.5
                }}>
                  {product.description}
                </p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  marginBottom: '2rem',
                  textAlign: 'left'
                }}>
                  {product.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      color: '#374151'
                    }}>
                      {feature.included ? (
                        <FaCheckCircle style={{
                          color: '#10b981',
                          marginRight: '0.75rem',
                          flexShrink: 0
                        }} />
                      ) : (
                        <FaTimes style={{
                          color: '#ef4444',
                          marginRight: '0.75rem',
                          flexShrink: 0
                        }} />
                      )}
                      <span style={{
                        opacity: feature.included ? 1 : 0.5
                      }}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={product.link}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block',
                    background: product.popular ? product.color : 'transparent',
                    color: product.popular ? 'white' : product.color,
                    border: product.popular ? 'none' : `2px solid ${product.color}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = product.color;
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = product.popular ? product.color : 'transparent';
                    e.target.style.color = product.popular ? 'white' : product.color;
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {product.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Bundle Offers */}
      <motion.section
        style={{ padding: '4rem 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem',
            color: '#1e293b'
          }}>
            Save More with Bundles
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {bundles.map((bundle, index) => (
              <motion.div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  boxShadow: bundle.popular ? '0 8px 25px rgba(37, 99, 235, 0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                  border: bundle.popular ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  position: 'relative'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {bundle.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    BEST VALUE
                  </div>
                )}
                
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '1rem'
                }}>
                  {bundle.name}
                </h3>
                
                <p style={{
                  color: '#64748b',
                  marginBottom: '2rem',
                  fontSize: '1.1rem'
                }}>
                  {bundle.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#2563eb'
                    }}>
                      {bundle.bundlePrice}/month
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#64748b',
                      textDecoration: 'line-through'
                    }}>
                      Was {bundle.originalPrice}
                    </div>
                  </div>
                  <div style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    fontWeight: 600
                  }}>
                    Save {bundle.savings}
                  </div>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '1rem'
                  }}>
                    Includes:
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {bundle.products.map((productId) => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <li key={productId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                          color: '#374151'
                        }}>
                          <FaCheckCircle style={{
                            color: '#10b981',
                            marginRight: '0.75rem'
                          }} />
                          {product.name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <button
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    background: bundle.popular ? '#2563eb' : 'transparent',
                    color: bundle.popular ? 'white' : '#2563eb',
                    border: bundle.popular ? 'none' : '2px solid #2563eb'
                  }}
                  onClick={() => navigate('/checkout?product=bundle&bundle=' + bundle.name.toLowerCase().replace(/ /g, '-'))}
                >
                  Get Bundle
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        style={{ padding: '4rem 0' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem',
            color: '#1e293b'
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <button
                  onClick={() => setShowFAQ(showFAQ === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {faq.question}
                  <span style={{
                    transform: showFAQ === index ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s'
                  }}>
                    ▼
                  </span>
                </button>
                {showFAQ === index && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem',
                    color: '#64748b',
                    lineHeight: 1.6
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: 'white'
          }}>
            Ready to Transform Your Business?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join thousands of entrepreneurs who have already chosen their growth path. 
            Start today and see results faster than you imagined.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/checkout"
              style={{
                background: 'white',
                color: '#2563eb',
                padding: '1.25rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <FaRocket />
              Start with Education
            </Link>
            
            <Link
              to="/ai-visibility-tracker"
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1.25rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <FaEye />
              Try AI Tracker Free
            </Link>
          </div>
          
          <div style={{
            marginTop: '2rem',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.95rem'
          }}>
            ✅ 30-day money-back guarantee • ✅ No setup fees • ✅ Cancel anytime
          </div>
        </div>
      </motion.section>
    </div>
  );
}