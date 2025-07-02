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

// Format-specific border radius
const getBorderRadius = (format: string): number => {
  const radiusMap = {
    'destaque': 3,     // Much smaller radius for tiny format
    'bannerGCO': 6,    // Smaller radius for banner
    'ledStudio': 8,    // Medium radius
    'default': 10      // Standard radius for other formats
  };
  
  return radiusMap[format as keyof typeof radiusMap] || radiusMap.default;
};

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

      // Improved box width calculation - fix right padding issue
      let boxWidth;
      if (format === 'destaque') {
        // Special handling for destaque format - much tighter sizing
        const textWidth = textBreakResult.needsLineBreak ? 
          textBreakResult.maxLineWidth : 
          measureTextWidthSync(finalText, formatStyle.fontSize, formatStyle.fontFamily);
        
        // Minimal padding for destaque format (2px each side = 4px total)
        const destaqueHorizontalPadding = 4;
        boxWidth = textWidth + destaqueHorizontalPadding;
      } else {
        // Improved logic for other formats - ensure consistent left/right padding
        const actualTextWidth = textBreakResult.needsLineBreak ? 
          textBreakResult.maxLineWidth : 
          measureTextWidthSync(finalText, formatStyle.fontSize, formatStyle.fontFamily);
        
        // Use consistent padding calculation to fix right padding issue
        boxWidth = actualTextWidth + (horizontalPadding * 2);
        
        // Add debug logging for padding calculation
        console.log('📏 Box width calculation:', {
          format,
          actualTextWidth,
          horizontalPadding,
          totalPadding: horizontalPadding * 2,
          finalBoxWidth: boxWidth
        });
      }
      
      // Fixed box height calculation - use consistent vertical padding
      const boxHeight = textBreakResult.totalHeight + (verticalPadding * 2);
      const borderRadius = getBorderRadius(format);

      const background = new Rect({
        left: 0,
        top: 0,
        width: boxWidth,
        height: boxHeight,
        fill: themeStyle.boxColor,
        rx: borderRadius,
        ry: borderRadius,
        originX: 'left',
        originY: 'top'
      });

      // Improved text positioning within the box - fix centering and padding
      if (textAlignment === 'center') {
        // For center alignment, position text exactly in the center of the box
        text.set({
          left: boxWidth / 2,
          top: verticalPadding,
          originX: 'center',
          originY: 'top'
        });
      } else {
        // Left alignment with exact horizontal padding
        const actualHorizontalPadding = format === 'destaque' ? 2 : horizontalPadding;
        text.set({
          left: actualHorizontalPadding,
          top: verticalPadding,
          originX: 'left',
          originY: 'top'
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
        textAlign: textAlignment,
        originX: textAlignment === 'center' ? 'center' : 'left',
        originY: 'top'
      });

      const backgroundColor = eventData.boxColor || '#dd303e';
      const borderRadius = getBorderRadius(format);

      // Fixed box width calculation for fallback - use consistent logic
      let boxWidth;
      if (format === 'destaque') {
        // Special handling for destaque format in fallback
        const textWidth = textBreakResult.needsLineBreak ? 
          textBreakResult.maxLineWidth : 
          measureTextWidthSync(finalText, formatStyle.fontSize, formatStyle.fontFamily);
        
        boxWidth = textWidth + 4; // Minimal padding
      } else {
        // Improved logic for other formats - consistent padding
        const actualTextWidth = textBreakResult.needsLineBreak ? 
          textBreakResult.maxLineWidth : 
          measureTextWidthSync(finalText, formatStyle.fontSize, formatStyle.fontFamily);
        
        boxWidth = actualTextWidth + (horizontalPadding * 2);
      }

      const background = new Rect({
        left: 0,
        top: 0,
        width: boxWidth,
        height: textBreakResult.totalHeight + (verticalPadding * 2),
        fill: backgroundColor,
        rx: borderRadius,
        ry: borderRadius,
        originX: 'left',
        originY: 'top'
      });

      // Position text correctly in fallback scenario
      if (textAlignment === 'center') {
        text.set({
          left: boxWidth / 2,
          top: verticalPadding
        });
      } else {
        const actualHorizontalPadding = format === 'destaque' ? 2 : horizontalPadding;
        text.set({
          left: actualHorizontalPadding,
          top: verticalPadding
        });
      }

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
