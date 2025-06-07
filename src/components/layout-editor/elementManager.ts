
import * as fabric from 'fabric';
import { CanvasElementConfig } from './types';
import { constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

/**
 * Add an element to the layout editing canvas. The optional margin defines a
 * safe zone when clamping element positions inside the canvas. It defaults to
 * 20px but can be reduced for compact formats.
 */
export const addElementToCanvas = (
  canvas: FabricCanvas,
  elementConfig: CanvasElementConfig,
  scale: number,
  format?: string,
  margin: number = 20
): void => {
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

  const config: CanvasElementConfig = {
    id: elementConfig?.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: elementConfig?.type || 'text',
    field: elementConfig?.field || 'title',
    position: elementConfig?.position || { x: 50, y: 50 },
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#333333',
      ...elementConfig?.style
    }
  };

  // Enhanced size handling - check multiple sources for dimensions
  const elementWidth = config.style?.width || 
                      elementConfig.size?.width || 
                      (config.type === 'image' ? 200 : 100);
  const elementHeight = config.style?.height || 
                       elementConfig.size?.height || 
                       (config.type === 'image' ? 200 : 50);

  // Validate and constrain position if format is provided
  if (format) {
    const elementSize = {
      width: elementWidth,
      height: elementHeight
    };
    
    const constrainedElement = constrainToCanvas(
      { position: config.position, size: elementSize },
      format,
      margin
    );
    
    config.position = constrainedElement.position;
    console.log(`🛡️ Position validated and constrained for format ${format}:`, {
      original: elementConfig.position,
      constrained: config.position,
      elementSize
    });
  }

  console.log('🎨 Adding element to canvas with VALIDATED position and preserved dimensions:', {
    field: config.field,
    position: config.position,
    size: { width: elementWidth, height: elementHeight },
    type: config.type
  });
  
  // Apply scaled position for display in layout editor
  const elementX = config.position.x * scale;
  const elementY = config.position.y * scale;

  try {
    if (config.type === 'image') {
      const imageWidth = elementWidth * scale;
      const imageHeight = elementHeight * scale;
      
      const rect = new fabric.Rect({
        left: elementX,
        top: elementY,
        width: imageWidth,
        height: imageHeight,
        fill: 'rgba(200,200,200,0.3)',
        stroke: '#666',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: true,
        evented: true
      });
      
      // Store original unscaled dimensions for serialization
      rect.set({
        elementId: config.id,
        elementType: 'image',
        fieldMapping: config.field,
        originalWidth: elementWidth,
        originalHeight: elementHeight
      });
      
      canvas.add(rect);
      console.log('✅ Image element added with preserved dimensions:', { 
        left: rect.left, 
        top: rect.top, 
        width: imageWidth, 
        height: imageHeight,
        originalSize: { width: elementWidth, height: elementHeight },
        id: config.id 
      });
    } else {
      const fontSize = (config.style.fontSize || 24) * scale;
      const fontFamily = config.style.fontFamily || 'Arial';
      const color = config.style.color || '#333333';
      
      const text = new fabric.IText(`[${config.field.toUpperCase()}]`, {
        left: elementX,
        top: elementY,
        fontSize: fontSize,
        fill: color,
        fontFamily: fontFamily,
        selectable: true,
        evented: true
      });

      text.set({
        elementId: config.id,
        elementType: config.type,
        fieldMapping: config.field
      });

      canvas.add(text);
      console.log('✅ Text element added:', { left: text.left, top: text.top, fontSize, id: config.id });
    }
    
    // Ensure element is on top and visible
    const objects = canvas.getObjects();
    const addedElement = objects[objects.length - 1];
    canvas.moveObjectTo(addedElement, objects.length - 1);
    canvas.renderAll();
    
    console.log('Element added successfully with boundary validation and preserved dimensions:', config.id);
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};
