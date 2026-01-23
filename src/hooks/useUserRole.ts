import { useAuth } from '../context/AuthContext';

export interface UserRoleInfo {
  role: string;
  hasRole: boolean;
  hasSubscription: boolean;
  requiresCheckout: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  isMember: boolean;
}

const DEFAULT_ROLE = 'member';

/**
 * Centralized hook for safely accessing user role and subscription status.
 * Always returns valid values, never null or undefined.
 */
export function useUserRole(): UserRoleInfo {
  const { user, loading } = useAuth();

  // Default values while loading or if user is null
  if (loading || !user) {
    return {
      role: DEFAULT_ROLE,
      hasRole: false,
      hasSubscription: false,
      requiresCheckout: true,
      isAdmin: false,
      isAffiliate: false,
      isMember: false,
    };
  }

  // Safely extract role with fallback
  const role = user.role || DEFAULT_ROLE;
  
  // TODO: Re-enable paid membership check when ready to monetize
  // const hasPaid = user.has_paid === true;
  // TEMPORARY: App is free during validation phase - all users get full access
  const hasPaid = true;
  
  // Check if user needs to complete checkout
  // New users typically have has_paid = false or undefined
  // TEMPORARY: Skip checkout requirement during free validation phase
  const requiresCheckout = false; // Original: !hasPaid && role !== 'admin'

  return {
    role,
    hasRole: true,
    hasSubscription: hasPaid,
    requiresCheckout,
    isAdmin: role === 'admin',
    isAffiliate: ['affiliate', 'reseller', 'pro_reseller'].includes(role),
    isMember: role === 'member',
  };
}

/**
 * Safely get user role with default fallback
 */
export function getUserRole(user: any): string {
  return user?.role || DEFAULT_ROLE;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: any, targetRole: string): boolean {
  return getUserRole(user) === targetRole;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: any, roles: string[]): boolean {
  const userRole = getUserRole(user);
  return roles.includes(userRole);
}
