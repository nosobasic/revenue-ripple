/**
 * Authentication utilities to help manage session state and clear stale cache
 */

// Clear all authentication-related data from localStorage
export const clearAuthCache = () => {
  try {
    const keysToRemove = [];
    
    // Find all keys that might be auth-related
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('session') ||
        key.includes('supabase') ||
        key === 'revenue-ripple-auth-token'
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all auth-related keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared auth cache key: ${key}`);
    });
    
    console.log(`Cleared ${keysToRemove.length} auth cache entries`);
    return keysToRemove.length;
  } catch (error) {
    console.error('Error clearing auth cache:', error);
    return 0;
  }
};

// Check if the current session token is valid format
export const isValidSessionToken = (token) => {
  if (!token) return false;
  
  try {
    const parsed = JSON.parse(token);
    return parsed && 
           typeof parsed === 'object' && 
           parsed.access_token && 
           parsed.user;
  } catch {
    return false;
  }
};

// Force session refresh by clearing cache and reloading
export const forceSessionRefresh = () => {
  clearAuthCache();
  // Add a flag to prevent infinite reload loops
  if (!sessionStorage.getItem('session-refresh-attempted')) {
    sessionStorage.setItem('session-refresh-attempted', 'true');
    window.location.reload();
  }
};

// Clear the session refresh flag after successful login
export const clearSessionRefreshFlag = () => {
  sessionStorage.removeItem('session-refresh-attempted');
};

// Check for and resolve session conflicts
export const resolveSessionConflicts = () => {
  const token = localStorage.getItem('revenue-ripple-auth-token');
  
  if (token && !isValidSessionToken(token)) {
    console.log('Found invalid session token, clearing...');
    localStorage.removeItem('revenue-ripple-auth-token');
    return true;
  }
  
  return false;
};