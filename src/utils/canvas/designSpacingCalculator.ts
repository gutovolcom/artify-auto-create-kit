interface ElementSpacing {
  fromField: string;
  toField: string;
  designSpacing: number;
}

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

  console.log('📐 ClassTheme expanded, calculating smart adjustments using design spacing:', {
    format,
    heightIncrease,
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
    const previousElement = sortedElements[i - 1];
    
    // For the first element after classTheme, use the height increase
    if (i === classThemeIndex + 1) {
      cumulativeAdjustment = heightIncrease;
    }
    
    // Get the design spacing for this element
    const originalSpacing = designSpacing.get(element.field);
    
    if (originalSpacing !== undefined) {
      // Use the original design spacing from layout editor
      const adjustment = cumulativeAdjustment;
      adjustments.set(element.field, adjustment);
      
      console.log(`📐 Smart adjustment for ${element.field}: +${adjustment}px (preserving ${originalSpacing}px design spacing)`);
    } else {
      // Fallback to height increase if no design spacing found
      const adjustment = cumulativeAdjustment;
      adjustments.set(element.field, adjustment);
      
      console.log(`📐 Fallback adjustment for ${element.field}: +${adjustment}px (no design spacing found)`);
    }
  }

  return adjustments;
}; 