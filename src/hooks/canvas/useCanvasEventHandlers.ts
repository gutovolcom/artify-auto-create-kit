
import { useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { serializeCanvasLayout } from '@/components/layout-editor/layoutSerializer';
import { constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';
import { useDebounce } from '@/hooks/useDebounce';

type FabricCanvas = fabric.Canvas;

interface UseCanvasEventHandlersProps {
  scale: number;
  setLayoutDraft: (draft: any[]) => void;
}

// Format-specific margin calculation based on canvas dimensions
const getConstraintMargin = (format: string): number => {
  const dimensions = getFormatDimensions(format);
  const area = dimensions.width * dimensions.height;
  
  // For very small formats like bannerGCO (255x192 = 48,960), use minimal margins
  if (area < 60000) {
    return 2; // Much smaller margin for tiny formats
  }
  
  // For medium formats, use moderate margins
  if (area < 500000) {
    return 5;
  }
  
  // For large formats, use standard margins
  return 10;
};

// Check if format should skip real-time constraining to preserve user positioning
const shouldSkipRealTimeConstraining = (format: string): boolean => {
  // CRITICAL FIX: Add LP and destaque to prevent real-time position drift
  return format === 'bannerGCO' || format === 'destaque' || format === 'LP';
};

export const useCanvasEventHandlers = ({
  scale,
  setLayoutDraft
}: UseCanvasEventHandlersProps) => {
  const eventListenersAttachedRef = useRef(false);
  const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // CRITICAL FIX: Debounced update to prevent too many rapid updates during dragging
  const updateLayoutDraft = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    // Clear any pending update
    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
    }
    
    // Immediate update for critical operations, debounced for frequent operations
    const performUpdate = () => {
      const elements = serializeCanvasLayout(fabricCanvas, scale, format);
      setLayoutDraft(elements);
      console.log("📝 Layout updated with boundary validation for format:", format, elements.length, "elements");
      pendingUpdateRef.current = null;
    };
    
    // Small debounce to prevent excessive updates during dragging
    pendingUpdateRef.current = setTimeout(performUpdate, 50);
  }, [scale, setLayoutDraft]);

  // Immediate update for critical operations (like save)
  const updateLayoutDraftImmediate = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    
    const elements = serializeCanvasLayout(fabricCanvas, scale, format);
    setLayoutDraft(elements);
    console.log("📝 Layout updated IMMEDIATELY for format:", format, elements.length, "elements");
  }, [scale, setLayoutDraft]);

  const setupCanvasEventListeners = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    if (eventListenersAttachedRef.current) {
      console.log('⚠️ Event listeners already attached, skipping');
      return;
    }

    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:moving');
    fabricCanvas.off('object:scaling');

    const handleElementChange = (e: fabric.ModifiedEvent) => {
      const obj = e.target;
      if (!obj || !format) {
        updateLayoutDraft(fabricCanvas, format);
        return;
      }

      // Skip real-time constraining for bannerGCO to prevent positioning issues
      if (shouldSkipRealTimeConstraining(format)) {
        console.log(`🎯 [${format}] Skipping real-time constraining to preserve user positioning`);
        updateLayoutDraft(fabricCanvas, format);
        return;
      }

      const unscaledX = (obj.left || 0) / scale;
      const unscaledY = (obj.top || 0) / scale;
      const objWidth = ((obj.width || 100) * (obj.scaleX || 1));
      const objHeight = ((obj.height || 50) * (obj.scaleY || 1));

      // Use format-specific constraint margin for other formats
      const constraintMargin = getConstraintMargin(format);
      
      const constrained = constrainToCanvas(
        {
          position: { x: unscaledX, y: unscaledY },
          size: { width: objWidth / scale, height: objHeight / scale }
        },
        format,
        constraintMargin
      );

      if (constrained.position.x !== unscaledX || constrained.position.y !== unscaledY) {
        obj.set({
          left: constrained.position.x * scale,
          top: constrained.position.y * scale
        });
        fabricCanvas.renderAll();
        console.log(`🚧 Element constrained to boundaries with ${constraintMargin}px margin:`, constrained.position);
      }

      updateLayoutDraft(fabricCanvas, format);
    };

    fabricCanvas.on('object:modified', handleElementChange);
    fabricCanvas.on('object:moving', handleElementChange);
    fabricCanvas.on('object:scaling', handleElementChange);

    eventListenersAttachedRef.current = true;
    console.log(`✅ Canvas event listeners setup ${shouldSkipRealTimeConstraining(format || '') ? 'WITHOUT' : 'with'} boundary validation for ${format}`);
  }, [scale, updateLayoutDraft]);

  const clearEventListeners = useCallback(() => {
    eventListenersAttachedRef.current = false;
  }, []);

  return {
    setupCanvasEventListeners,
    updateLayoutDraft,
    updateLayoutDraftImmediate,
    clearEventListeners
  };
};
