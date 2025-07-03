
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

const shouldSkipRealTimeConstraining = (format: string): boolean => {
  return format === 'bannerGCO';
};

export const useCanvasEventHandlersWithSnapping = ({
  scale,
  setLayoutDraft
}: UseCanvasEventHandlersWithSnappingProps) => {
  const eventListenersAttachedRef = useRef(false);
  const isDraggingRef = useRef(false);
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

    console.log('✅ Setting up enhanced canvas event listeners with snapping for', format);

    // Initialize snapping guides
    initializeGuides(fabricCanvas);

    // Clear existing listeners to avoid conflicts
    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:moving');
    fabricCanvas.off('object:scaling');
    fabricCanvas.off('mouse:down');
    fabricCanvas.off('mouse:up');

    // Track dragging state
    const handleMouseDown = (e: fabric.TEvent) => {
      if (e.target) {
        isDraggingRef.current = true;
        console.log('🖱️ Started dragging element');
      }
    };

    const handleMouseUp = (e: fabric.TEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        clearGuides();
        console.log('🖱️ Finished dragging element');
      }
    };

    const handleElementMoving = (e: fabric.ModifiedEvent) => {
      const obj = e.target;
      if (!obj || !format || !isDraggingRef.current) return;

      // Apply snapping only during active dragging and if enabled
      if (isSnappingEnabled && isDraggingRef.current) {
        const currentPointer = { x: obj.left || 0, y: obj.top || 0 };
        const snappedPosition = applySnapping(fabricCanvas, obj, currentPointer);
        
        // Only apply snapping if there's a significant change (avoid micro-movements)
        const deltaX = Math.abs(snappedPosition.x - currentPointer.x);
        const deltaY = Math.abs(snappedPosition.y - currentPointer.y);
        
        if (deltaX > 1 || deltaY > 1) {
          obj.set({
            left: snappedPosition.x,
            top: snappedPosition.y
          });
          console.log('🧲 Applied snapping:', { from: currentPointer, to: snappedPosition });
        }
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
        }
      }

      obj.setCoords();
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

    // Enhanced keyboard handler with snapping support
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = fabricCanvas.getActiveObject();
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (activeObject) {
          e.preventDefault();
          
          const step = e.shiftKey ? 10 : 1;
          const currentLeft = activeObject.left || 0;
          const currentTop = activeObject.top || 0;
          let newLeft = currentLeft;
          let newTop = currentTop;
          
          switch (e.key) {
            case 'ArrowLeft':
              newLeft = Math.max(0, currentLeft - step);
              break;
            case 'ArrowRight':
              newLeft = currentLeft + step;
              break;
            case 'ArrowUp':
              newTop = Math.max(0, currentTop - step);
              break;
            case 'ArrowDown':
              newTop = currentTop + step;
              break;
          }
          
          // Apply snapping to keyboard movement if enabled
          if (isSnappingEnabled) {
            activeObject.set({ left: newLeft, top: newTop });
            const snappedPosition = applySnapping(fabricCanvas, activeObject, { x: newLeft, y: newTop });
            newLeft = snappedPosition.x;
            newTop = snappedPosition.y;
          }
          
          activeObject.set({
            left: newLeft,
            top: newTop
          });
          
          activeObject.setCoords();
          fabricCanvas.fire('object:modified', { target: activeObject });
          fabricCanvas.renderAll();
          
          // Clear guides after a short delay for keyboard movement
          setTimeout(() => clearGuides(), 1000);
          
          console.log(`⌨️ Moved element by ${step}px with arrow keys (snapping: ${isSnappingEnabled ? 'on' : 'off'})`);
        }
      }
    };

    // Attach event listeners
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.on('object:modified', handleElementChange);
    fabricCanvas.on('object:moving', handleElementMoving);
    fabricCanvas.on('object:scaling', handleElementChange);

    // Clear guides when selection changes
    fabricCanvas.on('selection:cleared', () => {
      clearGuides();
    });

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    eventListenersAttachedRef.current = true;
    console.log(`✅ Enhanced canvas event listeners setup with snapping for ${format}`);

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [scale, updateLayoutDraft, initializeGuides, applySnapping, clearGuides, isSnappingEnabled]);

  const clearEventListeners = useCallback(() => {
    eventListenersAttachedRef.current = false;
    clearGuides();
    isDraggingRef.current = false;
  }, [clearGuides]);

  return {
    setupCanvasEventListeners,
    updateLayoutDraft,
    clearEventListeners
  };
};
