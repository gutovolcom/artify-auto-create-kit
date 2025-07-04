
import { EventData } from "@/pages/Index";
import { getTextContent } from './textUtils';
import { getUserColors, getStyleForField } from '../formatStyleRules';
import { breakTextToFitWidthSync } from './smartTextBreaker';
import { CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';

interface ElementSpacing {
  fromField: string;
  toField: string;
  designSpacing: number;
}

// Helper function to get max text width for format
const getMaxTextWidthForFormat = (format: string, canvasWidth: number, x: number, field: string): number => {
  // Simple calculation - can be refined based on format constraints
  return canvasWidth - x - 40; // 40px padding from right edge
};

// Helper function to get vertical padding
const getVerticalPadding = (format: string): number => {
  // Format-specific vertical padding
  const paddingMap: Record<string, number> = {
    'destaque': 2,
    'bannerGCO': 4,
    'ledStudio': 6,
    'LP': 8,
    'feed': 10,
    'stories': 12,
    'youtube': 15,
    'youtube_ao_vivo': 15,
    'youtube_pos_evento': 15
  };
  
  return paddingMap[format] || 10;
};

export const calculateDesignSpacing = (elements: any[]): Map<string, number> => {
  const spacingMap = new Map<string, number>();
  
  // Sort elements by Y position to understand their vertical order
  const sortedElements = [...elements]
    .filter(el => el.position?.y !== undefined)
    .sort((a, b) => a.position.y - b.position.y);
  
  console.log('📐 Calculating design spacing from layout elements:', 
    sortedElements.map(el => ({ field: el.field, y: el.position.y }))
  );
  
  // Calculate spacing between consecutive elements
  for (let i = 0; i < sortedElements.length - 1; i++) {
    const currentElement = sortedElements[i];
    const nextElement = sortedElements[i + 1];
    
    // Calculate the design spacing between these elements
    const designSpacing = nextElement.position.y - currentElement.position.y;
    
    // Store the spacing for the element that should maintain this distance
    spacingMap.set(nextElement.field, designSpacing);
    
    console.log(`📐 Design spacing: ${currentElement.field} -> ${nextElement.field} = ${designSpacing}px`);
  }
  
  return spacingMap;
};

export const calculateSmartPositionAdjustments = async (
  elements: any[],
  eventData: EventData,
  canvasWidth: number,
  format: string
): Promise<Map<string, number>> => {
  const adjustments = new Map<string, number>();
  
  // For small formats (LP, Destaque, LEDStudio), be more conservative with adjustments
  const isSmallFormat = format === 'LP' || format === 'destaque' || format === 'ledStudio' || format === 'bannerGCO';
  
  if (isSmallFormat) {
    console.log(`📐 Using conservative adjustments for small format: ${format}`);
  }
  
  // Get the design spacing from layout
  const designSpacing = calculateDesignSpacing(elements);
  
  // Find classTheme element
  const classThemeElement = elements.find(el => el.field === 'classTheme');
  if (!classThemeElement) return adjustments;

  // Calculate if classTheme will break into multiple lines
  const classThemeText = getTextContent('classTheme', eventData);
  if (!classThemeText) return adjustments;

  const userColors = getUserColors(eventData);
  const formatStyle = getStyleForField(format, 'classTheme', userColors);
  
  const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, classThemeElement.position?.x || 0, 'classTheme');
  const textBreakResult = breakTextToFitWidthSync(
    classThemeText,
    maxTextWidth,
    formatStyle.fontSize,
    formatStyle.fontFamily
  );

  // Only proceed if text breaks into multiple lines
  if (textBreakResult.lines.length <= 1) {
    console.log('📐 ClassTheme fits in one line, maintaining original design spacing');
    return adjustments;
  }

  // Calculate the height difference
  const fixedBoxHeight = CLASS_THEME_BOX_HEIGHTS[format as keyof typeof CLASS_THEME_BOX_HEIGHTS] || CLASS_THEME_BOX_HEIGHTS.default;
  const verticalPadding = getVerticalPadding(format);
  const actualBoxHeight = textBreakResult.totalHeight + (verticalPadding * 2);
  const heightIncrease = actualBoxHeight - fixedBoxHeight;

  if (heightIncrease <= 0) return adjustments;

  // For small formats, reduce the adjustment to prevent elements from going off-canvas
  const adjustmentMultiplier = isSmallFormat ? 0.7 : 1.0;
  const finalHeightIncrease = heightIncrease * adjustmentMultiplier;

  console.log('📐 ClassTheme expanded, calculating smart adjustments using design spacing:', {
    format,
    isSmallFormat,
    originalHeightIncrease: heightIncrease,
    finalHeightIncrease,
    adjustmentMultiplier,
    originalSpacing: Array.from(designSpacing.entries())
  });

  // Sort elements by Y position to process them in order
  const sortedElements = [...elements]
    .filter(el => el.position?.y !== undefined)
    .sort((a, b) => a.position.y - b.position.y);

  // Find elements that come after classTheme
  const classThemeIndex = sortedElements.findIndex(el => el.field === 'classTheme');
  if (classThemeIndex === -1) return adjustments;

  // Calculate cumulative adjustments for elements after classTheme
  let cumulativeAdjustment = 0;
  
  for (let i = classThemeIndex + 1; i < sortedElements.length; i++) {
    const element = sortedElements[i];
    
    // For the first element after classTheme, use the height increase
    if (i === classThemeIndex + 1) {
      cumulativeAdjustment = finalHeightIncrease;
    }
    
    // Get the design spacing for this element
    const originalSpacing = designSpacing.get(element.field);
    
    if (originalSpacing !== undefined) {
      // Use the calculated adjustment while preserving design spacing intent
      const adjustment = cumulativeAdjustment;
      adjustments.set(element.field, adjustment);
      
      console.log(`📐 Smart adjustment for ${element.field}: +${adjustment}px (preserving ${originalSpacing}px design spacing, format: ${format})`);
    } else {
      // Fallback to height increase if no design spacing found
      const adjustment = cumulativeAdjustment;
      adjustments.set(element.field, adjustment);
      
      console.log(`📐 Fallback adjustment for ${element.field}: +${adjustment}px (no design spacing found, format: ${format})`);
    }
  }

  return adjustments;
};
