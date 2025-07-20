export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'member' | 'affiliate' | 'reseller' | 'pro_reseller';
  status: 'active' | 'inactive' | 'suspended';
  plan?: string;
  username?: string;
  commision_rate?: number; // Note: matches your DB column name (missing 's')
  phone?: string;
  company?: string;
  bio?: string;
  created_at?: string;
}

export interface Commission {
  id?: string;
  referrer_username: string;
  email: string;
  tier: string;
  amount: number;
  commission: number;
  timestamp?: string;
}

export interface Subscription {
  id?: string;
  email: string;
  amount: number;
  referrer_username?: string;
  tier: string;
  subscribed_at?: string;
}

export interface TripwirePurchase {
  id?: string;
  email: string;
  amount: number;
  referrer_username?: string;
  purchased_at?: string;
}

export interface CourseProgress {
  id?: string;
  user_id: string;
  course_slug: string;
  module_id?: string;
  completed_modules: string[];
  progress_percentage: number;
  last_accessed?: string;
  completed_at?: string;
}

export interface ReferralClick {
  id?: string;
  referrer_username: string;
  landing_page: string;
  timestamp: string;
  user_agent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}