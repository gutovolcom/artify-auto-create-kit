import * as fabric from 'fabric';
import { CanvasElementConfig } from './types';

type FabricCanvas = fabric.Canvas;

export const loadBackgroundImage = async (
  canvas: FabricCanvas,
  backgroundImageUrl: string,
  scale: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Loading background image:', backgroundImageUrl, 'Scale:', scale);
    
    if (!backgroundImageUrl) {
      console.error('No background image URL provided');
      reject(new Error('No background image URL provided'));
      return;
    }
    
    fabric.Image.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      console.log('Background image loaded successfully');
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      console.log('Image dimensions:', img.width, 'x', img.height);
      
      // Scale the background image to fit the canvas exactly
      if (canvas.width && canvas.height) {
        const scaleX = canvas.width / img.width!;
        const scaleY = canvas.height / img.height!;
        
        console.log('Background scaling factors:', { scaleX, scaleY });
        
        img.set({
          scaleX: scaleX,
          scaleY: scaleY,
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          excludeFromExport: false
        });
      }
      
      // Set background image using the correct v6 API
      canvas.backgroundImage = img;
      canvas.renderAll();
      console.log('Background image set successfully');
      resolve();
    }).catch((error) => {
      console.error('Error loading background image:', error);
      reject(error);
    });
  });
};

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
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#333333',
      ...elementConfig?.style
    }
  };

  console.log('Adding element to canvas with config:', config);
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
      // Text element
      const fontSize = config.style.fontSize || 24;
      const fontFamily = config.style.fontFamily || 'Arial';
      const color = config.style.color || '#333333';
      
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
        fieldMapping: config.field,
        originalFontSize: fontSize,
        originalFontFamily: fontFamily,
        originalColor: color
      });

      canvas.add(text);
      console.log('Text element added at:', { left: text.left, top: text.top, id: config.id, fontSize, fontFamily, color });
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

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number): any => {
  if (!canvas) {
    console.warn('Cannot serialize layout: canvas is not available');
    return [];
  }

  try {
    console.log('Serializing canvas layout with scale:', scale);
    console.log('Canvas objects to serialize:', canvas.getObjects().length);
    
    const elements = canvas.getObjects().map((obj: any) => {
      // Use direct position values without scale division since we're not scaling positions
      const position = {
        x: Math.round(obj.left || 0),
        y: Math.round(obj.top || 0)
      };

      // Serialize visual style properties only - avoid circular references
      const style = {
        fontSize: obj.originalFontSize || obj.fontSize || 24,
        fontFamily: obj.originalFontFamily || obj.fontFamily || 'Arial',
        color: obj.originalColor || obj.fill || '#333333'
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

      console.log('Serializing object:', {
        elementId: obj.elementId,
        fieldMapping: obj.fieldMapping,
        position,
        style,
        size: { width, height },
        type: obj.elementType
      });

      // Create a clean serializable object without fabric.js circular references
      const baseElement = {
        id: obj.elementId || `element_${Date.now()}`,
        field: obj.fieldMapping || 'unknown',
        position,
        style: {
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          color: style.color
        }
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

    console.log('Layout serialized successfully:', elements);
    return elements;
  } catch (error) {
    console.error('Error serializing canvas layout:', error);
    return [];
  }
};
