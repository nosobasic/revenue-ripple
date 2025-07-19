import React, { useState, useEffect } from 'react';
import { FaStar, FaTrophy, FaFire } from 'react-icons/fa';

const ProgressIndicator = ({ 
  progress = 0, 
  size = 'medium', 
  showPercentage = true, 
  animated = true,
  celebrateOnComplete = true 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate progress bar fill
  useEffect(() => {
    if (!animated) {
      setDisplayProgress(progress);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 300);

    return () => clearTimeout(timer);
  }, [progress, animated]);

  // Trigger celebration on completion
  useEffect(() => {
    if (progress >= 100 && celebrateOnComplete && displayProgress < 100) {
      setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }, 500);
    }
  }, [progress, celebrateOnComplete, displayProgress]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: '6px', fontSize: '0.75rem' };
      case 'large':
        return { height: '12px', fontSize: '1.1rem' };
      default:
        return { height: '8px', fontSize: '0.9rem' };
    }
  };

  const sizeStyles = getSizeStyles();

  const getProgressColor = () => {
    if (progress >= 100) return '#10b981'; // Green for complete
    if (progress >= 75) return '#f59e0b';   // Amber for almost done
    if (progress >= 50) return '#3b82f6';   // Blue for halfway
    return '#6b7280';                       // Gray for started
  };

  const getProgressIcon = () => {
    if (progress >= 100) return <FaTrophy style={{ color: '#10b981' }} />;
    if (progress >= 75) return <FaFire style={{ color: '#f59e0b' }} />;
    if (progress >= 25) return <FaStar style={{ color: '#3b82f6' }} />;
    return null;
  };

  return (
    <div style={{ 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%'
    }}>
      {/* Progress Bar Container */}
      <div style={{
        flex: 1,
        backgroundColor: '#e5e7eb',
        borderRadius: '10px',
        height: sizeStyles.height,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Progress Bar Fill */}
        <div
          style={{
            height: '100%',
            width: `${displayProgress}%`,
            background: `linear-gradient(90deg, ${getProgressColor()}, ${getProgressColor()}dd)`,
            borderRadius: '10px',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated shine effect */}
          {animated && displayProgress > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: displayProgress > 0 ? 'shine 2s ease-in-out infinite' : 'none'
              }}
            />
          )}
        </div>

        {/* Pulse effect for active progress */}
        {progress > 0 && progress < 100 && animated && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '4px',
              height: '100%',
              background: getProgressColor(),
              opacity: 0.7,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        )}
      </div>

      {/* Progress Icon */}
      {getProgressIcon() && (
        <div style={{
          fontSize: sizeStyles.fontSize,
          animation: progress >= 100 ? 'bounce 0.5s ease-in-out' : 'none'
        }}>
          {getProgressIcon()}
        </div>
      )}

      {/* Progress Percentage */}
      {showPercentage && (
        <div style={{
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
          color: getProgressColor(),
          minWidth: '3rem',
          textAlign: 'right'
        }}>
          {Math.round(displayProgress)}%
        </div>
      )}

      {/* Celebration Effect */}
      {showCelebration && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            animation: 'celebrationPop 2s ease-out',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            zIndex: 10
          }}
        >
          🎉 Complete! Great job!
        </div>
      )}

      <style>
        {`
          @keyframes shine {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes celebrationPop {
            0% { 
              opacity: 0; 
              transform: translateX(-50%) translateY(10px) scale(0.5); 
            }
            20% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(-10px) scale(1.1); 
            }
            80% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(-10px) scale(1); 
            }
            100% { 
              opacity: 0; 
              transform: translateX(-50%) translateY(-20px) scale(0.9); 
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProgressIndicator;