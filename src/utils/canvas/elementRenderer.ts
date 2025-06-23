
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent, shouldApplyTextBreaking } from './textUtils';
import { getLessonThemeStyle, lessonThemeStyleColors, CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';
import { breakTextToFitWidth } from './smartTextBreaker';
import { calculatePositionAdjustments } from './positionAdjuster';
import { measureTextWidth, getDynamicSafetyMargin, getAlignmentPadding } from './textMeasurement';

// Store position adjustments globally for this rendering session
let globalPositionAdjustments: Map<string, number> = new Map();

export const resetPositionAdjustments = () => {
  globalPositionAdjustments.clear();
};

// Helper function to get text alignment based on format
const getTextAlignmentForFormat = (format: string): 'left' | 'center' => {
  const leftAlignedFormats = ['youtube', 'feed', 'stories', 'ledStudio'];
  const centerAlignedFormats = ['bannerGCO', 'LP'];
  
  if (leftAlignedFormats.includes(format)) {
    return 'left';
  } else if (centerAlignedFormats.includes(format)) {
    return 'center';
  }
  
  // Default fallback
  return 'center';
};

// Improved format-specific max width calculation with accurate text measurement
const getMaxTextWidthForFormat = (format: string, canvasWidth: number, elementX: number, field: string): number => {
  // For date/time fields that don't need text breaking, use very generous width
  if (field === 'date' || field === 'time') {
    const alignmentPadding = getAlignmentPadding(format, elementX, canvasWidth);
    return Math.min(canvasWidth - elementX - alignmentPadding, 800); // Much more generous for date/time
  }
  
  // For teacher names, use generous limits with dynamic padding
  if (field === 'teacherName') {
    const dynamicMargin = getDynamicSafetyMargin(60); // Assume average teacher name font size
    const formatLimits = {
      'youtube': Math.min(canvasWidth - elementX - dynamicMargin, 700),
      'feed': Math.min(canvasWidth - elementX - dynamicMargin, 650),
      'stories': Math.min(canvasWidth - elementX - dynamicMargin, 600),
      'ledStudio': Math.min(canvasWidth - elementX - dynamicMargin, 600),
      'bannerGCO': Math.min(canvasWidth - elementX - dynamicMargin, 500),
      'LP': Math.min(canvasWidth - elementX - dynamicMargin, 550)
    };
    return formatLimits[format as keyof typeof formatLimits] || Math.min(canvasWidth - elementX - dynamicMargin, 500);
  }
  
  // For other fields that need text breaking, use improved limits
  const dynamicMargin = getDynamicSafetyMargin(100); // Assume larger font size for titles
  const formatLimits = {
    'youtube': Math.min(canvasWidth - elementX - dynamicMargin, 800),
    'feed': Math.min(canvasWidth - elementX - dynamicMargin, 750),    
    'stories': Math.min(canvasWidth - elementX - dynamicMargin, 700),
    'ledStudio': Math.min(canvasWidth - elementX - dynamicMargin, 700),
    'bannerGCO': Math.min(canvasWidth - elementX - dynamicMargin, 500),
    'LP': Math.min(canvasWidth - elementX - dynamicMargin, 550)
  };
  
  return formatLimits[format as keyof typeof formatLimits] || Math.min(canvasWidth - elementX - dynamicMargin, 450);
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
    
    // Get format-specific text alignment
    const textAlignment = getTextAlignmentForFormat(format);
    
    if (themeStyle) {
      // Calculate available width for text using improved format-specific limits
      const horizontalPadding = 20;
      const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
      
      // Break text intelligently while keeping original font settings
      const textBreakResult = breakTextToFitWidth(
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

      // Calculate box dimensions with improved padding calculation
      const fixedBoxHeight = textBreakResult.needsLineBreak ? 
        textBreakResult.totalHeight + 20 : 
        themeStyle.fixedBoxHeight;
      
      // Use accurate text measurement for better width calculation
      const actualTextWidth = measureTextWidth(finalText, formatStyle.fontSize, formatStyle.fontFamily);
      const minWidth = 140; // Increased minimum width
      const paddingSafety = 15; // Increased safety padding
      const backgroundWidth = Math.max(
        actualTextWidth + (horizontalPadding * 2) + paddingSafety,
        minWidth
      );
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

      // Position text within the box based on alignment with improved centering
      if (textAlignment === 'center') {
        text.set({
          left: (backgroundWidth - text.width!) / 2,
          top: (backgroundHeight - text.height!) / 2
        });
      } else {
        // Left alignment with proper padding
        text.set({
          left: horizontalPadding,
          top: (backgroundHeight - text.height!) / 2
        });
      }

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
        actualTextWidth: actualTextWidth,
        backgroundWidth: backgroundWidth,
        textHeight: text.height,
        finalText: finalText,
        textAlignment: textAlignment,
        maxTextWidth: maxTextWidth
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
        textAlign: textAlignment
      });

      const padding = 20;
      const backgroundColor = eventData.boxColor || '#dd303e';
      const borderRadius = 10;

      // Use accurate text measurement for better background width calculation
      const actualTextWidth = measureTextWidth(finalText, formatStyle.fontSize, formatStyle.fontFamily);
      const paddingSafety = 15;
      const backgroundWidth = Math.max(
        actualTextWidth + (padding * 2) + paddingSafety,
        140
      );

      const background = new Rect({
        width: backgroundWidth,
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
    // For all other text elements, apply conditional smart text breaking with improved measurement
    const needsTextBreaking = shouldApplyTextBreaking(field, eventData);
    let finalText = textContent;
    const textAlignment = getTextAlignmentForFormat(format);
    
    if (needsTextBreaking) {
      const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
      
      // Apply smart text breaking to prevent truncation
      const textBreakResult = breakTextToFitWidth(
        textContent,
        maxTextWidth,
        formatStyle.fontSize,
        formatStyle.fontFamily
      );

      finalText = textBreakResult.lines.join('\n');
      
      console.log('📝 Smart text breaking applied:', {
        field,
        textBroken: textBreakResult.needsLineBreak,
        lines: textBreakResult.lines.length,
        maxTextWidth: maxTextWidth,
        reason: 'conditional logic determined text breaking was needed'
      });
    } else {
      console.log('📝 No text breaking applied:', {
        field,
        reason: 'conditional logic determined text breaking was not needed'
      });
    }
    
    const text = new FabricText(finalText, {
      left: elementX,
      top: elementY,
      fontSize: formatStyle.fontSize,
      fontFamily: formatStyle.fontFamily,
      fill: formatStyle.color,
      textAlign: textAlignment,
      selectable: false,
      evented: false
    });

    console.log('📝 Text element added:', {
      field,
      fontSize: formatStyle.fontSize,
      fontFamily: formatStyle.fontFamily,
      text: finalText,
      smartBreakingApplied: needsTextBreaking,
      position: { x: elementX, y: elementY }
    });

    canvas.add(text);
  }
};
