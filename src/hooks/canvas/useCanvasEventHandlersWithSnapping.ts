
import { useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { serializeCanvasLayout } from '@/components/layout-editor/layoutSerializer';
import { constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';
import { useCanvasSnapping } from '@/hooks/useCanvasSnapping';

type FabricCanvas = fabric.Canvas;

interface UseCanvasEventHandlersWithSnappingProps {
  scale: number;
  setLayoutDraft: (draft: any[]) => void;
}

// Format-specific margin calculation based on canvas dimensions
const getConstraintMargin = (format: string): number => {
  const dimensions = getFormatDimensions(format);
  const area = dimensions.width * dimensions.height;
  
  if (area < 60000) {
    return 2;
  }
  
  if (area < 500000) {
    return 5;
  }
  
  return 10;
};

// Check if format should skip real-time constraining
const shouldSkipRealTimeConstraining = (format: string): boolean => {
  return format === 'bannerGCO';
};

export const useCanvasEventHandlersWithSnapping = ({
  scale,
  setLayoutDraft
}: UseCanvasEventHandlersWithSnappingProps) => {
  const eventListenersAttachedRef = useRef(false);
  const { 
    initializeGuides, 
    applySnapping, 
    clearGuides, 
    isEnabled: isSnappingEnabled 
  } = useCanvasSnapping();

  const updateLayoutDraft = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    const elements = serializeCanvasLayout(fabricCanvas, scale, format);
    setLayoutDraft(elements);
    console.log("📝 Layout updated with snapping support for format:", format, elements.length, "elements");
  }, [scale, setLayoutDraft]);

  const setupCanvasEventListeners = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    if (eventListenersAttachedRef.current) {
      console.log('⚠️ Event listeners already attached, skipping');
      return;
    }

    // Initialize snapping guides
    initializeGuides(fabricCanvas);

    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:moving');
    fabricCanvas.off('object:scaling');

    const handleElementMoving = (e: fabric.ModifiedEvent) => {
      const obj = e.target;
      if (!obj || !format) return;

      // Apply snapping if enabled
      if (isSnappingEnabled) {
        const currentPointer = { x: obj.left || 0, y: obj.top || 0 };
        const snappedPosition = applySnapping(fabricCanvas, obj, currentPointer);
        
        obj.set({
          left: snappedPosition.x,
          top: snappedPosition.y
        });
      }

      // Apply boundary constraints (existing logic)
      if (!shouldSkipRealTimeConstraining(format)) {
        const unscaledX = (obj.left || 0) / scale;
        const unscaledY = (obj.top || 0) / scale;
        const objWidth = ((obj.width || 100) * (obj.scaleX || 1));
        const objHeight = ((obj.height || 50) * (obj.scaleY || 1));

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
          console.log(`🚧 Element constrained to boundaries with ${constraintMargin}px margin:`, constrained.position);
        }
      }

      fabricCanvas.renderAll();
    };

    const handleElementChange = (e: fabric.ModifiedEvent) => {
      const obj = e.target;
      if (!obj || !format) {
        updateLayoutDraft(fabricCanvas, format);
        return;
      }

      // Clear guides when movement ends
      clearGuides();

      // Apply final constraints for non-bannerGCO formats
      if (!shouldSkipRealTimeConstraining(format)) {
        const unscaledX = (obj.left || 0) / scale;
        const unscaledY = (obj.top || 0) / scale;
        const objWidth = ((obj.width || 100) * (obj.scaleX || 1));
        const objHeight = ((obj.height || 50) * (obj.scaleY || 1));

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
        }
      }

      updateLayoutDraft(fabricCanvas, format);
    };

    fabricCanvas.on('object:modified', handleElementChange);
    fabricCanvas.on('object:moving', handleElementMoving);
    fabricCanvas.on('object:scaling', handleElementChange);

    // Clear guides when selection changes
    fabricCanvas.on('selection:cleared', () => {
      clearGuides();
    });

    // Clear guides when clicking empty space
    fabricCanvas.on('mouse:down', (e) => {
      if (!e.target) {
        clearGuides();
      }
    });

    eventListenersAttachedRef.current = true;
    console.log(`✅ Enhanced canvas event listeners setup with snapping for ${format}`);
  }, [scale, updateLayoutDraft, initializeGuides, applySnapping, clearGuides, isSnappingEnabled]);

  const clearEventListeners = useCallback(() => {
    eventListenersAttachedRef.current = false;
    clearGuides();
  }, [clearGuides]);

  return {
    setupCanvasEventListeners,
    updateLayoutDraft,
    clearEventListeners
  };
};
