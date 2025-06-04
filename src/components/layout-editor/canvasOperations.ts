
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getPreviewText } from './utils';
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
  scale: number
): void => {
  // Ensure we have a complete config object with all required properties
  const config: CanvasElementConfig = {
    id: elementConfig?.id || `element_${Date.now()}`,
    type: elementConfig?.type || 'text',
    field: elementConfig?.field || 'title',
    position: elementConfig?.position || { x: 50, y: 50 },
    style: elementConfig?.style || { fontSize: 24, color: '#000000' },
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
    
    rect.set({
      elementId: config.id,
      elementType: 'image',
      fieldMapping: config.field
    });
    
    canvas.add(rect);
  } else {
    const text = new FabricText(getPreviewText(config.field), {
      left: config.position.x * scale,
      top: config.position.y * scale,
      fontSize: (config.style.fontSize || 24) * scale,
      fill: config.style.color || config.style.textColor || '#000000',
      fontFamily: config.style.fontFamily || 'Margem-Regular',
      fontWeight: config.style.fontWeight || 'normal'
    });

    text.set({
      elementId: config.id,
      elementType: config.type,
      fieldMapping: config.field
    });

    if (config.type === 'text_box') {
      const padding = (config.style.padding || 10) * scale;
      const bbox = text.getBoundingRect();
      
      const background = new Rect({
        left: bbox.left - padding,
        top: bbox.top - padding,
        width: bbox.width + (padding * 2),
        height: bbox.height + (padding * 2),
        fill: config.style.backgroundColor || '#dd303e',
        rx: (config.style.borderRadius || 0) * scale,
        ry: (config.style.borderRadius || 0) * scale
      });

      const group = new Group([background, text], {
        left: config.position.x * scale,
        top: config.position.y * scale
      });

      group.set({
        elementId: config.id,
        elementType: 'text_box',
        fieldMapping: config.field
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
  if (!selectedObject || !canvas) return;

  console.log('Updating object property:', property, 'to value:', value);

  if (property === 'fontSize') {
    const newFontSize = parseInt(value) * scale;
    
    if (selectedObject.type === 'group') {
      const textObject = selectedObject.getObjects().find((obj: any) => obj.type === 'text');
      if (textObject) {
        textObject.set({ fontSize: newFontSize });
        selectedObject.addWithUpdate();
      }
    } else if (selectedObject.type === 'text') {
      selectedObject.set({ fontSize: newFontSize });
    }
  } else if (property === 'fontFamily') {
    if (selectedObject.type === 'group') {
      const textObject = selectedObject.getObjects().find((obj: any) => obj.type === 'text');
      if (textObject) {
        textObject.set({ fontFamily: value });
        selectedObject.addWithUpdate();
      }
    } else if (selectedObject.type === 'text') {
      selectedObject.set({ fontFamily: value });
    }
  }

  canvas.renderAll();
};

export const serializeCanvasLayout = (canvas: FabricCanvas, scale: number): any => {
  return canvas.getObjects().map((obj: any) => {
    const position = {
      x: obj.left / scale,
      y: obj.top / scale
    };

    if (obj.elementType === 'image') {
      return {
        id: obj.elementId,
        type: 'image',
        field: obj.fieldMapping,
        position,
        style: {
          width: obj.width / scale,
          height: obj.height / scale
        }
      };
    } else if (obj.elementType === 'text_box') {
      const textObject = obj.getObjects ? obj.getObjects().find((o: any) => o.type === 'text') : obj;
      return {
        id: obj.elementId,
        type: 'text_box',
        field: obj.fieldMapping,
        position,
        style: {
          fontSize: textObject ? textObject.fontSize / scale : 24,
          fontFamily: textObject ? textObject.fontFamily : 'Margem-Regular',
          textColor: textObject ? textObject.fill : '#FFFFFF',
          backgroundColor: '#dd303e',
          padding: 20,
          borderRadius: 10
        }
      };
    } else {
      return {
        id: obj.elementId,
        type: 'text',
        field: obj.fieldMapping,
        position,
        style: {
          fontSize: obj.fontSize / scale,
          fontFamily: obj.fontFamily,
          color: obj.fill
        }
      };
    }
  });
};
