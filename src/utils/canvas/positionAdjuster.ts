import { CLASS_THEME_BOX_HEIGHTS } from './lessonThemeUtils';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface PositionAdjustment {
  originalY: number;
  adjustedY: number;
  adjustment: number;
}

// Calculate actual spacing between elements (bottom to top)
const getDesignSpacing = (
  elements: Array<{ field: string; position: ElementPosition }>, 
  fromField: string, 
  toField: string,
  format: string
): number => {
  const fromElement = elements.find(el => el.field === fromField);
  const toElement = elements.find(el => el.field === toField);
  
  if (!fromElement || !toElement) {
    return 20; // Fallback
  }

  // Get the height of the fromElement (classTheme box)
  const fromElementHeight = fromField === 'classTheme' 
    ? CLASS_THEME_BOX_HEIGHTS[format as keyof typeof CLASS_THEME_BOX_HEIGHTS] || CLASS_THEME_BOX_HEIGHTS.default
    : 0;
  
  // Calculate actual spacing: from bottom of fromElement to top of toElement
  const fromElementBottom = fromElement.position.y + fromElementHeight;
  const actualSpacing = toElement.position.y - fromElementBottom;
  
  return Math.max(actualSpacing, 10); // Ensure minimum 10px spacing
};

export const calculatePositionAdjustments = (
  lessonThemePosition: ElementPosition,
  lessonThemeOriginalHeight: number,
  lessonThemeNewHeight: number,
  allElements: Array<{ field: string; position: ElementPosition }>,
  format: string = 'default'
): Array<{ field: string; adjustment: PositionAdjustment }> => {
  const heightDifference = lessonThemeNewHeight - lessonThemeOriginalHeight;
  
  if (heightDifference <= 0) {
    return [];
  }

  const adjustments: Array<{ field: string; adjustment: PositionAdjustment }> = [];
  const lessonThemeBottom = lessonThemePosition.y + lessonThemeOriginalHeight;
  const newLessonThemeBottom = lessonThemePosition.y + lessonThemeNewHeight;

  for (const element of allElements) {
    if (element.field === 'classTheme') continue;
    
    if (element.position.y > lessonThemeBottom) {
      const designSpacing = getDesignSpacing(allElements, 'classTheme', element.field, format);
      const newY = newLessonThemeBottom + designSpacing;
      const adjustment = newY - element.position.y;
      
      if (adjustment > 0) {
        adjustments.push({
          field: element.field,
          adjustment: {
            originalY: element.position.y,
            adjustedY: newY,
            adjustment: adjustment
          }
        });
      }
    }
  }

  return adjustments;
};
