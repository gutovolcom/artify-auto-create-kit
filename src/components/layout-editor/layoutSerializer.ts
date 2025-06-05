
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number): any => {
  if (!canvas) {
    console.warn('Cannot serialize layout: canvas is not available');
    return [];
  }

  try {
    console.log('🚫 Serializing canvas layout - POSITION AND SIZE ONLY (no styles)');
    console.log('Canvas objects to serialize:', canvas.getObjects().length);
    
    const elements = canvas.getObjects().map((obj: any) => {
      // Use direct position values - positioning only
      const position = {
        x: Math.round(obj.left || 0),
        y: Math.round(obj.top || 0)
      };

      // Calculate dimensions separately
      let width: number, height: number;

      if (obj.elementType === 'image') {
        width = Math.round((obj.width || 200) * (obj.scaleX || 1));
        height = Math.round((obj.height || 200) * (obj.scaleY || 1));
      } else {
        width = Math.round((obj.width || 100) * (obj.scaleX || 1));
        height = Math.round((obj.height || 50) * (obj.scaleY || 1));
      }

      console.log(`🎯 Serializing ${obj.fieldMapping} - POSITION ONLY:`, {
        elementId: obj.elementId,
        fieldMapping: obj.fieldMapping,
        position,
        size: { width, height },
        type: obj.elementType
      });

      // ✅ CRITICAL: Create clean serializable object with POSITION ONLY - NO STYLING
      const baseElement = {
        id: obj.elementId || `element_${Date.now()}`,
        field: obj.fieldMapping || 'unknown',
        position
        // ✅ IMPORTANT: NO fontSize, fontFamily, color properties saved!
        // These will come from format-specific rules during generation
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

    console.log('✅ Layout serialized successfully - POSITIONING ONLY (styles will come from format rules):', elements);
    return elements;
  } catch (error) {
    console.error('Error serializing canvas layout:', error);
    return [];
  }
};
