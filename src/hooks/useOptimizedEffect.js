import { useEffect, useRef, useCallback, useMemo, useState, useLayoutEffect } from 'react';
import { debounce, throttle } from '../utils/performance';

/**
 * Hook for debounced effects
 */
export function useDebouncedEffect(callback, dependencies, delay = 300) {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    debouncedCallback();
  }, dependencies);
}

/**
 * Hook for throttled effects
 */
export function useThrottledEffect(callback, dependencies, limit = 300) {
  const throttledCallback = useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  );

  useEffect(() => {
    throttledCallback();
  }, dependencies);
}

/**
 * Hook for memoized async operations
 */
export function useAsyncMemo(factory, deps) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  
  useEffect(() => {
    let cancelled = false;
    
    setState(prev => ({ ...prev, loading: true }));
    
    factory()
      .then(data => {
        if (!cancelled) {
          setState({ loading: false, data, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ loading: false, data: null, error });
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, deps);
  
  return state;
}

/**
 * Hook for stable callback references
 */
export function useStableCallback(callback) {
  const callbackRef = useRef(callback);
  
  // Update the ref in a layout effect so it's updated before any child components
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback((...args) => callbackRef.current(...args), []);
}

/**
 * Hook for previous value
 */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * Hook for mount status
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return useCallback(() => isMountedRef.current, []);
}
