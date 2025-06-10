
import * as fabric from 'fabric';
import { validateElementPosition, constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number, format?: string): any => {
  if (!canvas) {
    console.warn('Cannot serialize layout: canvas is not available');
    return [];
  }

  try {
    console.log('🚫 Serializing canvas layout with enhanced boundary validation');
    console.log('Canvas objects to serialize:', canvas.getObjects().length);
    console.log('Scale factor:', scale, 'Format:', format);
    
    const elements = canvas.getObjects()
      // Filter out teacher photo elements - they're handled by photoPlacementRules.ts
      .filter((obj: any) => {
        const isTeacherPhoto = obj.elementType === 'image' && (obj.fieldMapping === 'teacherImages' || obj.fieldMapping === 'professorPhotos');
        if (isTeacherPhoto) {
          console.log('🚫 Filtering out teacher photo element from serialization:', obj.fieldMapping);
        }
        return !isTeacherPhoto;
      })
      .map((obj: any) => {
      if (format === 'bannerGCO') {
        console.log('[bannerGCO] Raw Object Props for field:', obj.fieldMapping, { left: obj.left, top: obj.top, width: obj.width, height: obj.height, scaleX: obj.scaleX, scaleY: obj.scaleY });
        console.log('[bannerGCO] Scale Factor:', scale);
      }
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
        
        if (format === 'bannerGCO') {
          console.log('[bannerGCO] Initial Unscaled for field:', obj.fieldMapping, 'Position', JSON.parse(JSON.stringify(unscaledPosition)), 'Size', { width, height });
        }
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
        if (format === 'bannerGCO') {
          console.log('[bannerGCO] Validation Result for field:', obj.fieldMapping, JSON.parse(JSON.stringify(validation)));
        }
        if (!validation.isValid) {
          console.warn(`⚠️ Element ${obj.fieldMapping} has boundary violations:`, validation.violations);

          if (format === 'bannerGCO') {
            console.log('[bannerGCO] Position Correction: ElementBounds for constrainToCanvas', JSON.parse(JSON.stringify(elementBounds)));
          }
          // Auto-correct the position and size if needed
          const corrected = constrainToCanvas(elementBounds, format, 20); // 20px margin
          if (format === 'bannerGCO') {
            console.log('[bannerGCO] Position Correction: Corrected Position from constrainToCanvas', JSON.parse(JSON.stringify(corrected.position)));
          }
          unscaledPosition.x = corrected.position.x;
          unscaledPosition.y = corrected.position.y;
          
          // Also constrain size if element is too large for format
          const formatDims = getFormatDimensions(format);
          // Recalculate maxWidth/maxHeight based on *potentially corrected* unscaledPosition
          const currentUnscaledX = unscaledPosition.x;
          const currentUnscaledY = unscaledPosition.y;

          const maxWidth = formatDims.width - currentUnscaledX - 20;
          const maxHeight = formatDims.height - currentUnscaledY - 20;

          if (format === 'bannerGCO') {
            console.log('[bannerGCO] Size Correction: Calculated MaxWidth', maxWidth, 'MaxHeight', maxHeight, 'based on unscaledPosition', JSON.parse(JSON.stringify(unscaledPosition)));
          }
          
          const originalWidthForLog = width;
          const originalHeightForLog = height;

          if (width > maxWidth) {
            width = Math.max(50, maxWidth);
            if (format === 'bannerGCO') {
              console.log('[bannerGCO] Size Correction: Width constrained for field:', obj.fieldMapping, 'from', originalWidthForLog, 'to', width);
            }
            console.log(`📏 Constrained width from ${originalWidthForLog} to ${width}`);
          }
          if (height > maxHeight) {
            height = Math.max(30, maxHeight);
            if (format === 'bannerGCO') {
              console.log('[bannerGCO] Size Correction: Height constrained for field:', obj.fieldMapping, 'from', originalHeightForLog, 'to', height);
            }
            console.log(`📏 Constrained height from ${originalHeightForLog} to ${height}`);
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

      if (format === 'bannerGCO') {
        console.log('[bannerGCO] Final BaseElement for Serialization for field:', obj.fieldMapping, JSON.parse(JSON.stringify(baseElement)));
      }

      if (obj.elementType === 'image') {
        const finalImageElement = {
          ...baseElement,
          type: 'image',
          size: {
            width,
            height
          }
        };
        if (format === 'bannerGCO') {
            console.log('[bannerGCO] Final Serialized Element (Image) for field:', obj.fieldMapping, JSON.parse(JSON.stringify(finalImageElement)));
        }
        return finalImageElement;
      } else {
        const finalTextElement = {
          ...baseElement,
          type: 'text',
          size: {
            width,
            height
          }
        };
        if (format === 'bannerGCO') {
            console.log('[bannerGCO] Final Serialized Element (Text) for field:', obj.fieldMapping, JSON.parse(JSON.stringify(finalTextElement)));
        }
        return finalTextElement;
      }
    });

    console.log('✅ Layout serialized with enhanced boundary validation (teacher photos filtered out):', elements);
    
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
