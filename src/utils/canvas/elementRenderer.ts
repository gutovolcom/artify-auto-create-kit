
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';
import { getLessonThemeStyle, lessonThemeStyleColors, CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';
import { constrainTextToCanvas } from './textConstraints';



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

  if (type === "text_box" && field === "classTheme") {
    console.log("✅ Criando box de fundo para classTheme");
    // Handle lesson theme style configuration using shared utility
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const themeStyle = getLessonThemeStyle(selectedStyleName, eventData, format);
    
    if (themeStyle) {
      // Calculate optimal text size to prevent truncation
      const maxTextWidth = (canvasWidth - elementX) * 0.8; // Leave some margin
      const textConstraints = constrainTextToCanvas(
        textContent,
        elementX,
        elementY,
        formatStyle.fontSize,
        formatStyle.fontFamily,
        canvasWidth,
        canvasHeight,
        40 // Extra padding for the box
      );

        const text = new FabricText(textConstraints.text, {
        fontSize: textConstraints.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: themeStyle.fontColor,
        textAlign: 'center',
        originX: 'left',
        originY: 'top'
      });


      const fixedBoxHeight = themeStyle.fixedBoxHeight;
      const horizontalPadding = 20;
      const borderRadius = 10;

      const backgroundWidth = Math.min(text.width! + (horizontalPadding * 2), maxTextWidth);
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


        text.set({
        left: horizontalPadding,
        top: (fixedBoxHeight - text.height!) / 2
      });


      console.log('🎨 classTheme Box Details:', {
        format: format,
        selectedStyle: selectedStyleName,
        fixedBoxHeight: fixedBoxHeight,
        textWidth: text.width,
        textHeight: text.height,
        rectWidth: background.width,
        rectHeight: background.height,
        rectFill: background.fill,
        textLeftInGroup: text.left,
        textTopInGroup: text.top,
        constrainedFontSize: textConstraints.fontSize,
        originalText: textContent,
        finalText: textConstraints.text
      });

      const group = new Group([background, text], {
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      console.log("🧱 Adicionando group com box + texto:", {
  text: text.text,
  position: { x: elementX, y: elementY },
  rectWidth: background.width,
  rectHeight: background.height
      });
      
      canvas.add(group);
    } else {
      // Fallback to original logic if styleConfig is not found
      console.log("⚠️ classTheme styleConfig not found or invalid. Using fallback. eventData.lessonThemeBoxStyle was:", eventData?.lessonThemeBoxStyle, "eventData.boxColor:", eventData?.boxColor);
      
      // Apply text constraints for fallback as well
      const textConstraints = constrainTextToCanvas(
        textContent,
        elementX,
        elementY,
        formatStyle.fontSize,
        formatStyle.fontFamily,
        canvasWidth,
        canvasHeight,
        40
      );

      const text = new FabricText(textConstraints.text, {
        fontSize: textConstraints.fontSize,
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
    }
  } else {
    // Apply text constraints to prevent truncation for all other text elements
    const textConstraints = constrainTextToCanvas(
      textContent,
      elementX,
      elementY,
      formatStyle.fontSize,
      formatStyle.fontFamily,
      canvasWidth,
      canvasHeight
    );

    const isDate = field === "date";
    const fontFamily = isDate ? "TorokaWide" : formatStyle.fontFamily;
    const content = getTextContent(field, eventData);
    
    const text = new FabricText(textConstraints.text, {
      left: elementX,
      top: elementY,
      fontSize: textConstraints.fontSize,
      fontFamily: formatStyle.fontFamily,
      fill: formatStyle.color,
      selectable: false,
      evented: false
    });

    console.log('📝 Text element constrained:', {
      field,
      originalFontSize: formatStyle.fontSize,
      constrainedFontSize: textConstraints.fontSize,
      originalText: textContent,
      finalText: textConstraints.text,
      position: { x: elementX, y: elementY },
      canvasSize: { width: canvasWidth, height: canvasHeight }
    });

    canvas.add(text);
  }
};
