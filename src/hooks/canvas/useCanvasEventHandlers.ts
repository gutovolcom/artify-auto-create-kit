
import { useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { serializeCanvasLayout } from '@/components/layout-editor/layoutSerializer';
import { constrainToCanvas } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

interface UseCanvasEventHandlersProps {
  scale: number;
  setLayoutDraft: (draft: any[]) => void;
}

export const useCanvasEventHandlers = ({
  scale,
  setLayoutDraft
}: UseCanvasEventHandlersProps) => {
  const eventListenersAttachedRef = useRef(false);

  const updateLayoutDraft = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    let margin = Math.min(canvasWidth, canvasHeight) * 0.02;
    if (format === 'bannerGCO') margin *= 0.5;

    const elements = serializeCanvasLayout(fabricCanvas, scale, format, margin);
    setLayoutDraft(elements);
    console.log("📝 Layout updated immediately with boundary validation for format:", format, elements.length, "elements");
  }, [scale, setLayoutDraft]);

  const setupCanvasEventListeners = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    if (eventListenersAttachedRef.current) {
      console.log('⚠️ Event listeners already attached, skipping');
      return;
    }

    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:moving');
    fabricCanvas.off('object:scaling');
    fabricCanvas.off('mouse:dblclick');

    const handleElementChange = (e: fabric.ModifiedEvent) => {
      const obj = e.target;
      if (!obj || !format) {
        updateLayoutDraft(fabricCanvas, format);
        return;
      }

      const unscaledX = (obj.left || 0) / scale;
      const unscaledY = (obj.top || 0) / scale;
      const objWidth = ((obj.width || 100) * (obj.scaleX || 1));
      const objHeight = ((obj.height || 50) * (obj.scaleY || 1));

      let margin = Math.min(fabricCanvas.getWidth(), fabricCanvas.getHeight()) * 0.02;
      if (format === 'bannerGCO') margin *= 0.5;

      const constrained = constrainToCanvas(
        {
          position: { x: unscaledX, y: unscaledY },
          size: { width: objWidth / scale, height: objHeight / scale }
        },
        format,
        margin
      );

      if (constrained.position.x !== unscaledX || constrained.position.y !== unscaledY) {
        obj.set({
          left: constrained.position.x * scale,
          top: constrained.position.y * scale
        });
        fabricCanvas.renderAll();
        console.log(`🚧 Element constrained to boundaries:`, constrained.position);
      }

      updateLayoutDraft(fabricCanvas, format);
    };

    fabricCanvas.on('object:modified', handleElementChange);
    fabricCanvas.on('object:moving', handleElementChange);
    fabricCanvas.on('object:scaling', handleElementChange);

    const handleDoubleClick = (e: fabric.IEvent) => {
      const obj = e.target as any;
      if (obj && obj.type === 'i-text' && typeof obj.enterEditing === 'function') {
        obj.enterEditing();
        obj.selectAll();
        const exitHandler = () => {
          obj.off('editing:exited', exitHandler);
          updateLayoutDraft(fabricCanvas, format);
        };
        obj.on('editing:exited', exitHandler);
      }
    };

    fabricCanvas.on('mouse:dblclick', handleDoubleClick);

    eventListenersAttachedRef.current = true;
    console.log('✅ Canvas event listeners setup with boundary validation and immediate persistence');
  }, [scale, updateLayoutDraft]);

  const clearEventListeners = useCallback(() => {
    eventListenersAttachedRef.current = false;
  }, []);

  return {
    setupCanvasEventListeners,
    updateLayoutDraft,
    clearEventListeners
  };
};
