import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getPreviewText, getMargemFontForField, getDefaultFontSizeForField } from './utils';
import { CanvasElementConfig } from './types';

export const loadBackgroundImage = async (
  canvas: FabricCanvas,
  backgroundImageUrl: string,
  scale: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Loading background image:', backgroundImageUrl);
    
    FabricImage.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      console.log('Background image loaded successfully');
      
      // Set the image to cover the entire canvas
      img.set({
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top'
      });
      
      // Set as background image using the correct Fabric.js v6 API
      canvas.backgroundImage = img;
      canvas.renderAll();
      console.log('Background image set and rendered');
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
  scale: number,
  eventData?: any
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
    style: elementConfig?.style || {},
    constraints: elementConfig?.constraints
  };

  console.log('Adding element to canvas:', config);

  try {
    if (config.type === 'image') {
      const rect = new Rect({
        left: config.position.x * scale,
        top: config.position.y * scale,
        width: (config.style.width || 200) * scale,
        height: (config.style.height || 200) * scale,
        fill: 'rgba(0,0,0,0.1)',
        stroke: '#666',
        strokeWidth: 2,
        strokeDashArray: [5, 5]
      });
      
      rect.set({
        elementId: config.id,
        elementType: 'image',
        fieldMapping: config.field,
        lockUniScaling: true,
        centeredScaling: false
      });
      
      canvas.add(rect);
      console.log('Image placeholder added successfully');
    } else {
      // Use real data and correct fonts for preview
      const textContent = getPreviewText(config.field, eventData);
      const fontFamily = getMargemFontForField(config.field);
      const fontSize = getDefaultFontSizeForField(config.field) * scale;
      
      // Use real colors from eventData if available
      let textColor = '#000000';
      if (eventData) {
        textColor = eventData.textColor || '#000000';
      }

      const text = new FabricText(textContent, {
        left: config.position.x * scale,
        top: config.position.y * scale,
        fontSize: fontSize,
        fill: textColor,
        fontFamily: fontFamily,
        fontWeight: 'normal'
      });

      text.set({
        elementId: config.id,
        elementType: config.type,
        fieldMapping: config.field,
        lockUniScaling: true
      });

      if (config.type === 'text_box') {
        const padding = 20 * scale;
        const bbox = text.getBoundingRect();
        
        // Use real box color from eventData if available
        let boxColor = '#dd303e';
        let boxTextColor = '#FFFFFF';
        if (eventData) {
          boxColor = eventData.boxColor || '#dd303e';
          boxTextColor = eventData.boxFontColor || '#FFFFFF';
        }
        
        text.set({ fill: boxTextColor });
        
        const background = new Rect({
          left: bbox.left - padding,
          top: bbox.top - padding,
          width: bbox.width + (padding * 2),
          height: bbox.height + (padding * 2),
          fill: boxColor,
          rx: 10 * scale,
          ry: 10 * scale
        });

        const group = new Group([background, text], {
          left: config.position.x * scale,
          top: config.position.y * scale
        });

        group.set({
          elementId: config.id,
          elementType: 'text_box',
          fieldMapping: config.field,
          lockUniScaling: true
        });

        canvas.add(group);
        console.log('Text box added successfully');
      } else {
        canvas.add(text);
        console.log('Text element added successfully');
      }
    }
    
    canvas.renderAll();
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};

export const updateSelectedObjectProperty = (
  selectedObject: any,
  canvas: FabricCanvas,
  property: string,
  value: any,
  scale: number
): void => {
  if (!selectedObject || !canvas) {
    console.warn('Cannot update property: missing selected object or canvas');
    return;
  }

  console.log('Updating object property:', property, 'to value:', value);

  try {
    // Only handle position and size changes, ignore font/color changes
    if (property === 'left' || property === 'top' || property === 'scaleX' || property === 'scaleY') {
      selectedObject.set({ [property]: value });
      canvas.renderAll();
      console.log('Property updated successfully');
    } else {
      console.log('Property update ignored (styling not allowed):', property);
    }
  } catch (error) {
    console.error('Error updating object property:', error);
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

      // Only save position and size data, NO styling data
      if (obj.elementType === 'image') {
        return {
          ...baseElement,
          type: 'image',
          size: {
            width: Math.round(((obj.width || 200) * (obj.scaleX || 1)) / scale),
            height: Math.round(((obj.height || 200) * (obj.scaleY || 1)) / scale)
          }
        };
      } else if (obj.elementType === 'text_box') {
        return {
          ...baseElement,
          type: 'text_box',
          size: {
            width: Math.round(((obj.width || 100) * (obj.scaleX || 1)) / scale),
            height: Math.round(((obj.height || 50) * (obj.scaleY || 1)) / scale)
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
