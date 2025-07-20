import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AffiliateUtils } from '../utils/affiliateUtils';

export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    const trackReferral = async () => {
      const referrer = AffiliateUtils.getReferrer();
      
      if (referrer) {
        // Log the referral click
        await AffiliateUtils.logReferralClick(referrer, location.pathname);
        
        // Store in session for checkout process
        sessionStorage.setItem('ref_id', referrer);
      }
    };

    trackReferral();
  }, [location.search, location.pathname]);

  return {
    getReferrer: AffiliateUtils.getReferrer,
    clearReferrer: AffiliateUtils.clearReferrer
  };
}