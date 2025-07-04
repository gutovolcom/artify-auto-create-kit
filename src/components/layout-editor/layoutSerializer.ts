import * as fabric from 'fabric';
import { validateElementPosition, constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

// Format-specific serialization margin calculation
const getSerializationMargin = (format: string): number => {
  const dimensions = getFormatDimensions(format);
  const area = dimensions.width * dimensions.height;
  
  // For bannerGCO, use ultra-minimal margins to preserve user positioning
  if (format === 'bannerGCO' || format === 'destaque') { // Adicionado 'destaque' aqui por consistência
    return 1;
  }
  
  // For very small formats, use minimal margins
  if (area < 60000) {
    return 5;
  }
  
  // For medium formats, use moderate margins
  if (area < 500000) {
    return 10;
  }
  
  // For large formats, use standard margins
  return 20;
};

// Check if format should use minimal validation
const shouldUseMinimalValidation = (format: string): boolean => {
  // CORREÇÃO APLICADA AQUI
  return format === 'bannerGCO' || format === 'destaque';
};

// Enhanced precision rounding for small formats
const precisionRound = (value: number, format: string): number => {
  // CORREÇÃO APLICADA AQUI
  if (format === 'bannerGCO' || format === 'destaque') {
    // Use higher precision for small formats
    return Math.round(value * 1000) / 1000;
  }
  return Math.round(value * 100) / 100;
};

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number, format?: string): any => {
  if (!canvas) {
    console.warn('Cannot serialize layout: canvas is not available');
    return [];
  }

  try {
    console.log('🚫 Serializing canvas layout with format-specific boundary validation');
    console.log('Canvas objects to serialize:', canvas.getObjects().length);
    console.log('Scale factor:', scale, 'Format:', format);
    
    const serializationMargin = format ? getSerializationMargin(format) : 20;
    const useMinimalValidation = format ? shouldUseMinimalValidation(format) : false;
    
    console.log(`📏 Using ${serializationMargin}px serialization margin for format: ${format}${useMinimalValidation ? ' (minimal validation)' : ''}`);
    
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
        console.log('[bannerGCO] Scale Factor:', scale, 'Serialization Margin:', serializationMargin);
      }
      
      // Calculate UNSCALED position with enhanced precision for small formats
      const unscaledPosition = {
        x: precisionRound((obj.left || 0) / scale, format || ''),
        y: precisionRound((obj.top || 0) / scale, format || '')
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

      // Enhanced boundary validation with format-specific behavior
      if (format && !useMinimalValidation) {
        // Standard validation for all formats except bannerGCO
        const validation = validateElementPosition(elementBounds, format);
        
        if (!validation.isValid) {
          console.warn(`⚠️ Element ${obj.fieldMapping} has boundary violations:`, validation.violations);
          
          // Auto-correct with format-specific margin
          const corrected = constrainToCanvas(elementBounds, format, serializationMargin);
          unscaledPosition.x = corrected.position.x;
          unscaledPosition.y = corrected.position.y;
          
          // Also constrain size if element is too large for format
          const formatDims = getFormatDimensions(format);
          const maxWidth = formatDims.width - unscaledPosition.x - serializationMargin;
          const maxHeight = formatDims.height - unscaledPosition.y - serializationMargin;
          
          if (width > maxWidth) {
            width = Math.max(50, maxWidth);
            console.log(`📏 Constrained width to ${width}`);
          }
          if (height > maxHeight) {
            height = Math.max(30, maxHeight);
            console.log(`📏 Constrained height to ${height}`);
          }
          
          console.log(`✅ Auto-corrected ${obj.fieldMapping} with ${serializationMargin}px margin:`, {
            position: corrected.position,
            size: { width, height }
          });
        }
      } else if (format && useMinimalValidation) {
        // Minimal validation for bannerGCO - only prevent truly invalid positions
        const formatDims = getFormatDimensions(format);
        
        // Only constrain if element is completely outside canvas or at negative positions
        if (unscaledPosition.x < 0) {
          unscaledPosition.x = 0;
          console.log(`[${format}] Minimal correction: X position set to 0`);
        }
        if (unscaledPosition.y < 0) {
          unscaledPosition.y = 0;
          console.log(`[${format}] Minimal correction: Y position set to 0`);
        }
        
        // Only constrain if element starts way beyond canvas boundaries
        if (unscaledPosition.x > formatDims.width) {
          unscaledPosition.x = formatDims.width - width - 1;
          console.log(`[${format}] Minimal correction: X position constrained to canvas`);
        }
        if (unscaledPosition.y > formatDims.height) {
          unscaledPosition.y = formatDims.height - height - 1;
          console.log(`[${format}] Minimal correction: Y position constrained to canvas`);
        }
        
        if (format === 'bannerGCO') {
          console.log('[bannerGCO] Minimal validation applied, preserving user positioning:', unscaledPosition);
        }
      }

      console.log(`🎯 Serializing ${obj.fieldMapping}:`, {
        elementId: obj.elementId,
        fieldMapping: obj.fieldMapping,
        position: unscaledPosition,
        size: { width, height },
        type: obj.elementType,
        scaleFactor: scale,
        validationType: useMinimalValidation ? 'minimal' : 'standard'
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

    console.log(`✅ Layout serialized with ${useMinimalValidation ? 'minimal' : 'standard'} validation (${serializationMargin}px margin, teacher photos filtered out):`, elements);
    
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
