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
    const verticalPadding = getVerticalPadding(format);
    
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

      // Create the text with broken lines and left alignment for consistent positioning
      const finalText = textBreakResult.lines.join('\n');
      const text = new FabricText(finalText, {
        fontSize: formatStyle.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: themeStyle.fontColor,
        textAlign: 'left',  // Force left alignment for consistent positioning
        originX: 'left',
        originY: 'top'
      });

      // Remove hardcoded destaque override - use proper format-specific padding
      const actualHorizontalPadding = horizontalPadding; // This now respects getFormatSpecificPadding()
      
      // CRITICAL FIX: Use the actual Fabric.js text width, not inflated measurements
      const actualTextWidth = text.width || 0;
      
      // STEP 2: Calculate box width with exact padding using REAL text width
      const boxWidth = actualTextWidth + (actualHorizontalPadding * 2);

      // STEP 3: Calculate box height with format-specific vertical padding
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

      // STEP 4: Position text based on alignment - CENTER for LP and Destaque, LEFT for others
      if (textAlignment === 'center') {
        // Center alignment for LP and Destaque formats
        text.set({
          left: boxWidth / 2,           // Position at center of box
          top: verticalPadding,
          originX: 'center',            // Text origin at center for perfect centering
          originY: 'top',
          textAlign: 'center'           // Ensure text is center-aligned
        });
      } else {
        // Left alignment for other formats
        text.set({
          left: actualHorizontalPadding,  // Position at exact padding distance from left
          top: verticalPadding,
          originX: 'left',
          originY: 'top',
          textAlign: 'left'
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

      console.log('🎨 classTheme Box Details (FIXED):', {
        format: format,
        selectedStyle: selectedStyleName,
        textBroken: textBreakResult.needsLineBreak,
        lines: textBreakResult.lines.length,
        originalHeight: themeStyle.fixedBoxHeight,
        finalHeight: boxHeight,
        maxLineWidth: textBreakResult.maxLineWidth,
        actualTextWidth: actualTextWidth,
        boxWidth: boxWidth,
        actualHorizontalPadding: actualHorizontalPadding,
        leftPadding: actualHorizontalPadding,
        rightPadding: actualHorizontalPadding,
        verticalPadding: verticalPadding,
        textHeight: text.height,
        finalText: finalText,
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
      // Fallback logic with format-specific vertical padding
      const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
      const horizontalPadding = getFormatSpecificPadding(format);
      const verticalPadding = getVerticalPadding(format);
      
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
        textAlign: 'left',  // Force left alignment for consistent positioning
        originX: 'left',
        originY: 'top'
      });

      const backgroundColor = eventData.boxColor || '#dd303e';
      const borderRadius = getBorderRadius(format);

      // Remove hardcoded destaque override here too
      const actualHorizontalPadding = horizontalPadding; // Use proper format-specific padding
      
      const actualTextWidth = text.width || 0; // Use actual Fabric.js text width
      const boxWidth = actualTextWidth + (actualHorizontalPadding * 2);

      const background = new Rect({
        left: 0,
        top: 0,
        width: boxWidth,
        height: textBreakResult.totalHeight + (verticalPadding * 2), // Uses format-specific padding
        fill: backgroundColor,
        rx: borderRadius,
        ry: borderRadius,
        originX: 'left',
        originY: 'top'
      });

      // Position text based on alignment in fallback
      if (textAlignment === 'center') {
        text.set({
          left: boxWidth / 2,
          top: verticalPadding,
          originX: 'center',
          originY: 'top',
          textAlign: 'center'
        });
      } else {
        text.set({
          left: actualHorizontalPadding,
          top: verticalPadding,
          originX: 'left',
          originY: 'top',
          textAlign: 'left'
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
