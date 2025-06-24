import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';
import { getLessonThemeStyle } from './lessonThemeUtils';
import { breakTextToFitWidthSync } from './smartTextBreaker';
import { calculatePositionAdjustments } from './positionAdjuster';
import { measureTextWidthSync } from './textMeasurement';
import { ensureFontLoaded, FontConfig } from './fontLoader';
import { getMaxTextWidthForFormat, getTextAlignmentForFormat, getFormatSpecificPadding, getVerticalPadding } from './renderingUtils';

export const renderTextBoxElement = async (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  format: string,
  globalPositionAdjustments: Map<string, number>,
  allElements?: any[]
) => {
  const { field, position } = element;
  const textContent = getTextContent(field, eventData);
  
  if (!textContent) return;

  const userColors = getUserColors(eventData);
  const formatStyle = getStyleForField(format, field, userColors);
  
  // Ensure font is loaded before proceeding
  const fontConfig: FontConfig = {
    family: formatStyle.fontFamily,
    size: formatStyle.fontSize,
    weight: 'normal'
  };
  
  try {
    await ensureFontLoaded(fontConfig);
    console.log(`✅ Font loaded for ${field}: ${formatStyle.fontFamily}`);
  } catch (error) {
    console.warn(`⚠️ Font loading failed for ${field}, proceeding with fallback:`, error);
  }
  
  // Apply any global position adjustments
  let elementX = position?.x || 0;
  let elementY = (position?.y || 0) + (globalPositionAdjustments.get(field) || 0);

  if (field === "classTheme") {
    console.log("✅ Criando box de fundo para classTheme com quebra de linha inteligente");
    
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const themeStyle = getLessonThemeStyle(selectedStyleName, eventData, format);
    
    // Get format-specific text alignment and padding
    const textAlignment = getTextAlignmentForFormat(format);
    const horizontalPadding = getFormatSpecificPadding(format);
    const verticalPadding = getVerticalPadding();
    
    if (themeStyle) {
      // Calculate available width for text using improved format-specific limits
      const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
      
      // Break text intelligently while keeping original font settings
      const textBreakResult = breakTextToFitWidthSync(
        textContent,
        maxTextWidth,
        formatStyle.fontSize,
        formatStyle.fontFamily
      );

      // Create the text with broken lines and format-specific alignment
      const finalText = textBreakResult.lines.join('\n');
      const text = new FabricText(finalText, {
        fontSize: formatStyle.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: themeStyle.fontColor,
        textAlign: textAlignment,
        originX: 'left',
        originY: 'top'
      });

      // Fixed box width calculation - use maxLineWidth for multi-line text
      const boxWidth = textBreakResult.needsLineBreak ? 
        Math.max(textBreakResult.maxLineWidth + (horizontalPadding * 2), 140) :
        Math.max(measureTextWidthSync(finalText, formatStyle.fontSize, formatStyle.fontFamily) + (horizontalPadding * 2), 140);
      
      // Fixed box height calculation - use consistent vertical padding
      const boxHeight = textBreakResult.totalHeight + (verticalPadding * 2);

      const background = new Rect({
        left: 0,
        top: 0,
        width: boxWidth,
        height: boxHeight,
        fill: themeStyle.boxColor,
        rx: 10,
        ry: 10,
        originX: 'left',
        originY: 'top'
      });

      // Position text within the box based on alignment with precise centering
      if (textAlignment === 'center') {
        text.set({
          left: (boxWidth - (textBreakResult.needsLineBreak ? textBreakResult.maxLineWidth : text.width!)) / 2,
          top: verticalPadding
        });
      } else {
        // Left alignment with exact horizontal padding
        text.set({
          left: horizontalPadding,
          top: verticalPadding
        });
      }

      // Calculate position adjustments if text broke into multiple lines
      if (textBreakResult.needsLineBreak && allElements) {
        const heightIncrease = boxHeight - themeStyle.fixedBoxHeight;
        const adjustments = calculatePositionAdjustments(
          { x: elementX, y: elementY },
          themeStyle.fixedBoxHeight,
          boxHeight,
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
        finalHeight: boxHeight,
        maxLineWidth: textBreakResult.maxLineWidth,
        boxWidth: boxWidth,
        horizontalPadding: horizontalPadding,
        verticalPadding: verticalPadding,
        textHeight: text.height,
        finalText: finalText,
        textAlignment: textAlignment,
        maxTextWidth: maxTextWidth,
        fontLoaded: true
      });

      const group = new Group([background, text], {
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      
      canvas.add(group);
    } else {
      // Fallback logic with improved text breaking and format-specific alignment
      const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
      const horizontalPadding = getFormatSpecificPadding(format);
      const verticalPadding = getVerticalPadding();
      const textAlignment = getTextAlignmentForFormat(format);
      
      const textBreakResult = breakTextToFitWidthSync(
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
        textAlign: textAlignment
      });

      const backgroundColor = eventData.boxColor || '#dd303e';
      const borderRadius = 10;

      // Fixed box width calculation for fallback
      const boxWidth = textBreakResult.needsLineBreak ? 
        Math.max(textBreakResult.maxLineWidth + (horizontalPadding * 2), 140) :
        Math.max(measureTextWidthSync(finalText, formatStyle.fontSize, formatStyle.fontFamily) + (horizontalPadding * 2), 140);

      const background = new Rect({
        width: boxWidth,
        height: textBreakResult.totalHeight + (verticalPadding * 2),
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
  }
};
