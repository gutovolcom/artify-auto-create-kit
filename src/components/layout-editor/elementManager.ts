
import * as fabric from 'fabric';
import { CanvasElementConfig } from './types';
import { constrainToCanvas } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

export const validateAndPositionElement = (
  config: CanvasElementConfig,
  format?: string,
  margin: number = 20
): { config: CanvasElementConfig; width: number; height: number } => {
  const elementConfig: CanvasElementConfig = {
    id: config?.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: config?.type || 'text',
    field: config?.field || 'title',
    position: config?.position || { x: 50, y: 50 },
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#333333',
      ...config?.style
    },
    size: config.size
  };

  const width = elementConfig.style?.width ||
                elementConfig.size?.width ||
                (elementConfig.type === 'image' ? 200 : 100);
  const height = elementConfig.style?.height ||
                 elementConfig.size?.height ||
                 (elementConfig.type === 'image' ? 200 : 50);

  if (format) {
    const elementSize = { width, height };
    const constrained = constrainToCanvas(
      { position: elementConfig.position, size: elementSize },
      format,
      margin
    );
    elementConfig.position = constrained.position;
    console.log(`🛡️ Position validated and constrained for format ${format}:`, {
      original: config.position,
      constrained: elementConfig.position,
      elementSize
    });
  }

  return { config: elementConfig, width, height };
};

export const addTextElement = (
  config: CanvasElementConfig,
  canvas: FabricCanvas,
  scale: number
): void => {
  const elementX = config.position.x * scale;
  const elementY = config.position.y * scale;
  const fontSize = (config.style.fontSize || 24) * scale;
  const fontFamily = config.style.fontFamily || 'Arial';
  const color = config.style.color || '#333333';

  const text = new fabric.Text(`[${config.field.toUpperCase()}]`, {
    left: elementX,
    top: elementY,
    fontSize,
    fill: color,
    fontFamily,
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
};

export const addImageElement = (
  config: CanvasElementConfig,
  canvas: FabricCanvas,
  scale: number,
  width: number,
  height: number
): void => {
  const elementX = config.position.x * scale;
  const elementY = config.position.y * scale;
  const rect = new fabric.Rect({
    left: elementX,
    top: elementY,
    width: width * scale,
    height: height * scale,
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
    fieldMapping: config.field,
    originalWidth: width,
    originalHeight: height
  });

  canvas.add(rect);
  console.log('✅ Image element added with preserved dimensions:', {
    left: rect.left,
    top: rect.top,
    width: width * scale,
    height: height * scale,
    originalSize: { width, height },
    id: config.id
  });
};

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

  const { config, width, height } = validateAndPositionElement(elementConfig, format, margin);

  console.log('🎨 Adding element to canvas with VALIDATED position and preserved dimensions:', {
    field: config.field,
    position: config.position,
    size: { width, height },
    type: config.type
  });

  try {
    if (config.type === 'image') {
      addImageElement(config, canvas, scale, width, height);
    } else {
      addTextElement(config, canvas, scale);
    }

    const objects = canvas.getObjects();
    const addedElement = objects[objects.length - 1];
    canvas.moveObjectTo(addedElement, objects.length - 1);
    canvas.renderAll();

    console.log('Element added successfully with boundary validation and preserved dimensions:', config.id);
  } catch (error) {
    console.error('Error adding element to canvas:', error);
  }
};
