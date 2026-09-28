import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../config/constants';
import { FaTimes, FaArrowRight } from 'react-icons/fa';

export default function FeatureTour({ tourName, onComplete }) {
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    loadTour();
  }, [tourName]);

  const loadTour = async () => {
    if (!user || !tourName) return;
    
    try {
      const toursResponse = await fetch(`${getApiBase()}/api/feature-tours`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      if (toursResponse.ok) {
        const { tours } = await toursResponse.json();
        const foundTour = tours.find(t => t.tour_name === tourName);
        
        if (foundTour && !foundTour.progress?.completed && !foundTour.progress?.skipped) {
          setTour(foundTour);
          
          if (!foundTour.progress) {
            await startTour(foundTour.id);
          } else {
            setCurrentStepIndex(foundTour.progress.current_step);
          }
          
          setIsActive(true);
        }
      }
    } catch (err) {
      console.error('Failed to load tour:', err);
    }
  };

  const startTour = async (tourId) => {
    if (!user) return;
    
    try {
      await fetch(`${getApiBase()}/api/feature-tours/${tourId}/start`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
    } catch (err) {
      console.error('Failed to start tour:', err);
    }
  };

  const updateProgress = async (stepIndex, completed = false) => {
    if (!user || !tour) return;
    
    try {
      await fetch(`${getApiBase()}/api/feature-tours/${tour.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        },
        body: JSON.stringify({
          current_step: stepIndex,
          completed: completed
        })
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleNext = async () => {
    const steps = tour?.steps || [];
    
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      await updateProgress(nextIndex);
    } else {
      await completeTour();
    }
  };

  const completeTour = async () => {
    if (!user || !tour) return;
    
    await updateProgress(currentStepIndex, true);
    setIsActive(false);
    onComplete?.();
  };

  const skipTour = async () => {
    if (!user || !tour) return;
    
    try {
      await fetch(`${getApiBase()}/api/feature-tours/${tour.id}/skip`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      setIsActive(false);
      onComplete?.();
    } catch (err) {
      console.error('Failed to skip tour:', err);
    }
  };

  if (!isActive || !tour) return null;

  const steps = tour.steps || [];
  const currentStep = steps[currentStepIndex];
  
  if (!currentStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div style={styles.overlay} onClick={skipTour} />
      
      {/* Tooltip */}
      <div style={styles.tooltip}>
        <div style={styles.tooltipHeader}>
          <div style={styles.stepIndicator}>
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <button style={styles.closeButton} onClick={skipTour}>
            <FaTimes />
          </button>
        </div>
        
        <h3 style={styles.tooltipTitle}>{currentStep.title}</h3>
        <p style={styles.tooltipDescription}>{currentStep.description}</p>
        
        <div style={styles.tooltipFooter}>
          <button style={styles.skipButton} onClick={skipTour}>
            Skip Tour
          </button>
          <button style={styles.nextButton} onClick={handleNext}>
            {isLastStep ? 'Finish' : 'Next'}
            <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>
        </div>
        
        {/* Progress dots */}
        <div style={styles.progressDots}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                ...styles.progressDot,
                ...(idx === currentStepIndex ? styles.progressDotActive : {}),
                ...(idx < currentStepIndex ? styles.progressDotCompleted : {})
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
    cursor: 'pointer'
  },
  tooltip: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 9999
  },
  tooltipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  stepIndicator: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  closeButton: {
    padding: '4px',
    fontSize: '16px',
    border: 'none',
    background: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  tooltipTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  tooltipDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  tooltipFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginBottom: '16px'
  },
  skipButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  progressDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px'
  },
  progressDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    transition: 'all 0.3s'
  },
  progressDotActive: {
    backgroundColor: '#2563eb',
    width: '24px',
    borderRadius: '4px'
  },
  progressDotCompleted: {
    backgroundColor: '#10b981'
  }
};
