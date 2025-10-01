// Performance monitoring and optimization utilities

import { PERFORMANCE_CONFIG, logger } from '../config/constants';

/**
 * Performance monitoring utility class
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isSupported = typeof window !== 'undefined' && 'performance' in window;
  }

  /**
   * Start timing a performance metric
   */
  startTiming(name) {
    if (!this.isSupported) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  /**
   * End timing and log the result
   */
  endTiming(name) {
    if (!this.isSupported || !this.metrics.has(name)) return;
    
    const metric = this.metrics.get(name);
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    logger.info(`Performance: ${name} took ${metric.duration.toFixed(2)}ms`);
    
    // Log slow operations in development
    if (metric.duration > 1000 && process.env.NODE_ENV === 'development') {
      logger.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }
    
    return metric.duration;
  }

  /**
   * Measure a function execution time
   */
  async measure(name, fn) {
    this.startTiming(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endTiming(name);
    }
  }

  /**
   * Monitor Web Vitals
   */
  initWebVitals() {
    if (!this.isSupported) return;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        logger.info(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      
      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        logger.warn('LCP observer not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          logger.info(`FID: ${entry.processingStart - entry.startTime}ms`);
        }
      });
      
      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        logger.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        logger.info(`CLS: ${clsValue.toFixed(4)}`);
      });
      
      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        logger.warn('CLS observer not supported');
      }
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          logger.info('Navigation Timing:', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            loadComplete: navigation.loadEventEnd - navigation.navigationStart,
            domInteractive: navigation.domInteractive - navigation.navigationStart
          });
        }
      }, 0);
    });
  }

  /**
   * Monitor resource loading
   */
  monitorResources() {
    if (!this.isSupported) return;

    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        logger.warn('Slow resources detected:', slowResources.map(r => ({
          name: r.name,
          duration: r.duration.toFixed(2)
        })));
      }
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    const metrics = {};
    for (const [name, data] of this.metrics.entries()) {
      metrics[name] = data;
    }
    return metrics;
  }

  /**
   * Clean up observers
   */
  disconnect() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

/**
 * Debounce function to limit expensive operations
 */
export function debounce(func, wait = PERFORMANCE_CONFIG.DEBOUNCE_DELAY) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle(func, limit = PERFORMANCE_CONFIG.DEBOUNCE_DELAY) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Simple memoization utility
 */
export function memoize(fn, keyGenerator = JSON.stringify) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = keyGenerator(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    rootMargin: `${PERFORMANCE_CONFIG.LAZY_LOADING_THRESHOLD}px`,
    threshold: 0.1,
    ...options
  };

  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, defaultOptions);
  }
  
  return null;
}

/**
 * Report errors and performance issues
 */
export function reportError(error, context = {}) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    context
  };

  logger.error('Error reported:', errorReport);
  
  // In production, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Bundle analyzer helper (development only)
 */
export function analyzeBundle() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const scripts = Array.from(document.scripts);
  const totalSize = scripts.reduce((size, script) => {
    if (script.src && script.src.includes('assets')) {
      // This is a rough estimate
      return size + 1;
    }
    return size;
  }, 0);
  
  logger.info(`Estimated bundle count: ${totalSize} chunks`);
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.initWebVitals();
  performanceMonitor.monitorResources();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.disconnect();
  });
}
