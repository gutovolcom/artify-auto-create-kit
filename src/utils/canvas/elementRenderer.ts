
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';

export const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number,
  format: string
) => {
  const { type, field, position, size } = element;
  
  // Handle both teacherImages and professorPhotos field names
  if (type === 'image' && (field === 'teacherImages' || field === 'professorPhotos')) {
    return; // Handled separately
  }

  const textContent = getTextContent(field, eventData);
  if (!textContent) return;

  // Apply DIRECT coordinates from layout (already unscaled)
  const elementX = position?.x ?? 0;
  const elementY = position?.y ?? 0;
  
  console.log(`🎯 Applying DIRECT coordinates for ${field}:`, {
    x: elementX,
    y: elementY,
    canvasSize: { width: canvasWidth, height: canvasHeight },
    format
  });

  // Get format-specific styling
  const userColors = getUserColors(eventData);
  const formatStyle = getStyleForField(format, field, userColors);
  
  console.log(`✅ Applied format-specific style for ${format}.${field}:`, formatStyle);

  if (type === 'text_box' && field === 'classTheme') {
    const text = new FabricText(textContent, {
      fontSize: formatStyle.fontSize,
      fontFamily: formatStyle.fontFamily,
      fill: formatStyle.color,
      textAlign: 'center'
    });

    const padding = 20;
    const backgroundColor = eventData.boxColor || '#dd303e';
    const borderRadius = 10;

    const background = new Rect({
      width: text.width! + (padding * 2),
      height: text.height! + (padding * 2),
      fill: backgroundColor,
      rx: borderRadius,
      ry: borderRadius
    });

    const group = new Group([background, text], {
      left: elementX,
      top: elementY,
      selectable: false,
      evented: false
    });

    canvas.add(group);
  } else {
    const text = new FabricText(textContent, {
      left: elementX,
      top: elementY,
      fontSize: formatStyle.fontSize,
      fontFamily: formatStyle.fontFamily,
      fill: formatStyle.color,
      selectable: false,
      evented: false
    });

    canvas.add(text);
  }
};

export const addProfessorPhotoToCanvas = async (
  canvas: FabricCanvas,
  photoUrl: string,
  photoElement: any | null,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Adding professor photo:', photoUrl, 'with element config:', photoElement);
    
    FabricImage.fromURL(photoUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (photoElement && photoElement.position && photoElement.size) {
        // Use DIRECT layout coordinates (already unscaled)
        const targetWidth = photoElement.size.width || 200;
        const targetHeight = photoElement.size.height || 200;
        const elementX = photoElement.position.x;
        const elementY = photoElement.position.y;
        
        console.log('🖼️ Using DIRECT layout position for teacher photo:', {
          x: elementX,
          y: elementY,
          width: targetWidth,
          height: targetHeight,
          canvasSize: { width: canvasWidth, height: canvasHeight }
        });
        
        img.set({
          left: elementX,
          top: elementY,
          scaleX: targetWidth / img.width!,
          scaleY: targetHeight / img.height!,
          selectable: false,
          evented: false
        });
      } else {
        // Use default positioning
        const defaultSize = Math.min(canvasWidth, canvasHeight) * 0.2;
        console.log('Using default positioning for teacher photo:', {
          x: canvasWidth - defaultSize - 20,
          y: canvasHeight - defaultSize - 20,
          size: defaultSize
        });
        
        img.set({
          left: canvasWidth - defaultSize - 20,
          top: canvasHeight - defaultSize - 20,
          scaleX: defaultSize / img.width!,
          scaleY: defaultSize / img.height!,
          selectable: false,
          evented: false
        });
      }
      
      canvas.add(img);
      canvas.renderAll();
      console.log('Professor photo added successfully');
      resolve();
    }).catch((error) => {
      console.error('Error loading professor photo:', error);
      reject(error);
    });
  });
};
