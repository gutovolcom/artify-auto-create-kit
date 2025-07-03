
import { useState, useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { AlignmentGuides } from '@/utils/canvas/alignmentGuides';
import { getCanvasSnapPoints, calculateSnapPosition, SNAP_THRESHOLD } from '@/utils/canvas/snappingUtils';

interface SnappingConfig {
  enabled: boolean;
  threshold: number;
  showGuides: boolean;
  snapToObjects: boolean;
  snapToCanvas: boolean;
}

export const useCanvasSnapping = () => {
  const [config, setConfig] = useState<SnappingConfig>({
    enabled: true,
    threshold: SNAP_THRESHOLD,
    showGuides: true,
    snapToObjects: true,
    snapToCanvas: true
  });

  const alignmentGuidesRef = useRef<AlignmentGuides | null>(null);

  // Initialize alignment guides for a canvas
  const initializeGuides = useCallback((canvas: fabric.Canvas) => {
    if (!alignmentGuidesRef.current) {
      alignmentGuidesRef.current = new AlignmentGuides(canvas);
    }
  }, []);

  // Calculate snap position for an object with improved logic
  const getSnapPosition = useCallback((
    canvas: fabric.Canvas,
    object: fabric.Object
  ) => {
    if (!config.enabled) return null;

    const snapPoints = getCanvasSnapPoints(canvas, object);
    const snapResult = calculateSnapPosition(object, snapPoints, config.threshold);

    // Show guides if enabled and there are guides to show
    if (config.showGuides && alignmentGuidesRef.current && snapResult.guides.length > 0) {
      alignmentGuidesRef.current.showGuides(snapResult.guides);
    }

    return snapResult;
  }, [config]);

  // Apply snapping to an object's position with improved algorithm
  const applySnapping = useCallback((
    canvas: fabric.Canvas,
    object: fabric.Object,
    pointer: { x: number; y: number }
  ) => {
    if (!config.enabled) return pointer;

    // Store original position
    const originalLeft = object.left;
    const originalTop = object.top;
    
    // Temporarily set object position to calculate snapping
    object.set({ left: pointer.x, top: pointer.y });
    
    const snapResult = getSnapPosition(canvas, object);
    
    // Restore original position immediately
    object.set({ left: originalLeft, top: originalTop });

    // Return snapped position if snapping occurred
    if (snapResult && (snapResult.snapX !== undefined || snapResult.snapY !== undefined)) {
      const snappedX = snapResult.snapX !== undefined ? snapResult.snapX : pointer.x;
      const snappedY = snapResult.snapY !== undefined ? snapResult.snapY : pointer.y;
      
      // Only apply if the snap distance is reasonable (avoid micro-snaps)
      const snapDistanceX = Math.abs(snappedX - pointer.x);
      const snapDistanceY = Math.abs(snappedY - pointer.y);
      
      if (snapDistanceX <= config.threshold || snapDistanceY <= config.threshold) {
        return { x: snappedX, y: snappedY };
      }
    }

    return pointer;
  }, [config, getSnapPosition]);

  // Clear alignment guides
  const clearGuides = useCallback(() => {
    if (alignmentGuidesRef.current) {
      alignmentGuidesRef.current.clearGuides();
    }
  }, []);

  // Update snapping configuration
  const updateConfig = useCallback((newConfig: Partial<SnappingConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    console.log('🧲 Snapping config updated:', newConfig);
  }, []);

  // Toggle snapping on/off
  const toggleSnapping = useCallback(() => {
    setConfig(prev => {
      const newEnabled = !prev.enabled;
      console.log(`🧲 Snapping ${newEnabled ? 'enabled' : 'disabled'}`);
      return { ...prev, enabled: newEnabled };
    });
  }, []);

  return {
    config,
    updateConfig,
    toggleSnapping,
    initializeGuides,
    getSnapPosition,
    applySnapping,
    clearGuides,
    isEnabled: config.enabled
  };
};
