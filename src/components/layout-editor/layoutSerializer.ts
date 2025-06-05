
import * as fabric from 'fabric';
import { validateElementPosition, constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number, format?: string): any => {
  if (!canvas) {
    console.warn('Cannot serialize layout: canvas is not available');
    return [];
  }

  try {
    console.log('🚫 Serializing canvas layout - UNSCALED COORDINATES with boundary validation');
    console.log('Canvas objects to serialize:', canvas.getObjects().length);
    console.log('Scale factor:', scale, 'Format:', format);
    
    const elements = canvas.getObjects().map((obj: any) => {
      // Calculate UNSCALED position (real canvas coordinates)
      const unscaledPosition = {
        x: Math.round((obj.left || 0) / scale),
        y: Math.round((obj.top || 0) / scale)
      };

      // Calculate actual element dimensions
      let width: number, height: number;

      if (obj.elementType === 'image') {
        width = Math.round((obj.width || 200) * (obj.scaleX || 1));
        height = Math.round((obj.height || 200) * (obj.scaleY || 1));
      } else {
        width = Math.round((obj.width || 100) * (obj.scaleX || 1));
        height = Math.round((obj.height || 50) * (obj.scaleY || 1));
      }

      const elementBounds = {
        position: unscaledPosition,
        size: { width, height }
      };

      // Validate position if format is provided
      if (format) {
        const validation = validateElementPosition(elementBounds, format);
        if (!validation.isValid) {
          console.warn(`⚠️ Element ${obj.fieldMapping} has boundary violations:`, validation.violations);
          // Auto-correct the position
          const corrected = constrainToCanvas(elementBounds, format);
          unscaledPosition.x = corrected.position.x;
          unscaledPosition.y = corrected.position.y;
          console.log(`✅ Auto-corrected position for ${obj.fieldMapping}:`, corrected.position);
        }
      }

      console.log(`🎯 Serializing ${obj.fieldMapping} - UNSCALED coordinates:`, {
        elementId: obj.elementId,
        fieldMapping: obj.fieldMapping,
        position: unscaledPosition,
        size: { width, height },
        type: obj.elementType,
        scaleFactor: scale
      });

      // Create clean serializable object with UNSCALED COORDINATES
      const baseElement = {
        id: obj.elementId || `element_${Date.now()}`,
        field: obj.fieldMapping || 'unknown',
        position: unscaledPosition
      };

      if (obj.elementType === 'image') {
        return {
          ...baseElement,
          type: 'image',
          size: {
            width,
            height
          }
        };
      } else {
        return {
          ...baseElement,
          type: 'text',
          size: {
            width,
            height
          }
        };
      }
    });

    console.log('✅ Layout serialized successfully - UNSCALED coordinates with boundary validation:', elements);
    
    // Log format dimensions for reference
    if (format) {
      const formatDims = getFormatDimensions(format);
      console.log(`📐 Format ${format} dimensions:`, formatDims);
    }
    
    return elements;
  } catch (error) {
    console.error('Error serializing canvas layout:', error);
    return [];
  }
};
