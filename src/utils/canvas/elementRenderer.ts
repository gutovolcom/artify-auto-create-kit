
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
  const { type, field, position, size } = element;

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
        textAlign: 'center'
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
        ry: borderRadius
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
