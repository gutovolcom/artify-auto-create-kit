
import { CanvasElementConfig } from './types';
import { getStyleForField, getUserColors } from '@/utils/formatStyleRules';
import { getLessonThemeStyle, CLASS_THEME_BOX_HEIGHTS } from '@/utils/canvas/lessonThemeUtils';
import { breakTextToFitWidth } from '@/utils/canvas/smartTextBreaker';

export interface FormatAwareStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: string;
  fontStyle?: string;
}

export interface ClassThemeBoxConfig {
  hasBox: boolean;
  boxColor?: string;
  boxWidth: number;
  boxHeight: number;
  textAlignment: 'left' | 'center';
  padding: number;
}

// Sample event data for layout editor preview
const getSampleEventData = () => ({
  textColor: '#FFFFFF',
  boxColor: '#dd303e',
  boxFontColor: '#FFFFFF',
  lessonThemeBoxStyle: 'Red'
});

// Get format-specific text alignment
const getTextAlignmentForFormat = (format: string): 'left' | 'center' => {
  const leftAlignedFormats = ['youtube', 'feed', 'stories', 'ledStudio'];
  const centerAlignedFormats = ['bannerGCO', 'LP'];
  
  if (leftAlignedFormats.includes(format)) {
    return 'left';
  } else if (centerAlignedFormats.includes(format)) {
    return 'center';
  }
  
  return 'center';
};

// Get format-specific max width for text breaking preview
const getMaxTextWidthForFormat = (format: string, canvasWidth: number, elementX: number): number => {
  const formatLimits = {
    'youtube': Math.min(canvasWidth - elementX - 60, 320),
    'feed': Math.min(canvasWidth - elementX - 60, 300),
    'stories': Math.min(canvasWidth - elementX - 60, 280),
    'ledStudio': Math.min(canvasWidth - elementX - 60, 350),
    'bannerGCO': Math.min(canvasWidth - elementX - 40, 400),
    'LP': Math.min(canvasWidth - elementX - 40, 400)
  };
  
  return formatLimits[format as keyof typeof formatLimits] || Math.min(canvasWidth - elementX - 40, 400);
};

export const getFormatAwareStyle = (
  config: CanvasElementConfig,
  format: string
): FormatAwareStyle => {
  const sampleEventData = getSampleEventData();
  const userColors = getUserColors(sampleEventData);
  const style = getStyleForField(format, config.field, userColors);
  
  // Add font weight and style based on field type
  let fontWeight = 'normal';
  let fontStyle = 'normal';
  
  if (config.field.toLowerCase().includes('title') || config.field.toLowerCase().includes('headline')) {
    fontWeight = 'bold';
  } else if (config.field.toLowerCase().includes('caption') || config.field.toLowerCase().includes('subtitle')) {
    fontStyle = 'italic';
  }
  
  // Special handling for lesson theme field
  if (config.field === 'classTheme') {
    fontWeight = 'bold';
  }
  
  return {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
    fontWeight,
    fontStyle
  };
};

export const getClassThemeBoxConfig = (
  config: CanvasElementConfig,
  format: string,
  canvasWidth: number,
  elementX: number
): ClassThemeBoxConfig => {
  if (config.field !== 'classTheme') {
    return {
      hasBox: false,
      boxWidth: 0,
      boxHeight: 0,
      textAlignment: 'left',
      padding: 0
    };
  }
  
  const sampleEventData = getSampleEventData();
  const themeStyle = getLessonThemeStyle(sampleEventData.lessonThemeBoxStyle, sampleEventData, format);
  const textAlignment = getTextAlignmentForFormat(format);
  const padding = 20;
  
  if (!themeStyle) {
    return {
      hasBox: false,
      boxWidth: 200,
      boxHeight: 50,
      textAlignment,
      padding
    };
  }
  
  // Calculate box dimensions with text breaking preview
  const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX);
  const sampleText = "Sample Lesson Theme Text";
  const formatAwareStyle = getFormatAwareStyle(config, format);
  
  const textBreakResult = breakTextToFitWidth(
    sampleText,
    maxTextWidth,
    formatAwareStyle.fontSize,
    formatAwareStyle.fontFamily
  );
  
  const boxHeight = textBreakResult.needsLineBreak ? 
    textBreakResult.totalHeight + (padding * 2) : 
    themeStyle.fixedBoxHeight;
  
  const boxWidth = Math.max(maxTextWidth + (padding * 2), 200);
  
  return {
    hasBox: true,
    boxColor: themeStyle.boxColor,
    boxWidth,
    boxHeight,
    textAlignment,
    padding
  };
};

export const getSampleTextForField = (field: string): string => {
  const sampleTexts = {
    title: 'Sample Event Title',
    classTheme: 'Sample Lesson Theme',
    teacherName: 'Professor Name',
    date: '23/06/2025',
    time: '14:00',
    subtitle: 'Sample Subtitle',
    description: 'Sample Description'
  };
  
  return sampleTexts[field as keyof typeof sampleTexts] || `[${field.toUpperCase()}]`;
};
