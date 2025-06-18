
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';
import { getLessonThemeStyle, lessonThemeStyleColors, CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';
import { constrainSmartTextToCanvas } from './enhancedTextConstraints';

export const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number,
  format: string
) => {
  let type = element.type;
  const {field, position, size } = element;
  console.log(`📌 Processing element: field=${field}, type=${type}`);

  // FORÇA TIPO text_box PARA classTheme
  if (field === 'classTheme' && type !== 'text_box') {
    console.warn('🚨 Forçando type text_box para classTheme dentro do renderer');
    type = 'text_box';
  }
  
  if (type === "image" && (field === "teacherImages" || field === "professorPhotos")) {
    return;
  }
  
  const textContent = getTextContent(field, eventData);
  if (!textContent) return;

  const userColors = getUserColors(eventData);
  const formatStyle = getStyleForField(format, field, userColors);
  const elementX = position?.x || 0;
  const elementY = position?.y || 0;

  // Get occupied areas for collision detection
  const occupiedAreas = getOccupiedAreas(canvas, field);

  if (type === "text_box" && field === "classTheme") {
    console.log("✅ Criando box de fundo para classTheme com smart text");
    
    // Handle lesson theme style configuration using shared utility
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const themeStyle = getLessonThemeStyle(selectedStyleName, eventData, format);
    
    if (themeStyle) {
      // Use smart text sizing for the theme
      const smartTextResult = constrainSmartTextToCanvas(
        textContent,
        elementX,
        elementY,
        formatStyle.fontSize,
        formatStyle.fontFamily,
        canvasWidth,
        canvasHeight,
        field,
        format,
        occupiedAreas
      );

      const text = new FabricText(smartTextResult.text, {
        fontSize: smartTextResult.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: themeStyle.fontColor,
        textAlign: 'center',
        originX: 'left',
        originY: 'top'
      });

      const fixedBoxHeight = themeStyle.fixedBoxHeight;
      const horizontalPadding = 20;
      const borderRadius = 10;

      // Use smart text width for box sizing
      const backgroundWidth = Math.max(smartTextResult.actualWidth + (horizontalPadding * 2), 100);
      const backgroundHeight = fixedBoxHeight;

      const background = new Rect({
        left: 0,
        top: 0,
        width: backgroundWidth,
        height: backgroundHeight,
        fill: themeStyle.boxColor,
        rx: borderRadius,
        ry: borderRadius,
        originX: 'left',
        originY: 'top'
      });

      // Center text in the box
      text.set({
        left: horizontalPadding,
        top: (fixedBoxHeight - smartTextResult.actualHeight) / 2
      });

      console.log('🎨 Smart classTheme Box Details:', {
        format: format,
        selectedStyle: selectedStyleName,
        smartFontSize: smartTextResult.fontSize,
        originalText: textContent,
        finalText: smartTextResult.text,
        boxWidth: backgroundWidth,
        boxHeight: backgroundHeight
      });

      const group = new Group([background, text], {
        left: smartTextResult.position.x,
        top: smartTextResult.position.y,
        selectable: false,
        evented: false
      });
      
      canvas.add(group);
    } else {
      // Fallback with smart text sizing
      const smartTextResult = constrainSmartTextToCanvas(
        textContent,
        elementX,
        elementY,
        formatStyle.fontSize,
        formatStyle.fontFamily,
        canvasWidth,
        canvasHeight,
        field,
        format,
        occupiedAreas
      );

      const text = new FabricText(smartTextResult.text, {
        fontSize: smartTextResult.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: formatStyle.color,
        textAlign: 'center'
      });

      const padding = 20;
      const backgroundColor = eventData.boxColor || '#dd303e';
      const borderRadius = 10;

      const background = new Rect({
        width: smartTextResult.actualWidth + (padding * 2),
        height: smartTextResult.actualHeight + (padding * 2),
        fill: backgroundColor,
        rx: borderRadius,
        ry: borderRadius
      });

      const group = new Group([background, text], {
        left: smartTextResult.position.x,
        top: smartTextResult.position.y,
        selectable: false,
        evented: false
      });
      canvas.add(group);
    }
  } else {
    // Apply smart text sizing to all other text elements
    const smartTextResult = constrainSmartTextToCanvas(
      textContent,
      elementX,
      elementY,
      formatStyle.fontSize,
      formatStyle.fontFamily,
      canvasWidth,
      canvasHeight,
      field,
      format,
      occupiedAreas
    );

    const text = new FabricText(smartTextResult.text, {
      left: smartTextResult.position.x,
      top: smartTextResult.position.y,
      fontSize: smartTextResult.fontSize,
      fontFamily: formatStyle.fontFamily,
      fill: formatStyle.color,
      selectable: false,
      evented: false
    });

    console.log('📝 Smart text element created:', {
      field,
      originalFontSize: formatStyle.fontSize,
      smartFontSize: smartTextResult.fontSize,
      originalText: textContent,
      finalText: smartTextResult.text,
      originalPosition: { x: elementX, y: elementY },
      finalPosition: smartTextResult.position,
      dimensions: { width: smartTextResult.actualWidth, height: smartTextResult.actualHeight }
    });

    canvas.add(text);
  }
};

// Helper function to get occupied areas for collision detection
const getOccupiedAreas = (canvas: FabricCanvas, currentField: string) => {
  const occupiedAreas: any[] = [];
  
  canvas.getObjects().forEach(obj => {
    // Skip the current field to avoid self-collision
    if ((obj as any).fieldMapping === currentField) return;
    
    // Add existing objects as occupied areas
    occupiedAreas.push({
      x: obj.left || 0,
      y: obj.top || 0,
      width: obj.width || 0,
      height: obj.height || 0
    });
  });
  
  return occupiedAreas;
};
