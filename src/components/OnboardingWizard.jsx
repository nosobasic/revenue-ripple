import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../config/constants';
import { FaRocket, FaCheck, FaBullseye, FaGraduationCap, FaChartLine } from 'react-icons/fa';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Revenue Ripple!',
    description: 'Let me help you get started on your marketing journey',
    icon: <FaRocket />
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    description: "What do you want to achieve? Let's set some clear goals",
    icon: <FaBullseye />
  },
  {
    id: 'interests',
    title: 'Your Interests',
    description: 'Which marketing areas interest you most?',
    icon: <FaGraduationCap />
  },
  {
    id: 'experience',
    title: 'Your Experience',
    description: 'Help us tailor content to your skill level',
    icon: <FaChartLine />
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your journey begins now',
    icon: <FaCheck />
  }
];

const MARKETING_INTERESTS = [
  'SEO & Content Marketing',
  'Paid Advertising (PPC)',
  'Social Media Marketing',
  'Email Marketing',
  'Affiliate Marketing',
  'Funnel Building',
  'Web Design',
  'AI & Automation'
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced marketer' }
];

export default function OnboardingWizard({ onComplete }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    goals: '',
    interests: [],
    experience: '',
    targetRevenue: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${getApiBase()}/api/onboarding/state`, {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      if (response.ok) {
        const { state } = await response.json();
        if (state && state.data) {
          setOnboardingData(state.data);
          setCurrentStep(state.current_step || 0);
          
          if (state.completed) {
            onComplete?.();
          }
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding state:', err);
    }
  };

  const updateOnboardingState = async (stepData) => {
    if (!user) return;
    
    try {
      await fetch(`${getApiBase()}/api/onboarding/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        },
        body: JSON.stringify({
          current_step: currentStep,
          data: { ...onboardingData, ...stepData }
        })
      });
    } catch (err) {
      console.error('Failed to update onboarding state:', err);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fetch(`${getApiBase()}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role || 'member'
        }
      });
      
      if (onboardingData.goals) {
        await fetch(`${getApiBase()}/api/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role || 'member'
          },
          body: JSON.stringify({
            title: onboardingData.goals,
            goal_type: 'custom',
            description: 'Initial goal set during onboarding',
            priority: 1,
            metadata: {
              interests: onboardingData.interests,
              experience: onboardingData.experience
            }
          })
        });
      }
      
      onComplete?.();
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      await updateOnboardingState({});
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestToggle = (interest) => {
    setOnboardingData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const canProceed = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return true;
      case 'goals':
        return onboardingData.goals.length > 0;
      case 'interests':
        return onboardingData.interests.length > 0;
      case 'experience':
        return onboardingData.experience.length > 0;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Progress bar */}
        <div style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((s, idx) => (
            <div
              key={s.id}
              style={{
                ...styles.progressStep,
                ...(idx <= currentStep ? styles.progressStepActive : {})
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            {step.icon}
          </div>
          
          <h2 style={styles.title}>{step.title}</h2>
          <p style={styles.description}>{step.description}</p>

          {/* Step-specific content */}
          <div style={styles.stepContent}>
            {step.id === 'welcome' && (
              <div style={styles.welcomeContent}>
                <p style={styles.welcomeText}>
                  I'm Ripple, your AI marketing guide! I'll help you:
                </p>
                <ul style={styles.featureList}>
                  <li><FaCheck style={styles.checkIcon} /> Navigate courses and training</li>
                  <li><FaCheck style={styles.checkIcon} /> Set and track your goals</li>
                  <li><FaCheck style={styles.checkIcon} /> Test your knowledge with quizzes</li>
                  <li><FaCheck style={styles.checkIcon} /> Apply skills with real homework</li>
                  <li><FaCheck style={styles.checkIcon} /> Answer questions anytime</li>
                </ul>
              </div>
            )}

            {step.id === 'goals' && (
              <div style={styles.inputContainer}>
                <label style={styles.label}>
                  What's your main marketing goal right now?
                </label>
                <textarea
                  style={styles.textarea}
                  placeholder="E.g., Build an email list of 1,000 subscribers, Learn SEO basics, Launch my first ad campaign..."
                  value={onboardingData.goals}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, goals: e.target.value }))}
                  rows={4}
                />
                <label style={styles.label}>
                  Target revenue (optional)
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="$5,000/month"
                  value={onboardingData.targetRevenue}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, targetRevenue: e.target.value }))}
                />
              </div>
            )}

            {step.id === 'interests' && (
              <div style={styles.interestsGrid}>
                {MARKETING_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    style={{
                      ...styles.interestButton,
                      ...(onboardingData.interests.includes(interest) ? styles.interestButtonActive : {})
                    }}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {onboardingData.interests.includes(interest) && (
                      <FaCheck style={styles.interestCheck} />
                    )}
                    {interest}
                  </button>
                ))}
              </div>
            )}

            {step.id === 'experience' && (
              <div style={styles.experienceLevels}>
                {EXPERIENCE_LEVELS.map(level => (
                  <button
                    key={level.value}
                    style={{
                      ...styles.experienceButton,
                      ...(onboardingData.experience === level.value ? styles.experienceButtonActive : {})
                    }}
                    onClick={() => setOnboardingData(prev => ({ ...prev, experience: level.value }))}
                  >
                    <div style={styles.experienceLabelContainer}>
                      <span style={styles.experienceLabel}>{level.label}</span>
                      <span style={styles.experienceDescription}>{level.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step.id === 'complete' && (
              <div style={styles.completeContent}>
                <div style={styles.confettiIcon}>🎉</div>
                <p style={styles.completeText}>
                  You're all set! I'll be here to guide you every step of the way.
                  Let's start building your marketing success!
                </p>
              </div>
            )}
          </div>

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          {/* Navigation buttons */}
          <div style={styles.buttonContainer}>
            {currentStep > 0 && step.id !== 'complete' && (
              <button
                style={styles.backButton}
                onClick={handlePrevious}
                disabled={loading}
              >
                Back
              </button>
            )}
            <button
              style={{
                ...styles.nextButton,
                ...(canProceed() ? {} : styles.nextButtonDisabled)
              }}
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading ? 'Saving...' : step.id === 'complete' ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  progressContainer: {
    display: 'flex',
    gap: '8px',
    padding: '24px 24px 0'
  },
  progressStep: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    transition: 'background-color 0.3s'
  },
  progressStepActive: {
    backgroundColor: '#2563eb'
  },
  content: {
    padding: '32px'
  },
  iconContainer: {
    fontSize: '48px',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '8px'
  },
  description: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '32px'
  },
  stepContent: {
    marginBottom: '32px'
  },
  welcomeContent: {
    textAlign: 'left'
  },
  welcomeText: {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '16px'
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  checkIcon: {
    color: '#10b981',
    marginRight: '12px'
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontFamily: 'inherit'
  },
  interestsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  interestButton: {
    padding: '16px',
    fontSize: '14px',
    fontWeight: '500',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  interestButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    color: '#2563eb'
  },
  interestCheck: {
    fontSize: '16px'
  },
  experienceLevels: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  experienceButton: {
    padding: '20px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  experienceButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  experienceLabelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  experienceLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937'
  },
  experienceDescription: {
    fontSize: '14px',
    color: '#6b7280'
  },
  completeContent: {
    textAlign: 'center'
  },
  confettiIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  completeText: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.6'
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  backButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  nextButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  nextButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};
