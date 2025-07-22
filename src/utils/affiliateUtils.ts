import { supabase } from '../supabase/client';

export class AffiliateUtils {
  /**
   * Extract referrer from URL parameters or localStorage
   */
  static getReferrer(): string | null {
    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get('ref');
    
    if (urlRef) {
      // Store in localStorage for later use
      localStorage.setItem('referrer', urlRef);
      return urlRef;
    }
    
    return localStorage.getItem('referrer');
  }

  /**
   * Clear stored referrer
   */
  static clearReferrer(): void {
    localStorage.removeItem('referrer');
  }

  /**
   * Log referral click
   */
  static async logReferralClick(referrerUsername: string, landingPage: string): Promise<void> {
    try {
      const params = new URLSearchParams(window.location.search);
      
      const { error } = await supabase
        .from('referral_clicks')
        .insert([
          {
            referrer_username: referrerUsername,
            landing_page: landingPage,
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

  /**
   * Generate affiliate link with proper tracking
   */
  static generateAffiliateLink(
    userId: string, 
    product?: string, 
    campaign?: string,
    baseUrl?: string
  ): string {
    const base = baseUrl || window.location.origin;
    const params = new URLSearchParams();
    
    params.set('ref', userId);
    
    if (product) {
      params.set('product', product);
    }
    
    if (campaign) {
      params.set('utm_campaign', campaign);
      params.set('utm_source', 'affiliate');
      params.set('utm_medium', 'referral');
    }

    return `${base}/?${params.toString()}`;
  }

  /**
   * Check if user has affiliate permissions
   */
  static hasAffiliatePermissions(userRole: string): boolean {
    return ['affiliate', 'reseller', 'pro_reseller', 'admin'].includes(userRole);
  }

  /**
   * Get commission rate based on user role (returns as percentage for display)
   */
  static getCommissionRate(userRole: string): number {
    switch (userRole) {
      case 'affiliate':
        return 50; // 50%
      case 'reseller':
        return 100; // 100%
      case 'pro_reseller':
        return 100; // 100% plus additional benefits
      default:
        return 0;
    }
  }

  /**
   * Get commission rate as decimal for database storage
   */
  static getCommissionRateDecimal(userRole: string): number {
    switch (userRole) {
      case 'affiliate':
        return 0.5; // 50%
      case 'reseller':
        return 1.0; // 100%
      case 'pro_reseller':
        return 1.0; // 100%
      default:
        return 0;
    }
  }

  /**
   * Validate affiliate signup data
   */
  static validateAffiliateData(data: {
    firstName: string;
    lastName: string;
    email: string;
    contactEmail: string;
    paypal: string;
    password: string;
    confirmPassword: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!data.lastName.trim()) {
      errors.push('Last name is required');
    }

    if (!data.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.push('Email is invalid');
    }

    if (!data.contactEmail.trim()) {
      errors.push('Contact email is required');
    } else if (!/\S+@\S+\.\S+/.test(data.contactEmail)) {
      errors.push('Contact email is invalid');
    }

    if (!data.paypal.trim()) {
      errors.push('PayPal email is required');
    } else if (!/\S+@\S+\.\S+/.test(data.paypal)) {
      errors.push('PayPal email is invalid');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}