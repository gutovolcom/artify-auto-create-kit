
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

  // Calculate snap position for an object
  const getSnapPosition = useCallback((
    canvas: fabric.Canvas,
    object: fabric.Object
  ) => {
    if (!config.enabled) return null;

    const snapPoints = getCanvasSnapPoints(canvas, object);
    const snapResult = calculateSnapPosition(object, snapPoints, config.threshold);

    // Show guides if enabled
    if (config.showGuides && alignmentGuidesRef.current && snapResult.guides.length > 0) {
      alignmentGuidesRef.current.showGuides(snapResult.guides);
    }

    return snapResult;
  }, [config]);

  // Apply snapping to an object's position
  const applySnapping = useCallback((
    canvas: fabric.Canvas,
    object: fabric.Object,
    pointer: { x: number; y: number }
  ) => {
    if (!config.enabled) return pointer;

    // Temporarily set object position to calculate snapping
    const originalLeft = object.left;
    const originalTop = object.top;
    
    object.set({ left: pointer.x, top: pointer.y });
    
    const snapResult = getSnapPosition(canvas, object);
    
    // Restore original position
    object.set({ left: originalLeft, top: originalTop });

    if (snapResult && (snapResult.snapX !== undefined || snapResult.snapY !== undefined)) {
      return {
        x: snapResult.snapX !== undefined ? snapResult.snapX : pointer.x,
        y: snapResult.snapY !== undefined ? snapResult.snapY : pointer.y
      };
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
  }, []);

  // Toggle snapping on/off
  const toggleSnapping = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
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
