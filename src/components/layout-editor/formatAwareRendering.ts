
import { CanvasElementConfig } from './types';
import { getStyleForField, getUserColors } from '@/utils/formatStyleRules';
import { getLessonThemeStyle, CLASS_THEME_BOX_HEIGHTS } from '@/utils/canvas/lessonThemeUtils';

export interface FormatAwareStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
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
  const leftAlignedFormats = ['youtube', 'youtube_ao_vivo', 'youtube_pos_evento', 'feed', 'stories', 'ledStudio', 'LP']; // Added LP
  const centerAlignedFormats = ['bannerGCO', 'destaque'];
  
  if (leftAlignedFormats.includes(format)) {
    return 'left';
  } else if (centerAlignedFormats.includes(format)) {
    return 'center';
  }
  
  return 'center';
};

export const getFormatAwareStyle = (
  config: CanvasElementConfig,
  format: string
): FormatAwareStyle => {
  const sampleEventData = getSampleEventData();
  const userColors = getUserColors(sampleEventData);
  const style = getStyleForField(format, config.field, userColors);
  
  // Add font style based on field type (but not weight, as it's handled by font family)
  let fontStyle = 'normal';
  
  if (config.field.toLowerCase().includes('caption') || config.field.toLowerCase().includes('subtitle')) {
    fontStyle = 'italic';
  }
  
  return {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
    fontWeight: style.fontWeight,
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
  
  // Use fixed box height from CLASS_THEME_BOX_HEIGHTS (no dynamic calculation)
  const boxHeight = themeStyle.fixedBoxHeight;
  
  // Calculate appropriate box width based on format - improved proportional sizing
  const formatBoxWidths = {
    'youtube': 320,
    'youtube_ao_vivo': 320,
    'youtube_pos_evento': 320,
    'feed': 300,
    'stories': 280,
    'ledStudio': 286, // Reduced from 350 to 300 for better proportion
    'bannerGCO': 200,
    'destaque': 100, // Reduced from 200 to 150 for better proportion with smaller text
    'LP': 300
  };
  
  const boxWidth = formatBoxWidths[format as keyof typeof formatBoxWidths] || 250;
  
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
    classTheme: 'Sample Theme', // Shorter text to prevent cutoff
    teacherName: 'Professor Name',
    date: '23/06/2025',
    time: '14:00',
    subtitle: 'Sample Subtitle',
    description: 'Sample Description'
  };
  
  return sampleTexts[field as keyof typeof sampleTexts] || `[${field.toUpperCase()}]`;
};
