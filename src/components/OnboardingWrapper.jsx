import React, { useState, useEffect } from 'react';
import OnboardingModal from './OnboardingModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

const OnboardingWrapper = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Check for first-time user onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // First check localStorage for quick fallback
      const localOnboarded = localStorage.getItem('hasOnboarded');
      
      if (user) {
        // Check Supabase for authenticated users
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('has_completed')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // Error other than "not found"
          console.error('Error checking onboarding status:', error);
        }

        if (!data || !data.has_completed) {
          // User hasn't completed onboarding
          setTimeout(() => {
            setShowOnboarding(true);
            setLoading(false);
          }, 1500);
        } else {
          // Sync with localStorage
          localStorage.setItem('hasOnboarded', 'true');
          setLoading(false);
        }
      } else {
        // For non-authenticated users, use localStorage
        if (!localOnboarded) {
          setTimeout(() => {
            setShowOnboarding(true);
            setLoading(false);
          }, 1500);
        } else {
          setLoading(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return <>{children}</>;
  }

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
