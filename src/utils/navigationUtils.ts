import { User } from '../types/user';
import { getUserRole } from '../hooks/useUserRole';

export class NavigationUtils {
  /**
   * Get dashboard route based on user role
   */
  static getDashboardRoute(user: User | null): string {
    if (!user) return '/login';

    const role = getUserRole(user);
    
    switch (role) {
      case 'admin':
        return '/admin';
      case 'affiliate':
      case 'reseller':
      case 'pro_reseller':
        return '/affiliate-centre';
      case 'member':
      default:
        return '/dashboard';
    }
  }

  /**
   * Get redirect URL after successful payment based on subscription type
   */
  static getPostPaymentRedirect(subscriptionType: string, userRole?: string): string {
    switch (subscriptionType) {
      case 'tripwire':
      case 'digital_marketing_domination_book':
        return '/tripwire-success';
      case 'membership_subscription':
        return '/dashboard';
      case 'reseller_subscription':
        return '/reseller-success';
      case 'pro_reseller_subscription':
        return '/affiliate-centre';
      default:
        return '/dashboard';
    }
  }

  /**
   * Check if user has access to specific route
   */
  static hasRouteAccess(user: User | null, route: string, requireAdmin: boolean = false): boolean {
    if (!user) return false;

    const role = getUserRole(user);

    if (requireAdmin) {
      return role === 'admin';
    }

    // Check specific route permissions
    if (route.startsWith('/admin')) {
      return role === 'admin';
    }

    if (route.startsWith('/affiliate-centre') || route.includes('affiliate')) {
      return ['affiliate', 'reseller', 'pro_reseller', 'admin'].includes(role);
    }

    if (route.includes('reseller') && !route.includes('affiliate')) {
      return ['reseller', 'pro_reseller', 'admin'].includes(role);
    }

    // Default: all authenticated users have access
    return true;
  }

  /**
   * Redirect user based on their role and intended destination
   */
  static getIntendedRedirect(user: User | null, intendedPath: string): string {
    if (!user) return '/login';

    // If user doesn't have access to intended path, redirect to their default dashboard
    if (!this.hasRouteAccess(user, intendedPath)) {
      return this.getDashboardRoute(user);
    }

    return intendedPath;
  }

  /**
   * Check if user should see affiliate/reseller tabs
   */
  static shouldShowAffiliateTab(user: User | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    return ['affiliate', 'reseller', 'pro_reseller', 'admin'].includes(role);
  }

  /**
   * Get appropriate funnel step based on user state and subscription
   */
  static getNextFunnelStep(
    currentStep: string,
    userRole?: string,
    hasCompletedPayment: boolean = false
  ): string | null {
    // Define funnel flow
    const funnelSteps = {
      'tripwire': hasCompletedPayment ? 'membership-upsell' : null,
      'membership-upsell': hasCompletedPayment ? 'reseller-upsell' : null,
      'reseller-upsell': hasCompletedPayment ? 'pro-reseller-upsell' : null,
      'pro-reseller-upsell': hasCompletedPayment ? 'dashboard' : null
    };

    return funnelSteps[currentStep] || null;
  }

  /**
   * Generate proper affiliate signup redirect URL
   */
  static getAffiliateSignupUrl(): string {
    return '/affiliate/sign-up';
  }

  /**
   * Check if redirect should be automatic or require user action
   */
  static shouldAutoRedirect(fromStep: string, toStep: string): boolean {
    // Never auto-redirect to payment pages
    const paymentSteps = ['membership-upsell', 'reseller-upsell', 'pro-reseller-upsell'];
    if (paymentSteps.includes(toStep)) {
      return false;
    }

    // Auto-redirect after successful payments to success pages
    const successPages = ['tripwire-success', 'reseller-success', 'dashboard'];
    return successPages.includes(toStep);
  }
}