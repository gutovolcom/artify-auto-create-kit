import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';
import { getLessonThemeStyle, lessonThemeStyleColors, CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';
import { breakTextToFitWidth } from './smartTextBreaker';
import { calculatePositionAdjustments } from './positionAdjuster';

// Store position adjustments globally for this rendering session
let globalPositionAdjustments: Map<string, number> = new Map();

export const resetPositionAdjustments = () => {
  globalPositionAdjustments.clear();
};

export const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number,
  format: string,
  allElements?: any[]
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
  
  // Apply any global position adjustments
  let elementX = position?.x || 0;
  let elementY = (position?.y || 0) + (globalPositionAdjustments.get(field) || 0);

  if (type === "text_box" && field === "classTheme") {
    console.log("✅ Criando box de fundo para classTheme com quebra de linha inteligente");
    
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const themeStyle = getLessonThemeStyle(selectedStyleName, eventData, format);
    
    if (themeStyle) {
      // Calculate available width for text (box width minus padding)
      const horizontalPadding = 20;
      const maxTextWidth = Math.min(canvasWidth - elementX - horizontalPadding * 2, 400); // Max reasonable width
      
      // Break text intelligently while keeping original font settings
      const textBreakResult = breakTextToFitWidth(
        textContent,
        maxTextWidth,
        formatStyle.fontSize,
        formatStyle.fontFamily
      );

      // Create the text with broken lines
      const finalText = textBreakResult.lines.join('\n');
      const text = new FabricText(finalText, {
        fontSize: formatStyle.fontSize, // Keep original font size
        fontFamily: formatStyle.fontFamily, // Keep original font family
        fill: themeStyle.fontColor,
        textAlign: 'center',
        originX: 'left',
        originY: 'top'
      });

      // Calculate box dimensions
      const fixedBoxHeight = textBreakResult.needsLineBreak ? 
        textBreakResult.totalHeight + 20 : // Extra height for multi-line
        themeStyle.fixedBoxHeight; // Original height for single line
      
      const backgroundWidth = Math.max(text.width! + (horizontalPadding * 2), 200); // Minimum width
      const backgroundHeight = Math.max(fixedBoxHeight, textBreakResult.totalHeight + 20);

      const background = new Rect({
        left: 0,
        top: 0,
        width: backgroundWidth,
        height: backgroundHeight,
        fill: themeStyle.boxColor,
        rx: 10,
        ry: 10,
        originX: 'left',
        originY: 'top'
      });

      // Center text within the box
      text.set({
        left: horizontalPadding,
        top: (backgroundHeight - text.height!) / 2
      });

      // Calculate position adjustments if text broke into multiple lines
      if (textBreakResult.needsLineBreak && allElements) {
        const heightIncrease = backgroundHeight - themeStyle.fixedBoxHeight;
        const adjustments = calculatePositionAdjustments(
          { x: elementX, y: elementY },
          themeStyle.fixedBoxHeight,
          backgroundHeight,
          allElements.map(el => ({ field: el.field, position: el.position }))
        );

        // Store adjustments for other elements
        adjustments.forEach(adj => {
          globalPositionAdjustments.set(adj.field, adj.adjustment.adjustment);
        });

        console.log('📏 Position adjustments calculated:', adjustments);
      }

      console.log('🎨 classTheme Box Details:', {
        format: format,
        selectedStyle: selectedStyleName,
        textBroken: textBreakResult.needsLineBreak,
        lines: textBreakResult.lines.length,
        originalHeight: themeStyle.fixedBoxHeight,
        finalHeight: backgroundHeight,
        textWidth: text.width,
        textHeight: text.height,
        finalText: finalText
      });

      const group = new Group([background, text], {
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      
      canvas.add(group);
    } else {
      // Fallback logic with text breaking
      const maxTextWidth = Math.min(canvasWidth - elementX - 40, 400);
      const textBreakResult = breakTextToFitWidth(
        textContent,
        maxTextWidth,
        formatStyle.fontSize,
        formatStyle.fontFamily
      );

      const finalText = textBreakResult.lines.join('\n');
      const text = new FabricText(finalText, {
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
    }
  } else {
    // For all other text elements, keep original formatting but ensure no truncation
    const isDate = field === "date";
    const fontFamily = isDate ? "TorokaWide" : formatStyle.fontFamily;
    
    const text = new FabricText(textContent, {
      left: elementX,
      top: elementY,
      fontSize: formatStyle.fontSize, // Keep original font size
      fontFamily: formatStyle.fontFamily, // Keep original font family
      fill: formatStyle.color,
      selectable: false,
      evented: false
    });

    console.log('📝 Text element added with original formatting:', {
      field,
      fontSize: formatStyle.fontSize,
      fontFamily: formatStyle.fontFamily,
      text: textContent,
      position: { x: elementX, y: elementY }
    });

    canvas.add(text);
  }
};
