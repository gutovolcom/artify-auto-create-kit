
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;

export interface AlignmentGuides {
  horizontal: number[];
  vertical: number[];
}

export const getCanvasCenter = (canvas: FabricCanvas) => {
  return {
    x: canvas.width! / 2,
    y: canvas.height! / 2
  };
};

export const alignObjectToCanvas = (
  canvas: FabricCanvas, 
  object: fabric.FabricObject, 
  alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'
) => {
  if (!object || !canvas) return;

  const canvasWidth = canvas.width!;
  const canvasHeight = canvas.height!;
  const objWidth = (object.width || 0) * (object.scaleX || 1);
  const objHeight = (object.height || 0) * (object.scaleY || 1);

  switch (alignment) {
    case 'left':
      object.set({ left: 0 });
      break;
    case 'center-h':
      object.set({ left: (canvasWidth - objWidth) / 2 });
      break;
    case 'right':
      object.set({ left: canvasWidth - objWidth });
      break;
    case 'top':
      object.set({ top: 0 });
      break;
    case 'center-v':
      object.set({ top: (canvasHeight - objHeight) / 2 });
      break;
    case 'bottom':
      object.set({ top: canvasHeight - objHeight });
      break;
  }

  object.setCoords();
  canvas.renderAll();
};

export const getAlignmentGuides = (canvas: FabricCanvas): AlignmentGuides => {
  const center = getCanvasCenter(canvas);
  
  return {
    horizontal: [center.y],
    vertical: [center.x]
  };
};

export const isNearGuideline = (value: number, guideline: number, threshold: number = 5): boolean => {
  return Math.abs(value - guideline) <= threshold;
};
