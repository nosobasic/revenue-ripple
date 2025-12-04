import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumBriefing } from '../../types/content';

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
  if (!isOpen || !briefing) return null;

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
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
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
                borderRadius: '12px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  width: '32px',
                  height: '32px',
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
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ×
              </button>

              {/* Scrollable Content */}
              <div
                style={{
                  overflowY: 'auto',
                  padding: '2rem',
                  paddingRight: '3rem',
                }}
              >
                {/* Title */}
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: '1rem',
                    fontSize: '1.75rem',
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
                      fontSize: '0.9rem',
                      color: '#64748b',
                      marginBottom: '1.5rem',
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
                      gap: '0.5rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {briefing.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: '0.375rem 0.875rem',
                          borderRadius: '16px',
                          fontSize: '0.875rem',
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
                      fontSize: '1rem',
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
                      fontSize: '1rem',
                      lineHeight: '1.7',
                      color: '#334155',
                    }}
                  >
                    {briefing.short_description}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PremiumBriefingModal;

