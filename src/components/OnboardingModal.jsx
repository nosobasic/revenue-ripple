import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaDollarSign, FaRocket, FaTimes, FaChevronRight, FaArrowLeft } from 'react-icons/fa';

const OnboardingModal = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState('');
  const navigate = useNavigate();

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setCurrentStep(2);
  };

  const handleComplete = () => {
    // Save user intent and onboarding status
    localStorage.setItem('userIntent', selectedGoal);
    localStorage.setItem('hasOnboarded', 'true');
    
    // Route user based on their goal
    let redirectPath = '/dashboard';
    switch (selectedGoal) {
      case 'learn':
        redirectPath = '/courses';
        break;
      case 'earn':
        redirectPath = '/affiliate-centre';
        break;
      case 'both':
        redirectPath = '/dashboard';
        break;
      default:
        redirectPath = '/dashboard';
    }
    
    onComplete();
    navigate(redirectPath);
  };

  const handleSkip = () => {
    localStorage.setItem('hasOnboarded', 'true');
    onSkip();
  };

  const getGoalDisplay = (goal) => {
    switch (goal) {
      case 'learn':
        return 'Learn Marketing';
      case 'earn':
        return 'Earn with Affiliates';
      case 'both':
        return 'Learn & Earn';
      default:
        return '';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: 'min(2rem, 1.5rem)',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.3s ease-out',
        overflowY: 'auto'
      }}>
        {/* Close Button - Mobile Optimized */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#6b7280',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }}
        >
          <FaTimes />
        </button>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              width: 'min(80px, 15vw)',
              height: 'min(80px, 15vw)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: 'min(2rem, 8vw)',
              color: '#2563eb'
            }}>
              <FaRocket />
            </div>
            
            <h2 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Welcome to Revenue Ripple! 🎉
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3.5vw, 1.1rem)',
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.6',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem'
            }}>
              Let's get you started on your marketing journey. What's your main goal today?
            </p>

            {/* Goal Options - Mobile Optimized */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => handleGoalSelect('learn')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 'clamp(0.95rem, 3.5vw, 1rem)',
                  fontWeight: '500',
                  minHeight: '72px',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  color: '#2563eb',
                  fontSize: 'clamp(1.1rem, 4vw, 1.2rem)',
                  minWidth: '48px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaGraduationCap />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Learn Marketing Skills</div>
                  <div style={{ fontSize: 'clamp(0.85rem, 3vw, 0.9rem)', color: '#6b7280' }}>Master digital marketing through our courses</div>
                </div>
                <FaChevronRight style={{ color: '#9ca3af', fontSize: '1rem' }} />
              </button>

              <button
                onClick={() => handleGoalSelect('earn')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 'clamp(0.95rem, 3.5vw, 1rem)',
                  fontWeight: '500',
                  minHeight: '72px',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.backgroundColor = '#f0fdf4';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  backgroundColor: '#d1fae5',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  color: '#059669',
                  fontSize: 'clamp(1.1rem, 4vw, 1.2rem)',
                  minWidth: '48px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaDollarSign />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Earn with Affiliates</div>
                  <div style={{ fontSize: 'clamp(0.85rem, 3vw, 0.9rem)', color: '#6b7280' }}>Start earning commissions as an affiliate</div>
                </div>
                <FaChevronRight style={{ color: '#9ca3af', fontSize: '1rem' }} />
              </button>

              <button
                onClick={() => handleGoalSelect('both')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 'clamp(0.95rem, 3.5vw, 1rem)',
                  fontWeight: '500',
                  minHeight: '72px',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.backgroundColor = '#faf5ff';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  backgroundColor: '#ede9fe',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  color: '#7c3aed',
                  fontSize: 'clamp(1.1rem, 4vw, 1.2rem)',
                  minWidth: '48px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaRocket />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>Both - Learn & Earn</div>
                  <div style={{ fontSize: 'clamp(0.85rem, 3vw, 0.9rem)', color: '#6b7280' }}>Master marketing while building income</div>
                </div>
                <FaChevronRight style={{ color: '#9ca3af', fontSize: '1rem' }} />
              </button>
            </div>

            <button
              onClick={handleSkip}
              style={{
                marginTop: '1.5rem',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                fontSize: 'clamp(0.85rem, 3vw, 0.9rem)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0.75rem 1rem'
              }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2: Confirmation & Next Steps */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
            <div style={{
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              width: 'min(80px, 15vw)',
              height: 'min(80px, 15vw)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: 'min(2rem, 8vw)'
            }}>
              ✅
            </div>
            
            <h2 style={{
              fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Perfect! Let's get started
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3.5vw, 1.1rem)',
              color: '#6b7280',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem'
            }}>
              You selected: <strong style={{ color: '#2563eb' }}>{getGoalDisplay(selectedGoal)}</strong>
            </p>

            <p style={{
              fontSize: 'clamp(0.95rem, 3vw, 1rem)',
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.6',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem'
            }}>
              We'll take you to the perfect starting point for your journey. You can always explore other sections later!
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              justifyContent: 'center',
              flexDirection: window.innerWidth < 400 ? 'column' : 'row'
            }}>
              <button
                onClick={() => setCurrentStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: 'clamp(0.95rem, 3.5vw, 1rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '48px',
                  flex: window.innerWidth < 400 ? '1' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <FaArrowLeft />
                Back
              </button>

              <button
                onClick={handleComplete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: 'clamp(0.95rem, 3.5vw, 1rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '48px',
                  flex: window.innerWidth < 400 ? '1' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Let's Go!
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Mobile-specific optimizations */
          @media (max-width: 480px) {
            /* Ensure touch targets are accessible */
            button {
              min-height: 48px;
            }
            
            /* Improve readability on small screens */
            div[style*="textAlign: center"] p {
              line-height: 1.7 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OnboardingModal;