import { EventData } from "@/pages/Index";

// User color configuration for dynamic color application
interface UserColors {
  textColor: string;
  boxFontColor: string;
}

// Style configuration for each field
interface FieldStyle {
  fontFamily: string;
  fontSize: number;
}

// Format-specific style map with complete font definitions
const styleMap = {
  youtube: {
    title: { fontFamily: 'Margem-Black', fontSize: 140 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 68 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 66 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 66 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 66 }
  },
  youtube_ao_vivo: {
    title: { fontFamily: 'Margem-Black', fontSize: 140 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 68 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 66 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 66 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 66 }
  },
  youtube_pos_evento: {
    title: { fontFamily: 'Margem-Black', fontSize: 140 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 68 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 66 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 66 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 66 }
  },
  feed: {
    title: { fontFamily: 'Margem-Black', fontSize: 118 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 52 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 46 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 46 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 46 }
  },
  stories: {
    title: { fontFamily: 'Margem-Black', fontSize: 132 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 62 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 62 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 62 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 62 }
  },
  bannerGCO: {
    title: { fontFamily: 'Margem-Black', fontSize: 72 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 54 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 42 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 42 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 48 }
  },
  destaque: {
    title: { fontFamily: 'Margem-Black', fontSize: 24 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 14 }, // Reduced from 18 to 14 for better proportion
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 14 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 14 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 16 }
  },
  ledStudio: {
    title: { fontFamily: 'Margem-Black', fontSize: 36 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 32 }, // Reduced from 36 to 32 for better proportion with smaller box
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 24 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 24 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 26 }
  },
  LP: {
    title: { fontFamily: 'Margem-Black', fontSize: 58 },
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 48 },
    date: { fontFamily: 'Toroka Wide Regular', fontSize: 32 },
    time: { fontFamily: 'Toroka Wide Regular', fontSize: 32 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 28 }
  }
};

// Map font families to proper CSS font weights
const getFontWeight = (fontFamily: string): string => {
  switch (fontFamily) {
    case 'Margem-Black':
      return '900';
    case 'Margem-Bold':
      return 'bold';
    case 'Margem-Medium':
      return '500';
    case 'Toroka Wide Regular':
    case 'Margem-Regular':
    default:
      return 'normal';
  }
};

// Get format-specific style for a field with dynamic color handling
export const getStyleForField = (
  format: string,
  field: string,
  userColors: UserColors
): { fontSize: number; fontFamily: string; color: string; fontWeight: string } => {
  console.log(`Getting style for format: ${format}, field: ${field}`);
  
  // Get format styles or fallback to default
  const formatStyles = styleMap[format as keyof typeof styleMap];
  if (!formatStyles) {
    console.warn(`Format '${format}' not found in styleMap, using fallback`);
    return getDefaultStyle(field, userColors);
  }
  
  // Get field style or fallback to default
  const fieldStyle = formatStyles[field as keyof typeof formatStyles];
  if (!fieldStyle) {
    console.warn(`Field '${field}' not found for format '${format}', using fallback`);
    return getDefaultStyle(field, userColors);
  }
  
  // Apply dynamic color based on field type
  const color = getColorForField(field, userColors);
  const fontWeight = getFontWeight(fieldStyle.fontFamily);
  
  console.log(`Applied style for ${format}.${field}:`, {
    fontSize: fieldStyle.fontSize,
    fontFamily: fieldStyle.fontFamily,
    fontWeight,
    color
  });
  
  return {
    fontSize: fieldStyle.fontSize,
    fontFamily: fieldStyle.fontFamily,
    fontWeight,
    color
  };
};

// Dynamic color handling based on field type
const getColorForField = (field: string, userColors: UserColors): string => {
  switch (field) {
    case 'classTheme':
      return userColors.boxFontColor;
    case 'title':
    case 'date':
    case 'time':
    case 'teacherName':
    default:
      return userColors.textColor;
  }
};

// Fallback styling when format or field is not found
const getDefaultStyle = (field: string, userColors: UserColors): { fontSize: number; fontFamily: string; color: string; fontWeight: string } => {
  console.warn(`Using fallback style for field: ${field}`);
  
  const defaultStyles = {
    title: { fontSize: 48, fontFamily: 'Margem-Black' },
    classTheme: { fontSize: 28, fontFamily: 'Margem-Bold' },
    teacherName: { fontSize: 32, fontFamily: 'Margem-Medium' },
    date: { fontSize: 24, fontFamily: 'Toroka Wide Regular' },
    time: { fontSize: 24, fontFamily: 'Toroka Wide Regular' }
  };
  
  const defaultStyle = defaultStyles[field as keyof typeof defaultStyles] || {
    fontSize: 24,
    fontFamily: 'Margem-Regular'
  };
  
  return {
    ...defaultStyle,
    fontWeight: getFontWeight(defaultStyle.fontFamily),
    color: getColorForField(field, userColors)
  };
};

// Helper function to extract user colors from EventData
export const getUserColors = (eventData: any) => {
  // Get main colors
  const boxColor = eventData.boxColor || '#dd303e';
  const boxFontColor = eventData.boxFontColor || '#FFFFFF';
  const textColor = eventData.textColor || '#FFFFFF';
  
  // Define teacher-specific colors based on main theme
  const teacherBoxColor = eventData.teacherBoxColor || boxColor;
  const teacherFontColor = eventData.teacherFontColor || boxFontColor;
  
  return {
    boxColor,
    boxFontColor,
    textColor,
    teacherBoxColor,
    teacherFontColor
  };
};

// Legacy compatibility function (deprecated - DO NOT USE)
export const getFormatSpecificStyle = (
  format: string,
  field: string,
  eventData: EventData
): { fontSize: number; fontFamily: string; color: string } => {
  console.warn('getFormatSpecificStyle is deprecated, use getStyleForField instead');
  const userColors = getUserColors(eventData);
  return getStyleForField(format, field, userColors);
};
