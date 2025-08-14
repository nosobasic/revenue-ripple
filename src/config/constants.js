// Application Configuration Constants

export const STRIPE_CONFIG = {
  PRICES: {
    TRIPWIRE: 'price_1RKIXE2Ku9STqdAdktgTsVDf',
    RESELLER: 'price_1RKNYL2Ku9STqdAd5spylthl', 
    PRO_RESELLER: 'price_1RKNpS2Ku9STqdAdLoP8qgb4',
    MEMBERSHIP: 'price_1RKP5i2Ku9STqdAdEkkGTxet'
  },
  PUBLIC_KEY: 'pk_live_51RHozW2Ku9STqdAd7SjnK80bA8oxhPHCPybzZijyDi0wnpyO1siIK4cZRHOXxTNf5t2BKamwVluDpyyehhGUaxWO00oVepQ2bf',
  AMOUNTS: {
    TRIPWIRE: 700, // $7.00 in cents
    MEMBERSHIP: 4700, // $47.00 in cents
    RESELLER: 4700, // $47.00 in cents
    PRO_RESELLER: 9700 // $97.00 in cents
  }
};

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  PAYMENT_INTENT: '/create-payment-intent',
  TRIPWIRE_SESSION: '/create-tripwire-session',
  RESELLER_SESSION: '/create-reseller-session',
  PRO_RESELLER_SESSION: '/create-pro-reseller-session',
  MEMBERSHIP_SESSION: '/create-membership-session',
  WEBHOOK: '/webhook',
  DASHBOARD: '/your-existing-api/dashboard',
  DEVOPS: {
    GENERATE_KEY: '/devops/generate-api-key',
    KEYS: '/devops/keys',
    SYNC_USERS: '/devops/sync/users',
    SYNC_REVENUE: '/devops/sync/revenue',
    SYNC_COMMISSIONS: '/devops/sync/commissions'
  }
};

export function getApiBase() {
  const explicit = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit;
  if (import.meta.env.PROD) {
    return 'https://revenue-ripple.onrender.com';
  }
  return 'http://localhost:5001';
}

export const USE_PROXY = (import.meta.env.NEXT_PUBLIC_USE_PROXY === 'true' || import.meta.env.VITE_USE_PROXY === 'true');

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  AFFILIATE: 'affiliate',
  RESELLER: 'reseller',
  PRO_RESELLER: 'pro_reseller'
};

export const SUBSCRIPTION_TIERS = {
  MEMBERSHIP: 'membership',
  RESELLER: 'reseller',
  PRO_RESELLER: 'pro_reseller'
};

export const COMMISSION_RATES = {
  STANDARD: 0.50, // 50%
  RESELLER: 0.50, // 50%
  PRO_RESELLER: 0.50 // 50%
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'revenue-ripple-auth-token',
  APP_VERSION: 'app_version',
  ONBOARDING: 'hasOnboarded',
  USER_INTENT: 'userIntent',
  REFERRER_ID: 'ref_id',
  SESSION_REFRESH: 'session-refresh-attempted'
};

export const PRODUCT_NAMES = {
  TRIPWIRE: 'digital_marketing_domination_book',
  MEMBERSHIP: 'membership_subscription',
  RESELLER: 'reseller_subscription',
  PRO_RESELLER: 'pro_reseller_subscription'
};

export const SUCCESS_URLS = {
  TRIPWIRE: 'https://revenueripple.org/tripwire-success?session_id={CHECKOUT_SESSION_ID}',
  RESELLER: 'https://revenueripple.org/reseller-success?session_id={CHECKOUT_SESSION_ID}',
  PRO_RESELLER: 'https://revenueripple.org/pro-reseller-success?session_id={CHECKOUT_SESSION_ID}',
  MEMBERSHIP: 'https://revenueripple.org/membership-success?session_id={CHECKOUT_SESSION_ID}'
};

export const CANCEL_URLS = {
  TRIPWIRE: 'https://revenueripple.org/tripwire-cancel',
  RESELLER: 'https://revenueripple.org/reseller-cancel',
  PRO_RESELLER: 'https://revenueripple.org/pro-reseller-cancel',
  MEMBERSHIP: 'https://revenueripple.org/membership-cancel'
};

export const AI_ASSISTANT_CONFIG = {
  ALLOWED_ROLES: ['member', 'affiliate', 'reseller', 'admin'],
  HELP_OFFER_INTERVAL: 30000, // 30 seconds
  MOBILE_BREAKPOINT: 768
};

export const PERFORMANCE_CONFIG = {
  LAZY_LOADING_THRESHOLD: 100, // pixels
  DEBOUNCE_DELAY: 300, // milliseconds
  CACHE_TIMEOUT: 5 * 60 * 1000 // 5 minutes
};

// Development vs Production flags
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// Logger configuration
export const logger = IS_DEVELOPMENT 
  ? console 
  : {
      log: () => {},
      warn: console.warn,
      error: console.error,
      info: () => {}
    };
