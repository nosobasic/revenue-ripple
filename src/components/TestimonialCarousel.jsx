import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Sample testimonials and success stories
  const testimonials = [
    {
      id: 1,
      text: "Revenue Ripple transformed my marketing knowledge. I went from $0 to $5,000/month in affiliate commissions in just 3 months!",
      author: "Sarah M.",
      role: "Digital Marketer",
      rating: 5,
      type: "success"
    },
    {
      id: 2,
      text: "The course structure is perfect - bite-sized lessons that I could complete during my lunch breaks. Finally understand Facebook ads!",
      author: "Mike T.",
      role: "Small Business Owner",
      rating: 5,
      type: "testimonial"
    },
    {
      id: 3,
      text: "Started with zero marketing experience. Now I'm running successful campaigns for my e-commerce store and earning $2K+ monthly as a reseller.",
      author: "Jennifer L.",
      role: "Pro Reseller",
      rating: 5,
      type: "success"
    },
    {
      id: 4,
      text: "The community support is incredible. Whenever I had questions, I got helpful answers within hours. Best investment I've made!",
      author: "David R.",
      role: "Affiliate Marketer",
      rating: 5,
      type: "testimonial"
    },
    {
      id: 5,
      text: "I landed my first marketing job after completing the fundamentals course. The practical exercises gave me real portfolio pieces to show employers.",
      author: "Alex P.",
      role: "Marketing Coordinator",
      rating: 5,
      type: "success"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, testimonials.length]);

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '20%',
        height: '200%',
        background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.05), transparent)',
        transform: 'rotate(15deg)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          minHeight: '60px'
        }}>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#64748b',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#64748b';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <FaChevronLeft style={{ fontSize: '0.8rem' }} />
          </button>

          {/* Testimonial Content */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            padding: '0 1rem',
            position: 'relative'
          }}>
            {/* Success/Testimonial Badge */}
            <div style={{
              display: 'inline-block',
              padding: '0.2rem 0.6rem',
              borderRadius: '16px',
              fontSize: '0.7rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              background: currentTestimonial.type === 'success' 
                ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              color: currentTestimonial.type === 'success' ? '#059669' : '#2563eb',
              border: `1px solid ${currentTestimonial.type === 'success' ? '#a7f3d0' : '#93c5fd'}`
            }}>
              {currentTestimonial.type === 'success' ? '🎉 Success Story' : '💬 Testimonial'}
            </div>

            {/* Quote Icon */}
            <FaQuoteLeft style={{
              fontSize: '1.2rem',
              color: '#2563eb',
              opacity: 0.3,
              marginBottom: '0.3rem'
            }} />

            {/* Testimonial Text */}
            <p style={{
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#1e293b',
              lineHeight: '1.5',
              marginBottom: '0.75rem',
              fontStyle: 'italic',
              maxWidth: '700px',
              margin: '0 auto 0.75rem'
            }}>
              "{currentTestimonial.text}"
            </p>

            {/* Author Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.9rem'
                }}>
                  {currentTestimonial.author}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  {currentTestimonial.role}
                </div>
              </div>

              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    style={{ 
                      color: '#fbbf24', 
                      fontSize: '0.9rem' 
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#64748b',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#64748b';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <FaChevronRight style={{ fontSize: '0.8rem' }} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem'
        }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentIndex ? '#2563eb' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.target.style.background = '#94a3b8';
                  e.target.style.transform = 'scale(1.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.target.style.background = '#cbd5e1';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .testimonial-container {
            padding: 0.25rem 0 !important;
          }
          
          .testimonial-content {
            padding: 0 0.5rem !important;
            min-height: 50px !important;
          }
          
          .testimonial-text {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
            margin-bottom: 0.5rem !important;
          }
          
          .testimonial-badge {
            font-size: 0.65rem !important;
            padding: 0.15rem 0.5rem !important;
            margin-bottom: 0.3rem !important;
          }
          
          .author-name {
            font-size: 0.8rem !important;
          }
          
          .author-role {
            font-size: 0.7rem !important;
          }
          
          .star-rating {
            font-size: 0.8rem !important;
          }
          
          .nav-button {
            width: 28px !important;
            height: 28px !important;
          }
          
          .quote-icon {
            font-size: 1rem !important;
            margin-bottom: 0.2rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .testimonial-text {
            font-size: 0.8rem !important;
            max-width: 280px !important;
          }
          
          .testimonial-content {
            padding: 0 0.25rem !important;
          }
          
          .nav-button {
            width: 24px !important;
            height: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TestimonialCarousel;