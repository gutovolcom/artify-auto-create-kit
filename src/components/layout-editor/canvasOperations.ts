import fabric from 'fabric';
import { CanvasElementConfig } from './types';

type FabricCanvas = fabric.Canvas;

export const loadBackgroundImage = async (
  canvas: FabricCanvas,
  backgroundImageUrl: string,
  scale: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Loading background image:', backgroundImageUrl);
    
    if (!backgroundImageUrl) {
      console.error('No background image URL provided');
      reject(new Error('No background image URL provided'));
      return;
    }
    
    fabric.Image.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      console.log('Background image loaded successfully');
      
      // Scale the background image to fit the canvas exactly
      if (canvas.width && canvas.height) {
        const scaleX = canvas.width / img.width!;
        const scaleY = canvas.height / img.height!;
        
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

  const config: CanvasElementConfig = {
    id: elementConfig?.id || `element_${Date.now()}`,
    type: elementConfig?.type || 'text',
    field: elementConfig?.field || 'title',
    position: elementConfig?.position || { x: 50, y: 50 },
    style: elementConfig?.style || {}
  };

  console.log('Adding element to canvas:', config);

  try {
    if (config.type === 'image') {
      const rect = new fabric.Rect({
        left: config.position.x * scale,
        top: config.position.y * scale,
        width: (config.style.width || 200) * scale,
        height: (config.style.height || 200) * scale,
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
      // Move to front using the correct v6 API
      canvas.moveObjectTo(rect, canvas.getObjects().length - 1);
    } else {
      // Simple text placeholder
      const text = new fabric.Text(`[${config.field.toUpperCase()}]`, {
        left: config.position.x * scale,
        top: config.position.y * scale,
        fontSize: (config.style.fontSize || 24) * scale,
        fill: config.style.color || '#333333',
        fontFamily: config.style.fontFamily || 'Arial',
        selectable: true,
        evented: true
      });

      text.set({
        elementId: config.id,
        elementType: config.type,
        fieldMapping: config.field
      });

      canvas.add(text);
      // Move to front using the correct v6 API
      canvas.moveObjectTo(text, canvas.getObjects().length - 1);
    }
    
    canvas.renderAll();
    console.log('Element added and moved to front');
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
    const elements = canvas.getObjects().map((obj: any) => {
      const position = {
        x: Math.round((obj.left || 0) / scale),
        y: Math.round((obj.top || 0) / scale)
      };

      const baseElement = {
        id: obj.elementId || `element_${Date.now()}`,
        field: obj.fieldMapping || 'unknown',
        position
      };

      if (obj.elementType === 'image') {
        return {
          ...baseElement,
          type: 'image',
          size: {
            width: Math.round(((obj.width || 200) * (obj.scaleX || 1)) / scale),
            height: Math.round(((obj.height || 200) * (obj.scaleY || 1)) / scale)
          }
        };
      } else {
        return {
          ...baseElement,
          type: 'text',
          size: {
            width: Math.round(((obj.width || 100) * (obj.scaleX || 1)) / scale),
            height: Math.round(((obj.height || 50) * (obj.scaleY || 1)) / scale)
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
