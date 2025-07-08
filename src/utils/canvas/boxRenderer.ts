/**
 * Box Renderer Utility
 * 
 * Handles rendering of text box elements with background boxes on Fabric.js canvas.
 * Supports theme styling, transparency detection, text alignment, and position adjustments.
 * 
 * Key features:
 * - Automatic text breaking for long content
 * - Transparent background detection
 * - Format-specific styling and positioning
 * - Multi-line text position adjustments
 * - Theme-based color schemes
 */

import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent, shouldCalculatePositionAdjustments } from './textUtils';
import { getLessonThemeStyle } from './lessonThemeUtils';
import { breakTextToFitWidthSync } from './smartTextBreaker';
import { calculatePositionAdjustments } from './positionAdjuster';
import { ensureFontLoaded, FontConfig } from './fontLoader';
import { getMaxTextWidthForFormat, getTextAlignmentForFormat, getFormatSpecificPadding, getVerticalPadding } from './renderingUtils';
import { CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';

// TypeScript interfaces for better type safety
interface TextBreakResult {
  lines: string[];
  totalHeight: number;
}

interface ThemeStyle {
  boxColor: string | null;
  fontColor: string;
  fixedBoxHeight: number;
}

interface TransparencyConfig {
  isTransparent: boolean;
  horizontalPadding: number;
}

interface BoxDimensions {
  width: number;
  height: number;
  borderRadius: number;
}

interface TextPositioning {
  left: number;
  top: number;
  originX: 'left' | 'center';
  originY: 'top';
  textAlign: 'left' | 'center';
}

interface CanvasElement {
  field: string;
  position?: { x: number; y: number };
  type?: string;
}

interface ElementPosition {
  field: string;
  position: { x: number; y: number };
}

// Configuration constants
const DEFAULT_BOX_COLOR = '#dd303e';
const TRANSPARENCY_INDICATORS = ['transparent', 'rgba(0,0,0,0)'] as const;

const BORDER_RADIUS_CONFIG = {
  destaque: 3,     // Much smaller radius for tiny format
  bannerGCO: 6,    // Smaller radius for banner
  ledStudio: 8,    // Medium radius
  default: 10      // Standard radius for other formats
} as const;

// Format-specific border radius
const getBorderRadius = (format: string): number => {
  return BORDER_RADIUS_CONFIG[format as keyof typeof BORDER_RADIUS_CONFIG] || BORDER_RADIUS_CONFIG.default;
};

/**
 * Determines if a box color represents transparency and calculates appropriate padding
 */
const createTransparencyConfig = (
  boxColor: string | null | undefined,
  basePadding: number
): TransparencyConfig => {
  const isTransparent = !boxColor || 
                       TRANSPARENCY_INDICATORS.includes(boxColor as typeof TRANSPARENCY_INDICATORS[number]) ||
                       (typeof boxColor === 'string' && boxColor.includes('transparent'));
  
  return {
    isTransparent,
    horizontalPadding: isTransparent ? 0 : basePadding
  };
};

/**
 * Calculates box dimensions based on text width, transparency, and padding
 */
const calculateBoxDimensions = (
  textWidth: number,
  textHeight: number,
  transparencyConfig: TransparencyConfig,
  verticalPadding: number,
  format: string
): BoxDimensions => {
  const width = textWidth + (transparencyConfig.horizontalPadding * 2);
  const height = textHeight + (verticalPadding * 2);
  const borderRadius = getBorderRadius(format);
  
  return { width, height, borderRadius };
};

/**
 * Creates a Fabric.js text element with consistent styling
 */
const createTextElement = (
  textContent: string,
  fontSize: number,
  fontFamily: string,
  color: string
): FabricText => {
  return new FabricText(textContent, {
    fontSize,
    fontFamily,
    fill: color,
    textAlign: 'left',
    originX: 'left',
    originY: 'top'
  });
};

/**
 * Creates a background rectangle if not transparent
 */
const createBackgroundElement = (
  dimensions: BoxDimensions,
  backgroundColor: string | null,
  isTransparent: boolean
): Rect | null => {
  if (isTransparent) {
    return null;
  }
  
  return new Rect({
    left: 0,
    top: 0,
    width: dimensions.width,
    height: dimensions.height,
    fill: backgroundColor || DEFAULT_BOX_COLOR,
    rx: dimensions.borderRadius,
    ry: dimensions.borderRadius,
    originX: 'left',
    originY: 'top'
  });
};

/**
 * Calculates text positioning based on alignment and transparency
 */
const calculateTextPositioning = (
  textAlignment: 'left' | 'center',
  transparencyConfig: TransparencyConfig,
  boxWidth: number,
  verticalPadding: number
): TextPositioning => {
  if (textAlignment === 'center' && !transparencyConfig.isTransparent) {
    return {
      left: boxWidth / 2,
      top: verticalPadding,
      originX: 'center',
      originY: 'top',
      textAlign: 'center'
    };
  } else if (transparencyConfig.isTransparent) {
    return {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      textAlign: textAlignment
    };
  } else {
    return {
      left: transparencyConfig.horizontalPadding,
      top: verticalPadding,
      originX: 'left',
      originY: 'top',
      textAlign: 'left'
    };
  }
};

/**
 * Applies text positioning to a Fabric.js text element
 */
const positionTextInBox = (
  text: FabricText,
  positioning: TextPositioning
): void => {
  text.set({
    left: positioning.left,
    top: positioning.top,
    originX: positioning.originX,
    originY: positioning.originY,
    textAlign: positioning.textAlign
  });
};

/**
 * Handles position adjustments when text breaks into multiple lines
 */
const handlePositionAdjustments = (
  textBreakResult: TextBreakResult,
  allElements: CanvasElement[] | undefined,
  elementPosition: { x: number; y: number },
  fixedBoxHeight: number,
  actualBoxHeight: number,
  globalPositionAdjustments: Map<string, number>,
  format: string
): void => {
  if (!shouldCalculatePositionAdjustments(textBreakResult, allElements)) {
    return;
  }
  
  const adjustments = calculatePositionAdjustments(
    elementPosition,
    fixedBoxHeight,
    actualBoxHeight,
    allElements!.map(el => ({ field: el.field, position: el.position! })),
    format
  );

  adjustments.forEach(adj => {
    globalPositionAdjustments.set(adj.field, adj.adjustment.adjustment);
  });

  console.log('📏 Position adjustments calculated:', {
    format,
    textLines: textBreakResult.lines.length,
    heightIncrease: actualBoxHeight - fixedBoxHeight,
    adjustments
  });
};

/**
 * Creates and adds a group to the canvas
 */
const createAndAddGroup = (
  canvas: FabricCanvas,
  background: Rect | null,
  text: FabricText,
  elementX: number,
  elementY: number
): void => {
  const groupElements = background ? [background, text] : [text];
  const group = new Group(groupElements, {
    left: elementX,
    top: elementY,
    selectable: false,
    evented: false
  });
  
  canvas.add(group);
};

export const renderTextBoxElement = async (
  canvas: FabricCanvas,
  element: CanvasElement,
  eventData: EventData,
  canvasWidth: number,
  format: string,
  globalPositionAdjustments: Map<string, number>,
  allElements?: CanvasElement[]
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
  const elementX = position?.x || 0;
  const elementY = (position?.y || 0) + (globalPositionAdjustments.get(field) || 0);

  if (field === "classTheme") {
    console.log("✅ Criando box de fundo para classTheme com quebra de linha inteligente");
    
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const themeStyle = getLessonThemeStyle(selectedStyleName, eventData, format);
    
    // Get format-specific configurations
    const textAlignment = getTextAlignmentForFormat(format);
    const horizontalPadding = getFormatSpecificPadding(format);
    const verticalPadding = getVerticalPadding(format);
    const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
    
    // Break text intelligently
    const textBreakResult = breakTextToFitWidthSync(
      textContent,
      maxTextWidth,
      formatStyle.fontSize,
      formatStyle.fontFamily
    );

    // Determine colors and transparency
    const boxColor = themeStyle?.boxColor || eventData.boxColor || DEFAULT_BOX_COLOR;
    const fontColor = themeStyle?.fontColor || formatStyle.color;
    const transparencyConfig = createTransparencyConfig(boxColor, horizontalPadding);
    
    // Create text element
    const finalText = textBreakResult.lines.join('\n');
    const text = createTextElement(finalText, formatStyle.fontSize, formatStyle.fontFamily, fontColor);
    
    // Calculate dimensions
    const actualTextWidth = text.width || 0;
    const dimensions = calculateBoxDimensions(
      actualTextWidth,
      textBreakResult.totalHeight,
      transparencyConfig,
      verticalPadding,
      format
    );
    
    // Create background if needed
    const background = createBackgroundElement(dimensions, boxColor, transparencyConfig.isTransparent);
    
    // Position text
    const textPositioning = calculateTextPositioning(
      textAlignment,
      transparencyConfig,
      dimensions.width,
      verticalPadding
    );
    positionTextInBox(text, textPositioning);
    
    // Handle position adjustments
    const fixedBoxHeight = themeStyle?.fixedBoxHeight || 
      CLASS_THEME_BOX_HEIGHTS[format as keyof typeof CLASS_THEME_BOX_HEIGHTS] || 
      CLASS_THEME_BOX_HEIGHTS.default;
      
    handlePositionAdjustments(
      textBreakResult,
      allElements,
      { x: elementX, y: elementY },
      fixedBoxHeight,
      dimensions.height,
      globalPositionAdjustments,
      format
    );

    // Enhanced logging for debugging
    console.log('🎨 classTheme Box Details:', {
      format,
      selectedStyle: selectedStyleName,
      boxColor,
      isTransparent: transparencyConfig.isTransparent,
      actualHorizontalPadding: transparencyConfig.horizontalPadding,
      actualTextWidth,
      boxWidth: dimensions.width,
      hasBackground: !!background,
      textAlignment,
      textPosition: { left: text.left, top: text.top }
    });

    // Create and add group to canvas
    createAndAddGroup(canvas, background, text, elementX, elementY);
  }
};
