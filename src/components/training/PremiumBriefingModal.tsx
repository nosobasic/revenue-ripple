import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumBriefing } from '../../types/content';
import { useAIAssistant } from '../../context/AIAssistantContext';
import { useAuth } from '../../context/AuthContext';
import { trackBriefingOpen, trackBriefingRead } from '../../services/engagementTracking';

interface PremiumBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: PremiumBriefing | null;
}

const PremiumBriefingModal: React.FC<PremiumBriefingModalProps> = ({
  isOpen,
  onClose,
  briefing,
}) => {
  const { openWithInsight } = useAIAssistant();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasTrackedRead, setHasTrackedRead] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track briefing opened when modal opens
  React.useEffect(() => {
    if (isOpen && briefing && user) {
      trackBriefingOpen(user.id, briefing.id);
    }
  }, [isOpen, briefing, user]);

  // Track briefing read after user has viewed content (after 3 seconds)
  React.useEffect(() => {
    if (isOpen && briefing && user && !hasTrackedRead) {
      const timer = setTimeout(() => {
        trackBriefingRead(user.id, briefing.id);
        setHasTrackedRead(true);
      }, 3000); // Track as "read" after 3 seconds of viewing

      return () => clearTimeout(timer);
    }
  }, [isOpen, briefing, user, hasTrackedRead]);
  
  if (!isOpen || !briefing) return null;

  const handleDeepDive = () => {
    openWithInsight(briefing);
    onClose(); // Close the modal when opening the chat
  };

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: isMobile ? '0' : '1rem',
              overflowY: 'auto',
            }}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: isMobile ? '0' : '12px',
                maxWidth: isMobile ? '100%' : '800px',
                width: '100%',
                maxHeight: isMobile ? '100vh' : '90vh',
                minHeight: isMobile ? '100vh' : 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isMobile ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                marginTop: isMobile ? '0' : 'auto',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: isMobile ? '0.75rem' : '1rem',
                  right: isMobile ? '0.75rem' : '1rem',
                  background: isMobile ? 'rgba(0, 0, 0, 0.1)' : 'none',
                  border: 'none',
                  fontSize: isMobile ? '1.75rem' : '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  width: isMobile ? '40px' : '32px',
                  height: isMobile ? '40px' : '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isMobile ? 'rgba(0, 0, 0, 0.1)' : 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ×
              </button>

              {/* Scrollable Content */}
              <div
                style={{
                  overflowY: 'auto',
                  padding: isMobile ? '1rem' : '2rem',
                  paddingRight: isMobile ? '1rem' : '3rem',
                  paddingTop: isMobile ? '3.5rem' : '2rem',
                }}
              >
                {/* Title */}
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: isMobile ? '0.75rem' : '1rem',
                    fontSize: isMobile ? '1.375rem' : '1.75rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    lineHeight: '1.3',
                  }}
                >
                  {briefing.title}
                </h2>

                {/* Published Date */}
                {briefing.published_at && (
                  <div
                    style={{
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      color: '#64748b',
                      marginBottom: isMobile ? '1rem' : '1.5rem',
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
                      marginBottom: isMobile ? '1rem' : '1.5rem',
                    }}
                  >
                    {briefing.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: isMobile ? '0.3rem 0.75rem' : '0.375rem 0.875rem',
                          borderRadius: '16px',
                          fontSize: isMobile ? '0.8rem' : '0.875rem',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Full Body Content */}
                {briefing.full_body && (
                  <div
                    style={{
                      fontSize: isMobile ? '0.9375rem' : '1rem',
                      lineHeight: '1.7',
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {briefing.full_body}
                  </div>
                )}

                {/* Fallback if no full_body */}
                {!briefing.full_body && briefing.short_description && (
                  <div
                    style={{
                      fontSize: isMobile ? '0.9375rem' : '1rem',
                      lineHeight: '1.7',
                      color: '#334155',
                    }}
                  >
                    {briefing.short_description}
                  </div>
                )}

                {/* Deep Dive Button */}
                <div
                  style={{
                    marginTop: isMobile ? '1.5rem' : '2rem',
                    paddingTop: isMobile ? '1rem' : '1.5rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingBottom: isMobile ? '1rem' : '0',
                  }}
                >
                  <button
                    onClick={handleDeepDive}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: isMobile ? '14px 20px' : '12px 24px',
                      fontSize: isMobile ? '0.9375rem' : '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '6px' : '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }
                    }}
                  >
                    <svg
                      width={isMobile ? "18" : "20"}
                      height={isMobile ? "18" : "20"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Deep Dive with Ripple AI
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PremiumBriefingModal;

