
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';

const lessonThemeStyleColors = {
  'Green': { boxColor: '#CAFF39', fontColor: '#DD303E' },
  'Red':   { boxColor: '#DD303E', fontColor: '#CAFF39' },
  'White': { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  'Transparent': { boxColor: null, fontColor: null } // Special handling: fontColor will be eventData.textColor
};

const CLASS_THEME_BOX_HEIGHTS = {
  youtube: 100,
  feed: 64,
  stories: 100,
  bannerGCO: 40.4,
  ledStudio: 54,
  LP: 66,
  default: 50 // Default height if format not specified
};

export const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number,
  format: string
) => {
  console.log(`[addElementToCanvas ENTRY] Field: ${element?.field}, Type: ${element?.type}, lessonThemeBoxStyle: ${eventData?.lessonThemeBoxStyle}, boxColor: ${eventData?.boxColor}`);
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

  // Always treat classTheme as text_box regardless of the element type in layout
  if (field === 'classTheme') {
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const styleConfig = selectedStyleName ? lessonThemeStyleColors[selectedStyleName] : null;

    console.log('🎨 Processing classTheme with style:', {
      selectedStyleName,
      styleConfig,
      userBoxColor: eventData.boxColor,
      userBoxFontColor: eventData.boxFontColor
    });

    if (styleConfig) {
      if (styleConfig.boxColor === null) { // 'Transparent' style
        const text = new FabricText(textContent, {
          fontSize: formatStyle.fontSize,
          fontFamily: formatStyle.fontFamily,
          fill: userColors.textColor, // Use eventData.textColor
          textAlign: 'center',
          left: elementX,
          top: elementY,
          selectable: false,
          evented: false
        });
        canvas.add(text);
        console.log('✅ Added transparent classTheme text with user textColor');
      } else { // 'Green', 'Red', 'White' styles
        const text = new FabricText(textContent, {
          fontSize: formatStyle.fontSize,
          fontFamily: formatStyle.fontFamily,
          fill: styleConfig.fontColor, // Use fontColor from styleConfig
          textAlign: 'center'
        });

        // @ts-ignore
        const fixedBoxHeight = CLASS_THEME_BOX_HEIGHTS[format] || CLASS_THEME_BOX_HEIGHTS.default;
        const horizontalPadding = 20;
        const borderRadius = 10;

        const backgroundWidth = text.width + (horizontalPadding * 2);
        const backgroundHeight = fixedBoxHeight;

        const background = new Rect({
          left: 0, // Relative to group
          top: 0,  // Relative to group
          width: backgroundWidth,
          height: backgroundHeight,
          fill: styleConfig.boxColor, // Use boxColor from styleConfig
          rx: borderRadius,
          ry: borderRadius
        });

        // Adjust text position to be centered within the background rect in the group
        text.set({
          left: horizontalPadding, // Text starts after left padding
          top: (fixedBoxHeight - text.height) / 2 // Vertically center text
        });

        console.log('🎨 classTheme Styled Box Details:', {
          format: format,
          selectedStyle: selectedStyleName,
          styleBoxColor: styleConfig.boxColor,
          styleFontColor: styleConfig.fontColor,
          fixedBoxHeight: fixedBoxHeight,
          textWidth: text.width,
          textHeight: text.height,
          rectWidth: background.width,
          rectHeight: background.height
        });

        const group = new Group([background, text], {
          left: elementX, // Position of the group on the canvas
          top: elementY,  // Position of the group on the canvas
          selectable: false,
          evented: false
        });
        canvas.add(group);
        console.log('✅ Added styled classTheme box with predefined colors');
      }
    } else { // Fallback: use user's custom boxColor when no lessonThemeBoxStyle is set
      const text = new FabricText(textContent, {
        fontSize: formatStyle.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: userColors.boxFontColor, // Use user's boxFontColor
        textAlign: 'center'
      });

      const padding = 20;
      const backgroundColor = eventData.boxColor || '#dd303e'; // Use user's boxColor
      const borderRadius = 10;

      const background = new Rect({
        left: 0,
        top: 0,
        width: text.width! + (padding * 2),
        height: text.height! + (padding * 2),
        fill: backgroundColor,
        rx: borderRadius,
        ry: borderRadius
      });

      // Center text within background
      text.set({
        left: padding,
        top: padding
      });

      console.log('🎨 classTheme Fallback Box Details:', {
        format: format,
        userBoxColor: backgroundColor,
        userBoxFontColor: userColors.boxFontColor,
        textWidth: text.width,
        textHeight: text.height,
        rectWidth: background.width,
        rectHeight: background.height
      });

      const group = new Group([background, text], {
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      canvas.add(group);
      console.log('✅ Added fallback classTheme box with user colors');
    }
  } else {
    // Handle all other text fields normally
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
    console.log(`✅ Added regular text element: ${field}`);
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
