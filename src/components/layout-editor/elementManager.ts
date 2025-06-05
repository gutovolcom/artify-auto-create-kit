
import * as fabric from 'fabric';
import { CanvasElementConfig } from './types';
import { constrainToCanvas, getFormatDimensions } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

export const addElementToCanvas = (
  canvas: FabricCanvas,
  elementConfig: CanvasElementConfig,
  scale: number,
  format?: string
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

  // Validate and constrain position if format is provided
  if (format) {
    const elementSize = {
      width: config.style.width || (config.type === 'image' ? 200 : 100),
      height: config.style.height || (config.type === 'image' ? 200 : 50)
    };
    
    const constrainedElement = constrainToCanvas(
      { position: config.position, size: elementSize },
      format
    );
    
    config.position = constrainedElement.position;
    console.log(`🛡️ Position validated for format ${format}:`, config.position);
  }

  console.log('🎨 Adding element to canvas with VALIDATED position:', config);
  
  // Apply scaled position for display in layout editor
  const elementX = config.position.x * scale;
  const elementY = config.position.y * scale;
  
  console.log('Element positioning:', {
    unscaled: config.position,
    scaled: { x: elementX, y: elementY },
    scaleFactor: scale
  });

  try {
    if (config.type === 'image') {
      const imageWidth = (config.style.width || 200) * scale;
      const imageHeight = (config.style.height || 200) * scale;
      
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
      
      rect.set({
        elementId: config.id,
        elementType: 'image',
        fieldMapping: config.field
      });
      
      canvas.add(rect);
      console.log('Image element added at:', { left: rect.left, top: rect.top, id: config.id });
    } else {
      const fontSize = 24 * scale;
      const fontFamily = 'Arial';
      const color = '#333333';
      
      const text = new fabric.Text(`[${config.field.toUpperCase()}]`, {
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
      console.log('Text element added at:', { left: text.left, top: text.top, id: config.id });
    }
    
    // Ensure element is on top and visible
    const objects = canvas.getObjects();
    const addedElement = objects[objects.length - 1];
    canvas.moveObjectTo(addedElement, objects.length - 1);
    canvas.renderAll();
    
    console.log('Element added successfully with boundary validation:', config.id);
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};
