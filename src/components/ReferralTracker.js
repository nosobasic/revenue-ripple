import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase/client.jsx';

export default function ReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const logReferralClick = async () => {
      const params = new URLSearchParams(location.search);
      const ref = params.get('ref');

      if (ref) {
        // Store in localStorage for later use
        localStorage.setItem('referrer', ref);

        try {
          // Log the click to Supabase
          const { data, error } = await supabase
            .from('referral_clicks')
            .insert([
              {
                referrer_username: ref,
                landing_page: location.pathname,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                utm_source: params.get('utm_source') || null,
                utm_medium: params.get('utm_medium') || null,
                utm_campaign: params.get('utm_campaign') || null
              }
            ]);

          if (error) {
            console.error('Error logging referral click:', error);
          }
        } catch (error) {
          console.error('Error logging referral click:', error);
        }
      }
    };

    logReferralClick();
  }, [location.search, location.pathname]);

  return null;
} 