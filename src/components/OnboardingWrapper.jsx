import React, { useState, useEffect } from 'react';
import OnboardingModal from './OnboardingModal';

const OnboardingWrapper = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check for first-time user onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    
    if (!hasOnboarded) {
      // Small delay to let the page load before showing modal
      setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </>
  );
};

export default OnboardingWrapper;