
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getPreviewText, getMargemFontForField, getDefaultFontSizeForField } from './utils';
import { CanvasElementConfig } from './types';

export const loadBackgroundImage = async (
  canvas: FabricCanvas,
  backgroundImageUrl: string,
  scale: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    FabricImage.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false
      });
      canvas.backgroundImage = img;
      canvas.renderAll();
      resolve();
    }).catch(reject);
  });
};

export const addElementToCanvas = (
  canvas: FabricCanvas,
  elementConfig: CanvasElementConfig,
  scale: number,
  eventData?: any
): void => {
  const config: CanvasElementConfig = {
    id: elementConfig?.id || `element_${Date.now()}`,
    type: elementConfig?.type || 'text',
    field: elementConfig?.field || 'title',
    position: elementConfig?.position || { x: 50, y: 50 },
    style: elementConfig?.style || {},
    constraints: elementConfig?.constraints
  };

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
    
    // Add proportional resizing constraints
    rect.set({
      elementId: config.id,
      elementType: 'image',
      fieldMapping: config.field,
      lockUniScaling: true, // Maintain aspect ratio
      centeredScaling: false
    });
    
    canvas.add(rect);
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
      lockUniScaling: true // Prevent text distortion
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
        lockUniScaling: true // Maintain proportions
      });

      canvas.add(group);
    } else {
      canvas.add(text);
    }
  }
};

export const updateSelectedObjectProperty = (
  selectedObject: any,
  canvas: FabricCanvas,
  property: string,
  value: any,
  scale: number
): void => {
  // Only allow position and size updates, no styling
  if (!selectedObject || !canvas) return;

  console.log('Updating object property:', property, 'to value:', value);

  // Only handle position and size changes, ignore font/color changes
  if (property === 'left' || property === 'top' || property === 'scaleX' || property === 'scaleY') {
    selectedObject.set({ [property]: value });
    canvas.renderAll();
  }
};

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number): any => {
  return canvas.getObjects().map((obj: any) => {
    const position = {
      x: Math.round(obj.left / scale),
      y: Math.round(obj.top / scale)
    };

    // Only save position and size data, NO styling data
    if (obj.elementType === 'image') {
      return {
        id: obj.elementId,
        type: 'image',
        field: obj.fieldMapping,
        position,
        size: {
          width: Math.round((obj.width * obj.scaleX) / scale),
          height: Math.round((obj.height * obj.scaleY) / scale)
        }
      };
    } else if (obj.elementType === 'text_box') {
      return {
        id: obj.elementId,
        type: 'text_box',
        field: obj.fieldMapping,
        position,
        size: {
          width: Math.round((obj.width * obj.scaleX) / scale),
          height: Math.round((obj.height * obj.scaleY) / scale)
        }
      };
    } else {
      return {
        id: obj.elementId,
        type: 'text',
        field: obj.fieldMapping,
        position,
        size: {
          width: Math.round((obj.width * obj.scaleX) / scale),
          height: Math.round((obj.height * obj.scaleY) / scale)
        }
      };
    }
  });
};
