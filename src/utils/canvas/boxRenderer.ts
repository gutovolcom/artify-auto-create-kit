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

      // Get the actual padding values for this format
      // Special case: If box color is transparent, remove horizontal padding
      const isTransparentBox = !themeStyle.boxColor || 
                              themeStyle.boxColor === 'transparent' || 
                              themeStyle.boxColor === 'rgba(0,0,0,0)' ||
                              (typeof themeStyle.boxColor === 'string' && themeStyle.boxColor.includes('transparent'));
      
      const actualHorizontalPadding = isTransparentBox ? 0 : horizontalPadding;
      
      // CRITICAL FIX: Use the actual Fabric.js text width, not inflated measurements
      const actualTextWidth = text.width || 0;
      
      // STEP 2: Calculate box width with conditional padding
      const boxWidth = actualTextWidth + (actualHorizontalPadding * 2);

      // STEP 3: Calculate box height
      const boxHeight = textBreakResult.totalHeight + (verticalPadding * 2);
      const borderRadius = getBorderRadius(format);

      // Only create background if not transparent
      let background;
      if (!isTransparentBox) {
        background = new Rect({
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
      }

      // STEP 4: Position text based on alignment and transparency
      if (textAlignment === 'center' && !isTransparentBox) {
        // Center alignment for LP and Destaque with visible background
        text.set({
          left: boxWidth / 2,
          top: verticalPadding,
          originX: 'center',
          originY: 'top',
          textAlign: 'center'
        });
      } else if (isTransparentBox) {
        // For transparent background, position text without padding
        text.set({
          left: 0,                    // No horizontal padding for transparent
          top: 0,                     // No vertical padding for transparent  
          originX: 'left',
          originY: 'top',
          textAlign: textAlignment    // Respect format alignment even without background
        });
      } else {
        // Normal left alignment with padding for visible backgrounds
        text.set({
          left: actualHorizontalPadding,
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

      // Enhanced logging for transparent detection  
      console.log('🎨 classTheme Box Details (with transparency check):', {
        format: format,
        selectedStyle: selectedStyleName,
        boxColor: themeStyle.boxColor,
        isTransparentBox: isTransparentBox,
        actualHorizontalPadding: actualHorizontalPadding,
        actualTextWidth: actualTextWidth,
        boxWidth: boxWidth,
        hasBackground: !!background,
        textAlignment: textAlignment,
        textPosition: { left: text.left, top: text.top }
      });

      // Create group with or without background
      const groupElements = background ? [background, text] : [text];
      const group = new Group(groupElements, {
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      
      canvas.add(group);
    } else {
      // Fallback logic with same transparency handling
      const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
      const horizontalPadding = getFormatSpecificPadding(format);
      const verticalPadding = getVerticalPadding(format);
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
        originX: 'left',
        originY: 'top'
      });

      const backgroundColor = eventData.boxColor || '#dd303e';
      const borderRadius = getBorderRadius(format);

      // Check for transparency in fallback
      const isTransparentBox = backgroundColor === 'transparent' || 
                              backgroundColor === 'rgba(0,0,0,0)' ||
                              (typeof backgroundColor === 'string' && backgroundColor.includes('transparent'));
      
      const actualHorizontalPadding = isTransparentBox ? 0 : horizontalPadding;
      const actualTextWidth = text.width || 0;
      const boxWidth = actualTextWidth + (actualHorizontalPadding * 2);

      // Only create background if not transparent
      let background;
      if (!isTransparentBox) {
        background = new Rect({
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
      }

      // Position text with transparency handling
      if (textAlignment === 'center' && !isTransparentBox) {
        text.set({
          left: boxWidth / 2,
          top: verticalPadding,
          originX: 'center',
          originY: 'top',
          textAlign: 'center'
        });
      } else if (isTransparentBox) {
        text.set({
          left: 0,
          top: 0,
          originX: 'left',
          originY: 'top',
          textAlign: textAlignment
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

      const groupElements = background ? [background, text] : [text];
      const group = new Group(groupElements, {
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      canvas.add(group);
    }
  }
};
