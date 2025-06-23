
import { useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;

interface CanvasMemoryStats {
  canvasCount: number;
  objectCount: number;
  memoryUsage: number;
}

export const useCanvasMemoryManager = () => {
  const canvasRegistry = useRef<Set<FabricCanvas>>(new Set());
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const registerCanvas = useCallback((canvas: FabricCanvas) => {
    canvasRegistry.current.add(canvas);
    console.log('📊 Canvas registered, total:', canvasRegistry.current.size);
  }, []);

  const unregisterCanvas = useCallback((canvas: FabricCanvas) => {
    canvasRegistry.current.delete(canvas);
    console.log('📊 Canvas unregistered, total:', canvasRegistry.current.size);
  }, []);

  const cleanupCanvas = useCallback((canvas: FabricCanvas) => {
    try {
      // Clear all objects first
      canvas.clear();
      
      // Remove event listeners
      canvas.off();
      
      // Dispose of the canvas
      canvas.dispose();
      
      // Remove from registry
      unregisterCanvas(canvas);
      
      console.log('🧹 Canvas cleaned up successfully');
    } catch (error) {
      console.error('❌ Error cleaning up canvas:', error);
    }
  }, [unregisterCanvas]);

  const scheduleCleanup = useCallback((canvas: FabricCanvas, delay: number = 1000) => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    cleanupTimeoutRef.current = setTimeout(() => {
      cleanupCanvas(canvas);
    }, delay);
  }, [cleanupCanvas]);

  const getMemoryStats = useCallback((): CanvasMemoryStats => {
    let totalObjects = 0;
    
    canvasRegistry.current.forEach(canvas => {
      try {
        totalObjects += canvas.getObjects().length;
      } catch (error) {
        console.warn('⚠️ Error counting objects in canvas:', error);
      }
    });

    // Estimate memory usage (rough calculation)
    const estimatedMemory = (canvasRegistry.current.size * 1024) + (totalObjects * 512);

    return {
      canvasCount: canvasRegistry.current.size,
      objectCount: totalObjects,
      memoryUsage: estimatedMemory
    };
  }, []);

  const forceGarbageCollection = useCallback(() => {
    // Clean up any disposed canvases that might still be in registry
    const canvasesToRemove: FabricCanvas[] = [];
    
    canvasRegistry.current.forEach(canvas => {
      try {
        // Try to access canvas properties to check if it's still valid
        canvas.getWidth();
      } catch (error) {
        // Canvas is disposed, mark for removal
        canvasesToRemove.push(canvas);
      }
    });
    
    canvasesToRemove.forEach(canvas => {
      unregisterCanvas(canvas);
    });
    
    if (canvasesToRemove.length > 0) {
      console.log('🧹 Removed', canvasesToRemove.length, 'disposed canvases from registry');
    }
    
    // Suggest garbage collection (only works in some browsers)
    if (window.gc) {
      window.gc();
      console.log('🗑️ Triggered garbage collection');
    }
  }, [unregisterCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      // Clean up all registered canvases
      canvasRegistry.current.forEach(canvas => {
        try {
          cleanupCanvas(canvas);
        } catch (error) {
          console.error('❌ Error during cleanup on unmount:', error);
        }
      });
      
      canvasRegistry.current.clear();
    };
  }, [cleanupCanvas]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      forceGarbageCollection();
      
      const stats = getMemoryStats();
      if (stats.canvasCount > 10 || stats.objectCount > 1000) {
        console.warn('⚠️ High memory usage detected:', stats);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [forceGarbageCollection, getMemoryStats]);

  return {
    registerCanvas,
    unregisterCanvas,
    cleanupCanvas,
    scheduleCleanup,
    getMemoryStats,
    forceGarbageCollection
  };
};
