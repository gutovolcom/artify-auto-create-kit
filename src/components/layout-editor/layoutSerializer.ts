
import type { Canvas } from 'fabric';
import { validateElementPosition, constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';

type FabricCanvas = Canvas;

/**
 * Serialize the canvas objects applying optional margin constraints.
 * The margin defines a "safe zone" that elements will be clamped to
 * when validating positions. It defaults to 20px but can be tuned per
 * format (e.g. a smaller value for compact formats like bannerGCO).
 */
export const serializeCanvasLayout = (
  canvas: FabricCanvas,
  scale: number,
  format?: string,
  margin: number = 20
): any => {
  if (!canvas) {
    console.warn('Cannot serialize layout: canvas is not available');
    return [];
  }

  try {
    console.log('🚫 Serializing canvas layout with enhanced boundary validation');
    console.log('Canvas objects to serialize:', canvas.getObjects().length);
    console.log('Scale factor:', scale, 'Format:', format);
    
    const elements = canvas.getObjects().map((obj: any) => {
      // Calculate UNSCALED position (real canvas coordinates)
      const unscaledPosition = {
        x: Math.round((obj.left || 0) / scale),
        y: Math.round((obj.top || 0) / scale)
      };

      // Enhanced dimension calculation with fallback chain
      let width: number, height: number;

      if (obj.elementType === 'image') {
        // For images, check multiple sources for original dimensions
        width = obj.originalWidth || Math.round((obj.width || 200) * (obj.scaleX || 1));
        height = obj.originalHeight || Math.round((obj.height || 200) * (obj.scaleY || 1));
        
        console.log(`🖼️ Image element ${obj.fieldMapping} dimensions:`, {
          originalWidth: obj.originalWidth,
          originalHeight: obj.originalHeight,
          calculatedWidth: Math.round((obj.width || 200) * (obj.scaleX || 1)),
          calculatedHeight: Math.round((obj.height || 200) * (obj.scaleY || 1)),
          finalSize: { width, height }
        });
      } else {
        width = Math.round((obj.width || 100) * (obj.scaleX || 1));
        height = Math.round((obj.height || 50) * (obj.scaleY || 1));
      }

      const elementBounds = {
        position: unscaledPosition,
        size: { width, height }
      };

      // Enhanced boundary validation and auto-correction
      if (format) {
        const validation = validateElementPosition(elementBounds, format);
        if (!validation.isValid) {
          console.warn(`⚠️ Element ${obj.fieldMapping} has boundary violations:`, validation.violations);
          // Auto-correct the position and size if needed
          const corrected = constrainToCanvas(elementBounds, format, margin);
          unscaledPosition.x = corrected.position.x;
          unscaledPosition.y = corrected.position.y;

          // Also constrain size if element is too large for format
          const formatDims = getFormatDimensions(format);
          const maxWidth = formatDims.width - unscaledPosition.x - margin;
          const maxHeight = formatDims.height - unscaledPosition.y - margin;
          
          if (width > maxWidth) {
            width = Math.max(50, maxWidth);
            console.log(`📏 Constrained width from ${elementBounds.size.width} to ${width}`);
          }
          if (height > maxHeight) {
            height = Math.max(30, maxHeight);
            console.log(`📏 Constrained height from ${elementBounds.size.height} to ${height}`);
          }
          
          console.log(`✅ Auto-corrected ${obj.fieldMapping}:`, {
            position: corrected.position,
            size: { width, height }
          });
        }
      }

      console.log(`🎯 Serializing ${obj.fieldMapping}:`, {
        elementId: obj.elementId,
        fieldMapping: obj.fieldMapping,
        position: unscaledPosition,
        size: { width, height },
        type: obj.elementType,
        scaleFactor: scale
      });

      // Create clean serializable object with boundary-validated coordinates
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

    console.log('✅ Layout serialized with enhanced boundary validation:', elements);
    
    if (format) {
      const formatDims = getFormatDimensions(format);
      console.log(`📐 Format ${format} dimensions:`, formatDims);
      console.log(`🔍 All elements validated against ${formatDims.width}x${formatDims.height} canvas`);
    }
    
    return elements;
  } catch (error) {
    console.error('Error serializing canvas layout:', error);
    return [];
  }
};
