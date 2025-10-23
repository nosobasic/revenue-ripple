// Application Configuration Constants

export const STRIPE_CONFIG = {
  PRICES: {
    TRIPWIRE: 'price_1RKIXE2Ku9STqdAdktgTsVDf', // TODO: Replace with test mode price ID if using test keys
    RESELLER: 'price_1RKNYL2Ku9STqdAd5spylthl', 
    PRO_RESELLER: 'price_1RKNpS2Ku9STqdAdLoP8qgb4',
    MEMBERSHIP: 'price_1RKP5i2Ku9STqdAdEkkGTxet',
    FOUNDERS_ANNUAL: 'price_1SBguk2Ku9STqdAdNBuZcJst' // Founders Annual $470/year
  },
  PUBLIC_KEY: 'pk_live_51RHozW2Ku9STqdAd7SjnK80bA8oxhPHCPybzZijyDi0wnpyO1siIK4cZRHOXxTNf5t2BKamwVluDpyyehhGUaxWO00oVepQ2bf',
  AMOUNTS: {
    TRIPWIRE: 700, // $7.00 in cents
    MEMBERSHIP: 4700, // $47.00 in cents
    RESELLER: 4700, // $47.00 in cents
    PRO_RESELLER: 9700, // $97.00 in cents
    FOUNDERS_ANNUAL: 47000 // $470.00 in cents
  }
};

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  PAYMENT_INTENT: '/create-payment-intent',
  TRIPWIRE_SESSION: '/create-tripwire-session',
  RESELLER_SESSION: '/create-reseller-session',
  PRO_RESELLER_SESSION: '/create-pro-reseller-session',
  MEMBERSHIP_SESSION: '/create-membership-session',
  FOUNDERS_ANNUAL_SESSION: '/create-founders-annual-session',
  FOUNDERS_MONTHLY_SESSION: '/create-founders-monthly-session',
  WEBHOOK: '/webhook',
  DASHBOARD: '/your-existing-api/dashboard',
  DEVOPS: {
    GENERATE_KEY: '/devops/generate-api-key',
    KEYS: '/devops/keys',
    SYNC_USERS: '/devops/sync/users',
    SYNC_REVENUE: '/devops/sync/revenue',
    SYNC_COMMISSIONS: '/devops/sync/commissions'
  },
  FOUNDERS: {
    SPOTS_REMAINING: '/api/founders-spots-remaining',
    TIMER_START: '/api/founders-timer-start',
    TIMER_CHECK: '/api/founders-timer-check'
  }
};

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

// Founders Annual Configuration
export const FOUNDERS_ANNUAL_CONFIG = {
  TOTAL_SPOTS: 20,
  TIMER_DAYS: 3,
  GUARANTEE_DAYS: 60,
  ANNUAL_PRICE: 470,
  MONTHLY_PRICE: 47,
  SAVINGS: 94,
  MONTHLY_EQUIVALENT: 39.17, // $470/12 months
  DISCORD_LINK: 'https://discord.gg/q2b6BDtsyr',
  VAULT_LINK: 'https://drive.google.com/drive/folders/1aS63PgzZglC-rQdN4-rYtGYp6legYnWn?usp=drive_link',
  CALENDLY_LINK: 'https://calendly.com/donte-binrichmediagroup/30min',
  BONUSES: [
    {
      icon: '🎯',
      title: '1-on-1 Onboarding Call',
      description: 'Personal strategy session to map your path to your first win'
    },
    {
      icon: '💬',
      title: 'Private Founders Discord',
      description: 'Exclusive community for plotting, organizing, and sharing resources'
    },
    {
      icon: '📚',
      title: 'Founders Vault Access',
      description: '4 comprehensive playbooks: Leads, Sales, Delivery, and Profit systems'
    },
    {
      icon: '⚡',
      title: 'Early Access to New Features',
      description: 'Be first to test and benefit from new platform features'
    },
    {
      icon: '🔒',
      title: 'Locked-In Pricing Forever',
      description: 'Your $470/year rate is guaranteed for life'
    },
    {
      icon: '✅',
      title: '60-Day Money-Back Guarantee',
      description: 'Full refund if you\'re not completely satisfied'
    }
  ],
  MARKETING_COPY: {
    HEADLINE: 'Join the Founders Circle',
    SUBHEADLINE: 'Limited to 20 Members - Lock In Your Lifetime Rate',
    TAGLINE: 'Buy 10 Months, Get 2 Free',
    CTA_PRIMARY: 'Secure Your Founder Spot',
    CTA_SECONDARY: 'Join the Founders Circle',
    URGENCY_TEXT: 'Only {count} of 20 spots remaining',
    TIMER_TEXT: 'Your exclusive access expires in {time}',
    SOLD_OUT_TEXT: 'Founders Circle is Full - Join Waitlist'
  }
};
