/**
 * UTM Parameter Helper Utility
 * Parses UTM parameters from URL and provides utilities for tracking
 */

/**
 * Parse UTM parameters from the current URL
 * @returns {Object} Object containing UTM parameters with default values
 */
export const parseUTMParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source') || 'direct',
    utm_medium: urlParams.get('utm_medium') || 'organic',
    utm_campaign: urlParams.get('utm_campaign') || 'survival-playbook',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || ''
  };
};

/**
 * Get UTM parameters with custom defaults
 * @param {Object} defaults - Custom default values for UTM parameters
 * @returns {Object} Object containing UTM parameters
 */
export const getUTMParams = (defaults = {}) => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source') || defaults.utm_source || 'direct',
    utm_medium: urlParams.get('utm_medium') || defaults.utm_medium || 'organic',
    utm_campaign: urlParams.get('utm_campaign') || defaults.utm_campaign || 'survival-playbook',
    utm_term: urlParams.get('utm_term') || defaults.utm_term || '',
    utm_content: urlParams.get('utm_content') || defaults.utm_content || ''
  };
};

/**
 * Store UTM parameters in sessionStorage for later use
 * @param {Object} utmParams - UTM parameters to store
 */
export const storeUTMParams = (utmParams) => {
  try {
    sessionStorage.setItem('utmParams', JSON.stringify(utmParams));
  } catch (error) {
    console.warn('Failed to store UTM parameters:', error);
  }
};

/**
 * Retrieve UTM parameters from sessionStorage
 * @returns {Object|null} Stored UTM parameters or null if not found
 */
export const getStoredUTMParams = () => {
  try {
    const stored = sessionStorage.getItem('utmParams');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to retrieve UTM parameters:', error);
    return null;
  }
};

/**
 * Clear stored UTM parameters from sessionStorage
 */
export const clearStoredUTMParams = () => {
  try {
    sessionStorage.removeItem('utmParams');
  } catch (error) {
    console.warn('Failed to clear UTM parameters:', error);
  }
};

/**
 * Initialize UTM tracking - parse and store UTM parameters
 * @param {Object} defaults - Custom default values for UTM parameters
 * @returns {Object} Parsed UTM parameters
 */
export const initializeUTMTracking = (defaults = {}) => {
  const utmParams = getUTMParams(defaults);
  storeUTMParams(utmParams);
  return utmParams;
};

/**
 * Get UTM parameters for form submission
 * @param {Object} additionalParams - Additional parameters to include
 * @returns {Object} UTM parameters ready for API submission
 */
export const getUTMForSubmission = (additionalParams = {}) => {
  const stored = getStoredUTMParams();
  const current = parseUTMParams();
  
  // Use stored params if available, otherwise use current
  const utmParams = stored || current;
  
  return {
    ...utmParams,
    ...additionalParams
  };
};

/**
 * Track UTM parameters in Google Analytics (if available)
 * @param {Object} utmParams - UTM parameters to track
 */
export const trackUTMInGA = (utmParams) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      custom_map: {
        'custom_parameter_1': 'utm_source',
        'custom_parameter_2': 'utm_medium',
        'custom_parameter_3': 'utm_campaign',
        'custom_parameter_4': 'utm_term',
        'custom_parameter_5': 'utm_content'
      }
    });
    
    gtag('event', 'utm_tracking', {
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content
    });
  }
};

/**
 * Create a URL with UTM parameters
 * @param {string} baseUrl - Base URL to add UTM parameters to
 * @param {Object} utmParams - UTM parameters to add
 * @returns {string} URL with UTM parameters
 */
export const createUTMUrl = (baseUrl, utmParams) => {
  const url = new URL(baseUrl);
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
};

/**
 * Check if current page has UTM parameters
 * @returns {boolean} True if UTM parameters are present
 */
export const hasUTMParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  return utmKeys.some(key => urlParams.has(key));
};

export default {
  parseUTMParams,
  getUTMParams,
  storeUTMParams,
  getStoredUTMParams,
  clearStoredUTMParams,
  initializeUTMTracking,
  getUTMForSubmission,
  trackUTMInGA,
  createUTMUrl,
  hasUTMParams
};
