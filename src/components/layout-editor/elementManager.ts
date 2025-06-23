
import { Canvas, Text, Image, Rect, Group } from 'fabric';
import { CanvasElementConfig } from './types';
import { constrainToCanvas } from '@/utils/positionValidation';
import { 
  getFormatAwareStyle, 
  getClassThemeBoxConfig, 
  getSampleTextForField 
} from './formatAwareRendering';

type FabricCanvas = Canvas;

const validateAndPositionElement = (
  elementConfig: CanvasElementConfig,
  format?: string
): { position: { x: number; y: number }; size: { width: number; height: number } } => {
  // Enhanced size handling - check multiple sources for dimensions
  const elementWidth = elementConfig.style?.width ||
                      elementConfig.size?.width ||
                      (elementConfig.type === 'image' ? 200 : 100);
  const elementHeight = elementConfig.style?.height ||
                       elementConfig.size?.height ||
                       (elementConfig.type === 'image' ? 200 : 50);

  let position = elementConfig.position || { x: 50, y: 50 };

  // Validate and constrain position if format is provided
  if (format) {
    const elementSize = {
      width: elementWidth,
      height: elementHeight
    };

    if (format === 'bannerGCO') {
      console.log('[bannerGCO] Before constrainToCanvas: position', JSON.parse(JSON.stringify(position)), 'size', JSON.parse(JSON.stringify(elementSize)));
    }

    const constrainedElement = constrainToCanvas(
      { position: position, size: elementSize },
      format
    );

    position = constrainedElement.position;

    if (format === 'bannerGCO') {
      console.log('[bannerGCO] After constrainToCanvas: position', JSON.parse(JSON.stringify(position)), 'size', JSON.parse(JSON.stringify(elementSize)));
    }
    console.log(`🛡️ Position validated and constrained for format ${format}:`, {
      original: elementConfig.position,
      constrained: position,
      elementSize
    });
  }
  return { position, size: { width: elementWidth, height: elementHeight } };
};

const addTextElement = (
  canvas: FabricCanvas,
  config: CanvasElementConfig,
  initialPosition: { x: number; y: number },
  initialSize: { width: number; height: number },
  scale: number,
  format?: string
): void => {
  const elementX = initialPosition.x * scale;
  const elementY = initialPosition.y * scale;

  // Get format-aware styling with proper font weights
  const formatStyle = format ? 
    getFormatAwareStyle(config, format) : 
    {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#333333',
      fontWeight: 'normal',
      fontStyle: 'normal'
    };

  const sampleText = getSampleTextForField(config.field);

  // Special handling for classTheme field with fixed box sizing
  if (config.field === 'classTheme' && format) {
    const boxConfig = getClassThemeBoxConfig(config, format, canvas.getWidth(), initialPosition.x);
    
    if (boxConfig.hasBox) {
      console.log('🎨 Creating fixed-size lesson theme box in layout editor:', boxConfig);
      
      // Create the background box with fixed dimensions
      const background = new Rect({
        left: 0,
        top: 0,
        width: boxConfig.boxWidth * scale,
        height: boxConfig.boxHeight * scale,
        fill: boxConfig.boxColor || '#dd303e',
        rx: 10 * scale,
        ry: 10 * scale,
        originX: 'left',
        originY: 'top'
      });

      // Create the text with proper font weight from font family
      const text = new Text(sampleText, {
        fontSize: formatStyle.fontSize * scale,
        fill: formatStyle.color,
        fontFamily: formatStyle.fontFamily,
        fontWeight: formatStyle.fontWeight, // Use proper font weight
        fontStyle: formatStyle.fontStyle,
        textAlign: boxConfig.textAlignment,
        originX: 'left',
        originY: 'top'
      });

      // Position text within the fixed-size box
      if (boxConfig.textAlignment === 'center') {
        text.set({
          left: (boxConfig.boxWidth * scale - text.width!) / 2,
          top: (boxConfig.boxHeight * scale - text.height!) / 2
        });
      } else {
        text.set({
          left: boxConfig.padding * scale,
          top: (boxConfig.boxHeight * scale - text.height!) / 2
        });
      }

      // Create group with background and text
      const group = new Group([background, text], {
        left: elementX,
        top: elementY,
        selectable: true,
        evented: true
      });

      group.set({
        elementId: config.id,
        elementType: config.type,
        fieldMapping: config.field
      });

      canvas.add(group);
      console.log('✅ Fixed-size lesson theme box element added:', {
        left: group.left,
        top: group.top,
        boxWidth: boxConfig.boxWidth,
        boxHeight: boxConfig.boxHeight,
        id: config.id
      });
      return;
    }
  }

  // Regular text element with proper font weight
  const text = new Text(sampleText, {
    left: elementX,
    top: elementY,
    fontSize: formatStyle.fontSize * scale,
    fill: formatStyle.color,
    fontFamily: formatStyle.fontFamily,
    fontWeight: formatStyle.fontWeight, // Use proper font weight
    fontStyle: formatStyle.fontStyle,
    selectable: true,
    evented: true
  });

  text.set({
    elementId: config.id,
    elementType: config.type,
    fieldMapping: config.field
  });

  canvas.add(text);
  console.log('✅ Format-aware text element added with proper font weight:', { 
    left: text.left, 
    top: text.top, 
    fontSize: formatStyle.fontSize * scale, 
    fontFamily: formatStyle.fontFamily,
    fontWeight: formatStyle.fontWeight,
    id: config.id 
  });
};

