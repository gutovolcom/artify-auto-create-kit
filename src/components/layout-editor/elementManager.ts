import { fabric } from 'fabric';
import { CanvasElementConfig } from './types';
import { constrainToCanvas } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

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
  config: CanvasElementConfig, // Full config including id, type, field, style
  initialPosition: { x: number; y: number },
  initialSize: { width: number; height: number }, // Not directly used for text content itself, but good to have for consistency
  scale: number
): void => {
  const elementX = initialPosition.x * scale;
  const elementY = initialPosition.y * scale;

  const fontSize = (config.style.fontSize || 24) * scale;
  const fontFamily = config.style.fontFamily || 'Arial';
  const color = config.style.color || '#333333';

  let fontWeight = 'normal';
  let fontStyle = 'normal';
  if (config.field.toLowerCase().includes('title') || config.field.toLowerCase().includes('headline')) {
    fontWeight = 'bold';
  } else if (config.field.toLowerCase().includes('caption') || config.field.toLowerCase().includes('subtitle')) {
    fontStyle = 'italic';
  }

  const text = new fabric.Text(`[${config.field.toUpperCase()}]`, {
    left: elementX,
    top: elementY,
    fontSize: fontSize,
    fill: color,
    fontFamily: fontFamily,
    selectable: true,
    evented: true,
    fontWeight: fontWeight,
    fontStyle: fontStyle
  });

  text.set({
    elementId: config.id,
    elementType: config.type,
    fieldMapping: config.field
  });

  canvas.add(text);
  console.log('✅ Text element added:', { left: text.left, top: text.top, fontSize, id: config.id });
};

const addImageElement = (
  canvas: FabricCanvas,
  config: CanvasElementConfig, // Full config including id, type, field, style, imageUrl
  initialPosition: { x: number; y: number },
  initialSize: { width: number; height: number },
  scale: number
): void => {
  const elementX = initialPosition.x * scale;
  const elementY = initialPosition.y * scale;
  const elementWidth = initialSize.width; // Use from validatedLayout.size
  const elementHeight = initialSize.height; // Use from validatedLayout.size

  const imageUrl = config.imageUrl || '/placeholder.svg';
  console.log('🔄 Loading image from URL:', imageUrl);

  fabric.Image.fromURL(imageUrl, (img) => {
    if (img.width == null || img.height == null) {
        console.error('Error loading image: Image width or height is null. Using fallback rectangle.');
        const rect = new fabric.Rect({
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
        canvas.renderAll(); // Render here as it's an async path
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
    // canvas.renderAll(); // Main renderAll is in addElementToCanvas
  }, (oImg, error) => {
    console.error('Error loading image:', error);
    const rect = new fabric.Rect({
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
    canvas.renderAll(); // Render here as it's an async path
  });
};

export const addElementToCanvas = (
  canvas: FabricCanvas,
  elementConfig: CanvasElementConfig, // This is the raw config passed to the function
  scale: number,
  format?: string
): void => {
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
    imageUrl: elementConfig?.imageUrl, // Ensure imageUrl is passed through
    size: elementConfig?.size // Ensure size is passed through
  };

  const validatedLayout = validateAndPositionElement(fullConfig, format);

  console.log('🎨 Adding element to canvas with VALIDATED position and preserved dimensions:', {
    field: fullConfig.field,
    position: validatedLayout.position,
    size: validatedLayout.size,
    type: fullConfig.type
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
      addTextElement(canvas, fullConfig, validatedLayout.position, validatedLayout.size, scale);
    }
    
    // Ensure element is on top and visible
    // Note: For async image loading, this might not grab the image itself immediately.
    // Consider moving this to within addImageElement's success callback if issues arise.
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      const addedElement = objects[objects.length - 1];
      // For async image adding, the last object might not be the one just added.
      // This might need a more robust way to get the added element, e.g., by returning it from addImageElement/addTextElement
      // or by relying on the fact that fabric.Image.fromURL callback will execute later.
      // For now, we assume this works for text and synchronous parts of image (like fallback).
      if (addedElement) { // Check if addedElement is not undefined
         canvas.moveObjectTo(addedElement, objects.length - 1);
      }
    }
    canvas.renderAll();
    
    console.log('Element processing initiated successfully with boundary validation and preserved dimensions:', fullConfig.id);
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};
