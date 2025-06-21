
export interface ElementPosition {
  x: number;
  y: number;
}

export interface PositionAdjustment {
  originalY: number;
  adjustedY: number;
  adjustment: number;
}

export const calculatePositionAdjustments = (
  lessonThemePosition: ElementPosition,
  lessonThemeOriginalHeight: number,
  lessonThemeNewHeight: number,
  allElements: Array<{ field: string; position: ElementPosition }>
): Array<{ field: string; adjustment: PositionAdjustment }> => {
  const heightDifference = lessonThemeNewHeight - lessonThemeOriginalHeight;
  
  // If no height change, no adjustments needed
  if (heightDifference <= 0) {
    return [];
  }

  const adjustments: Array<{ field: string; adjustment: PositionAdjustment }> = [];
  const lessonThemeBottom = lessonThemePosition.y + lessonThemeNewHeight;

  // Find elements that are below the lesson theme and might need adjustment
  for (const element of allElements) {
    if (element.field === 'classTheme') continue; // Skip the lesson theme itself
    
    // Check if element is below the lesson theme
    if (element.position.y > lessonThemePosition.y) {
      const buffer = 20; // Add some buffer space
      const newY = Math.max(element.position.y, lessonThemeBottom + buffer);
      
      if (newY !== element.position.y) {
        adjustments.push({
          field: element.field,
          adjustment: {
            originalY: element.position.y,
            adjustedY: newY,
            adjustment: newY - element.position.y
          }
        });
      }
    }
  }

  return adjustments;
};
