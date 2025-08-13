import React, { memo, useMemo, useCallback, useState } from 'react';
import { performanceMonitor } from '../utils/performance';

/**
 * Higher-order component for performance optimization
 */
export function withPerformanceOptimization(WrappedComponent, options = {}) {
  const {
    memoize = true,
    measureRender = false,
    displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  } = options;

  const OptimizedComponent = (props) => {
    // Measure render time if enabled
    if (measureRender) {
      performanceMonitor.startTiming(`${displayName}-render`);
    }

    // Memoize expensive props computations
    const memoizedProps = useMemo(() => {
      if (measureRender) {
        performanceMonitor.endTiming(`${displayName}-render`);
      }
      return props;
    }, [props]);

    return <WrappedComponent {...memoizedProps} />;
  };

  // Apply React.memo if requested
  const FinalComponent = memoize ? memo(OptimizedComponent) : OptimizedComponent;
  
  FinalComponent.displayName = `withPerformanceOptimization(${displayName})`;
  
  return FinalComponent;
}

/**
 * Hook for performance-optimized event handlers
 */
export function useOptimizedHandlers(handlers, dependencies = []) {
  return useMemo(() => {
    const optimizedHandlers = {};
    
    Object.keys(handlers).forEach(key => {
      optimizedHandlers[key] = useCallback(handlers[key], dependencies);
    });
    
    return optimizedHandlers;
  }, [...dependencies, handlers]);
}

/**
 * Hook for heavy computations
 */
export function useHeavyComputation(computeFn, dependencies, fallback = null) {
  return useMemo(() => {
    const startTime = performance.now();
    
    try {
      const result = computeFn();
      const duration = performance.now() - startTime;
      
      if (duration > 16) { // More than one frame (16ms)
        console.warn(`Heavy computation detected: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      console.error('Heavy computation failed:', error);
      return fallback;
    }
  }, dependencies);
}

/**
 * Component for virtualized lists (basic implementation)
 */
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 50, 
  containerHeight = 400,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      items.length,
      start + Math.ceil(containerHeight / itemHeight) + overscan
    );
    
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';
