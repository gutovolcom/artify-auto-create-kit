
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';
import { renderClassTheme } from './classThemeRenderer';
import { renderRegularText } from './textRenderer';

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

fix/font-updates
  if (type === 'text_box' && field === 'classTheme') {
    console.log("🚀 Entered classTheme text_box rendering for field:", field);
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    // @ts-ignore
    const styleConfig = selectedStyleName ? lessonThemeStyleColors[selectedStyleName] : null;

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
      } else { // This is the block to modify for 'Green', 'Red', 'White'
        const text = new FabricText(textContent, {
          // IMPORTANT: Set originX and originY to 'center' for easier positioning within the group later if needed,
          // but for now, we'll calculate top/left based on default top-left origin.
          // Consider text.set({ originX: 'center', originY: 'center' }); if direct centering is easier.
          // However, the current plan is explicit top/left.
          fontSize: formatStyle.fontSize,
          fontFamily: formatStyle.fontFamily,
          fill: styleConfig.fontColor, // Use fontColor from styleConfig
          textAlign: 'center' // Keep textAlign, useful if text.width is less than final box width.
        });

        // @ts-ignore
        const fixedBoxHeight = CLASS_THEME_BOX_HEIGHTS[format] || CLASS_THEME_BOX_HEIGHTS.default;
        const horizontalPadding = 20; // Keep this for now, can be made configurable later
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
          textTopInGroup: text.top
        });

        const group = new Group([background, text], {
          left: elementX, // Position of the group on the canvas
          top: elementY,  // Position of the group on the canvas
          selectable: false,
          evented: false
        });
        canvas.add(group);
      }
    } else { // Fallback to original logic if styleConfig is not found
      console.log("⚠️ classTheme styleConfig not found or invalid. Using fallback. eventData.lessonThemeBoxStyle was:", eventData?.lessonThemeBoxStyle, "eventData.boxColor:", eventData?.boxColor);
      const text = new FabricText(textContent, {
        fontSize: formatStyle.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: formatStyle.color, // Original fill color
        textAlign: 'center'
      });

      const padding = 20;
      const backgroundColor = eventData.boxColor || '#dd303e'; // Original background color
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
main
  } else {
    // Handle all other text fields normally
    renderRegularText(canvas, textContent, field, formatStyle, elementX, elementY);
  }
};

// Re-export for backward compatibility
export { addProfessorPhotoToCanvas } from './professorPhotoRenderer';
