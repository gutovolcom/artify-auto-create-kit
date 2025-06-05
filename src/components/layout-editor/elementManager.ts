
import * as fabric from 'fabric';
import { CanvasElementConfig } from './types';

type FabricCanvas = fabric.Canvas;

export const addElementToCanvas = (
  canvas: FabricCanvas,
  elementConfig: CanvasElementConfig,
  scale: number
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
    // ✅ CRITICAL: Use only basic preview styles for layout editor - NO ACTUAL STYLING
    style: {
      fontSize: 24,        // Fixed preview size
      fontFamily: 'Arial', // Fixed preview font  
      color: '#333333',    // Fixed preview color
      ...elementConfig?.style
    }
  };

  console.log('🎨 Adding element to canvas with PREVIEW STYLING ONLY (real styles come from format rules):', config);
  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
  console.log('Scale factor:', scale);
  
  // Use direct positioning without scale multiplication
  const elementX = config.position.x;
  const elementY = config.position.y;
  
  console.log('Element will be positioned at:', { x: elementX, y: elementY });

  try {
    if (config.type === 'image') {
      const imageWidth = (config.style.width || 200);
      const imageHeight = (config.style.height || 200);
      
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
      // Text element - use ONLY preview styling for layout editor
      const fontSize = 24; // Fixed preview size
      const fontFamily = 'Arial'; // Fixed preview font
      const color = '#333333'; // Fixed preview color
      
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
        // ✅ CRITICAL: DO NOT store any styling properties here
        // Real styles will come from format-specific rules during generation
      });

      canvas.add(text);
      console.log('Text element added at:', { left: text.left, top: text.top, id: config.id });
    }
    
    // Ensure element is on top and visible
    const objects = canvas.getObjects();
    const addedElement = objects[objects.length - 1];
    canvas.moveObjectTo(addedElement, objects.length - 1);
    canvas.renderAll();
    
    console.log('Element added successfully:', config.id);
    console.log('Total canvas objects:', canvas.getObjects().length);
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};
