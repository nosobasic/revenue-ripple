import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaLock } from 'react-icons/fa';
import { PremiumBriefing } from '../../types/content';

interface PremiumBriefingCarouselProps {
  briefings: PremiumBriefing[];
  isMember: boolean;
  onCardClick: (briefing: PremiumBriefing) => void;
}

const PremiumBriefingCarousel: React.FC<PremiumBriefingCarouselProps> = ({
  briefings,
  isMember,
  onCardClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const goToNext = () => {
    if (briefings.length === 0) return;
    setCurrentIndex((prev) => (prev === briefings.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    if (briefings.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? briefings.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Scroll to current card
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? window.innerWidth - 32 : 320; // Full width minus padding on mobile
      const scrollPosition = currentIndex * cardWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, isMobile]);

  // Empty state
  if (briefings.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 1rem',
          textAlign: 'center',
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <p style={{ fontSize: '1rem', margin: 0 }}>
          Premium briefings arrive here once your value engine generates them
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: isMobile ? '0.5rem 0' : '1rem 0',
      }}
    >
      {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
      {briefings.length > 1 && !isMobile && (
        <>
          <button
            onClick={goToPrevious}
            style={{
              position: 'absolute',
              left: '-1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <FaChevronLeft style={{ fontSize: '0.9rem', color: 'inherit' }} />
          </button>

          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '-1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <FaChevronRight style={{ fontSize: '0.9rem', color: 'inherit' }} />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex',
          gap: isMobile ? '0.75rem' : '1rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          padding: isMobile ? '0.5rem 1rem' : '0.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={(e) => {
          const container = e.currentTarget;
          const cardWidth = isMobile ? window.innerWidth - 32 : 320;
          const newIndex = Math.round(container.scrollLeft / cardWidth);
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < briefings.length) {
            setCurrentIndex(newIndex);
          }
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {briefings.map((briefing, index) => (
          <motion.div
            key={briefing.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: index === currentIndex ? 1 : 0.8,
              scale: index === currentIndex ? 1 : 0.95,
            }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (isMember) {
                onCardClick(briefing);
              }
            }}
            style={{
              minWidth: isMobile ? 'calc(100vw - 2rem)' : '300px',
              maxWidth: isMobile ? 'calc(100vw - 2rem)' : '300px',
              scrollSnapAlign: 'start',
              cursor: isMember ? 'pointer' : 'not-allowed',
              position: 'relative',
              filter: !isMember ? 'blur(4px)' : 'none',
              pointerEvents: !isMember ? 'none' : 'auto',
            }}
          >
            <motion.div
              whileHover={isMember ? { y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {}}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: isMobile ? '1.25rem' : '1.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Locked Overlay */}
              {!isMember && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Could navigate to upgrade page here
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'white',
                      padding: '1rem',
                    }}
                  >
                    <FaLock style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: '600' }}>
                      Unlock Premium Briefings
                    </p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                      Become a member to access
                    </p>
                  </div>
                </div>
              )}

              {/* Title */}
              <h3
                style={{
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                  fontWeight: '600',
                  margin: '0 0 0.75rem 0',
                  color: '#1e293b',
                  lineHeight: '1.3',
                }}
              >
                {briefing.title}
              </h3>

              {/* Short Description */}
              {briefing.short_description && (
                <p
                  style={{
                    fontSize: isMobile ? '0.875rem' : '0.9rem',
                    color: '#64748b',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5',
                    flex: 1,
                  }}
                >
                  {briefing.short_description}
                </p>
              )}

              {/* Published Date */}
              {briefing.published_at && (
                <div
                  style={{
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    color: '#94a3b8',
                    marginBottom: '0.75rem',
                  }}
                >
                  {formatDate(briefing.published_at)}
                </div>
              )}

              {/* Tags */}
              {briefing.tags && briefing.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: isMobile ? '0.375rem' : '0.5rem',
                    marginTop: 'auto',
                  }}
                >
                  {briefing.tags.slice(0, isMobile ? 2 : 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: isMobile ? '0.2rem 0.625rem' : '0.25rem 0.75rem',
                        borderRadius: '16px',
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        fontWeight: '500',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {briefing.tags.length > (isMobile ? 2 : 3) && (
                    <span
                      style={{
                        color: '#94a3b8',
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        padding: isMobile ? '0.2rem 0.625rem' : '0.25rem 0.75rem',
                      }}
                    >
                      +{briefing.tags.length - (isMobile ? 2 : 3)}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Dots */}
      {briefings.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '0.375rem' : '0.5rem',
            marginTop: isMobile ? '0.75rem' : '1rem',
            padding: isMobile ? '0 1rem' : '0',
          }}
        >
          {briefings.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? (isMobile ? '20px' : '24px') : '8px',
                height: isMobile ? '6px' : '8px',
                borderRadius: '4px',
                border: 'none',
                background: index === currentIndex ? '#2563eb' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.background = '#94a3b8';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.background = '#cbd5e1';
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumBriefingCarousel;

