import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide fallback values to prevent crashes
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using fallback configuration:', {
    VITE_SUPABASE_URL: supabaseUrl || 'NOT_SET',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '***' : 'NOT_SET'
  });
}

export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'revenue-ripple-auth-token',
    flowType: 'pkce', // Use PKCE flow for better security
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          // Clear corrupted storage
          localStorage.removeItem(key);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
          // If storage is full, try to clear old data
          if (error.name === 'QuotaExceededError') {
            try {
              localStorage.clear();
              localStorage.setItem(key, JSON.stringify(value));
            } catch (clearError) {
              console.error('Could not clear localStorage:', clearError);
            }
          }
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    },
  },
  // Reduce timeout for better performance
  global: {
    headers: {
      'X-Client-Info': 'revenue-ripple-web'
    }
  }
});