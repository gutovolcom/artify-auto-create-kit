
import { useCallback, useRef, useEffect } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useCanvasOperations } from './canvas/useCanvasOperations';
import { useOptimizedImageLoader } from './useOptimizedImageLoader';
import { useDebouncedCallback } from './useDebounce';
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;

interface UseLayoutEditorPerformanceProps {
  canvas: FabricCanvas | null;
  onLayoutUpdate: (canvas: FabricCanvas) => void;
  onImageLoad?: (url: string) => void;
}

export const useLayoutEditorPerformance = ({
  canvas,
  onLayoutUpdate,
  onImageLoad
}: UseLayoutEditorPerformanceProps) => {
  
  const {
    metrics,
    measureRenderTime,
    trackCanvasOperation,
    startMonitoring,
    stopMonitoring,
    getPerformanceReport,
    resetMetrics
  } = usePerformanceMonitor({
    maxRenderTime: 20, // Layout editor can be a bit more relaxed
    maxMemoryUsage: 150 * 1024 * 1024, // 150MB for complex layouts
    minFrameRate: 25 // 25fps minimum for smooth editing
  });

  const {
    addElement,
    updateElement,
    removeElement,
    addMultipleElements,
    clearQueue,
    getQueueStats,
    processOperationQueue
  } = useCanvasOperations();

  const {
    loadImageWithProgress,
    preloadImages,
    getCacheStats: getImageCacheStats,
    clearCache: clearImageCache
  } = useOptimizedImageLoader();

  // Debounced layout update to prevent excessive re-renders
  const [debouncedLayoutUpdate] = useDebouncedCallback(
    (canvas: FabricCanvas) => {
      measureRenderTime(() => {
        onLayoutUpdate(canvas);
      });
    },
    { delay: 300, trailing: true }
  );

  // Debounced canvas operations processing
  const [debouncedProcessQueue] = useDebouncedCallback(
    (canvas: FabricCanvas) => {
      measureRenderTime(() => {
        processOperationQueue(canvas);
      });
    },
    { delay: 100, trailing: true }
  );

  // Performance-aware element addition
  const addElementPerformant = useCallback((element: any, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!canvas) return;
    
    trackCanvasOperation();
    addElement(canvas, element, priority);
    
    // Process queue with debouncing for better performance
    debouncedProcessQueue(canvas);
    debouncedLayoutUpdate(canvas);
  }, [canvas, addElement, trackCanvasOperation, debouncedProcessQueue, debouncedLayoutUpdate]);

  // Performance-aware element update
  const updateElementPerformant = useCallback((element: any, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!canvas) return;
    
    trackCanvasOperation();
    updateElement(canvas, element, priority);
    
    debouncedProcessQueue(canvas);
    debouncedLayoutUpdate(canvas);
  }, [canvas, updateElement, trackCanvasOperation, debouncedProcessQueue, debouncedLayoutUpdate]);

  // Performance-aware element removal
  const removeElementPerformant = useCallback((element: any) => {
    if (!canvas) return;
    
    trackCanvasOperation();
    removeElement(canvas, element, 'high'); // Removals are high priority
    
    debouncedProcessQueue(canvas);
    debouncedLayoutUpdate(canvas);
  }, [canvas, removeElement, trackCanvasOperation, debouncedProcessQueue, debouncedLayoutUpdate]);

  // Optimized image loading with progress
  const loadImageOptimized = useCallback(async (imageUrl: string) => {
    try {
      const img = await loadImageWithProgress(imageUrl, (progress) => {
        console.log(`🖼️ Loading image: ${progress}%`);
      });
      
      onImageLoad?.(imageUrl);
      return img;
    } catch (error) {
      console.error('Failed to load image:', error);
      throw error;
    }
  }, [loadImageWithProgress, onImageLoad]);

  // Batch operations for better performance
  const addMultipleElementsPerformant = useCallback((elements: any[]) => {
    if (!canvas || elements.length === 0) return;
    
    trackCanvasOperation();
    addMultipleElements(canvas, elements, 'low'); // Batch operations are low priority
    
    debouncedProcessQueue(canvas);
    debouncedLayoutUpdate(canvas);
  }, [canvas, addMultipleElements, trackCanvasOperation, debouncedProcessQueue, debouncedLayoutUpdate]);

  // Performance monitoring controls
  const startPerformanceMonitoring = useCallback(() => {
    console.log('🚀 Starting performance monitoring for layout editor');
    startMonitoring();
  }, [startMonitoring]);

  const stopPerformanceMonitoring = useCallback(() => {
    console.log('⏹️ Stopping performance monitoring for layout editor');
    stopMonitoring();
  }, [stopMonitoring]);

  // Get comprehensive performance stats
  const getPerformanceStats = useCallback(() => {
    const performanceReport = getPerformanceReport();
    const queueStats = getQueueStats();
    const imageCacheStats = getImageCacheStats();
    
    return {
      performance: performanceReport,
      canvasQueue: queueStats,
      imageCache: imageCacheStats,
      isOptimal: performanceReport.isPerformant && queueStats.queueLength < 10
    };
  }, [getPerformanceReport, getQueueStats, getImageCacheStats]);

  // Cleanup and optimization
  const cleanup = useCallback(() => {
    clearQueue();
    clearImageCache();
    resetMetrics();
    stopPerformanceMonitoring();
    console.log('🧹 Performance optimization cleanup completed');
  }, [clearQueue, clearImageCache, resetMetrics, stopPerformanceMonitoring]);

  // Auto-start monitoring when canvas is ready
  useEffect(() => {
    if (canvas) {
      startPerformanceMonitoring();
      return () => {
        stopPerformanceMonitoring();
      };
    }
  }, [canvas, startPerformanceMonitoring, stopPerformanceMonitoring]);

  return {
    // Performance-optimized operations
    addElementPerformant,
    updateElementPerformant,
    removeElementPerformant,
    addMultipleElementsPerformant,
    loadImageOptimized,
    
    // Performance monitoring
    metrics,
    getPerformanceStats,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    
    // Cleanup
    cleanup
  };
};