const addImageElement = (
  canvas: FabricCanvas,
  config: CanvasElementConfig,
  initialPosition: { x: number; y: number },
  initialSize: { width: number; height: number },
  scale: number
): void => {
  // Skip teacher photo elements in layout editor - they're handled by photoPlacementRules.ts
  if (config.field === 'teacherImages' || config.field === 'professorPhotos') {
    console.log('🚫 Skipping teacher photo element in layout editor:', config.field);
    return;
  }

  const elementX = initialPosition.x * scale;
  const elementY = initialPosition.y * scale;
  const elementWidth = initialSize.width;
  const elementHeight = initialSize.height;

  const imageUrl = config.imageUrl || '/placeholder.svg';
  console.log('🔄 Loading image from URL:', imageUrl);

  Image.fromURL(imageUrl, {
    crossOrigin: 'anonymous'
  }).then((img) => {
    if (img.width == null || img.height == null) {
        console.error('Error loading image: Image width or height is null. Using fallback rectangle.');
        const rect = new Rect({
            left: elementX,
            top: elementY,
            width: elementWidth * scale,
            height: elementHeight * scale,
            fill: 'rgba(255, 0, 0, 0.3)',
            stroke: '#FF0000',
            strokeWidth: 2,
            selectable: true,
            evented: true,
        });
        rect.set({
            elementId: config.id,
            elementType: 'image',
            fieldMapping: config.field,
            isFallback: true,
            originalWidth: elementWidth,
            originalHeight: elementHeight,
        });
        canvas.add(rect);
        console.log('⚠️ Fallback rectangle added for image due to loading error (null dimensions).');
        canvas.renderAll();
        return;
    }
    img.set({
      left: elementX,
      top: elementY,
      scaleX: (elementWidth * scale) / img.width,
      scaleY: (elementHeight * scale) / img.height,
      elementId: config.id,
      elementType: 'image',
      fieldMapping: config.field,
      originalWidth: elementWidth,
      originalHeight: elementHeight,
      selectable: true,
      hasControls: true,
      hasRotatingPoint: true,
      evented: true,
    });
    canvas.add(img);
    console.log('✅ Image element added with preserved dimensions:', {
      left: img.left,
      top: img.top,
      originalSize: { width: elementWidth, height: elementHeight },
      scaledSize: { width: img.getScaledWidth(), height: img.getScaledHeight() },
      id: config.id,
    });
  }).catch((error) => {
    console.error('Error loading image:', error);
    const rect = new Rect({
      left: elementX,
      top: elementY,
      width: elementWidth * scale,
      height: elementHeight * scale,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: '#FF0000',
      strokeWidth: 2,
      selectable: true,
      evented: true,
    });
    rect.set({
      elementId: config.id,
      elementType: 'image',
      fieldMapping: config.field,
      isFallback: true,
      originalWidth: elementWidth,
      originalHeight: elementHeight,
    });
    canvas.add(rect);
    console.log('⚠️ Fallback rectangle added for image due to loading error.');
    canvas.renderAll();
  });
};

export const addElementToCanvas = (
  canvas: FabricCanvas,
  elementConfig: CanvasElementConfig,
  scale: number,
  format?: string
): void => {
  // Skip teacher photo elements in layout editor - they're handled by photoPlacementRules.ts
  if (elementConfig.field === 'teacherImages' || elementConfig.field === 'professorPhotos') {
    console.log('🚫 Skipping teacher photo element in layout editor:', elementConfig.field);
    return;
  }

  if (format === 'bannerGCO') {
    console.log('[bannerGCO] addElementToCanvas: elementConfig', elementConfig);
    console.log('[bannerGCO] addElementToCanvas: scale', scale);
  }
  if (!canvas) {
    console.error('Canvas is not available');
    return;
  }

  // Check if element with this field already exists to prevent duplicates
  const existingObjects = canvas.getObjects();
  const existingElement = existingObjects.find((obj: any) => obj.fieldMapping === elementConfig.field);
  
  if (existingElement) {
    console.log('Element with field already exists, removing old one:', elementConfig.field);
    canvas.remove(existingElement);
  }

  // Prepare the full configuration object with defaults
  const fullConfig: CanvasElementConfig = {
    id: elementConfig?.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: elementConfig?.type || 'text',
    field: elementConfig?.field || 'title',
    position: elementConfig?.position || { x: 50, y: 50 },
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#333333',
      ...elementConfig?.style
    },
    imageUrl: elementConfig?.imageUrl,
    size: elementConfig?.size
  };

  const validatedLayout = validateAndPositionElement(fullConfig, format);

  console.log('🎨 Adding element to canvas with FORMAT-AWARE styling and validated position:', {
    field: fullConfig.field,
    position: validatedLayout.position,
    size: validatedLayout.size,
    type: fullConfig.type,
    format: format
  });
  
  if (format === 'bannerGCO') {
    const scaledWidth = validatedLayout.size.width * scale;
    const scaledHeight = validatedLayout.size.height * scale;
    console.log('[bannerGCO] Final scaled values: elementX', validatedLayout.position.x * scale, 'elementY', validatedLayout.position.y * scale, 'scaledWidth', scaledWidth, 'scaledHeight', scaledHeight, 'originalWidth', validatedLayout.size.width, 'originalHeight', validatedLayout.size.height);
  }

  try {
    if (fullConfig.type === 'image') {
      addImageElement(canvas, fullConfig, validatedLayout.position, validatedLayout.size, scale);
    } else {
      addTextElement(canvas, fullConfig, validatedLayout.position, validatedLayout.size, scale, format);
    }
    
    // Ensure element is on top and visible
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      const addedElement = objects[objects.length - 1];
      if (addedElement) {
         canvas.moveObjectTo(addedElement, objects.length - 1);
      }
    }
    canvas.renderAll();
    
    console.log('Element processing completed with format-aware visual accuracy:', fullConfig.id);
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};
