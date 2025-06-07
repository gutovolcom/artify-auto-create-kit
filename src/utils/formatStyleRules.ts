import { EventData } from "@/pages/Index";

// User color configuration for dynamic color applicationMore actions
interface UserColors {
  textColor: string;
  boxFontColor: string;
}

// Style configuration for each field
interface FieldStyle {
  fontFamily: string;
  fontSize: number;
}

// Format-specific style map (JSON-like structure)
const styleMap = {
  youtube: {
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
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 18 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 16 }
  },
  ledStudio: {
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 30 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 26 }
  },
  LP: {
    classTheme: { fontFamily: 'Margem-Bold', fontSize: 42 },
    teacherName: { fontFamily: 'Margem-Medium', fontSize: 28 }
  }
};

// Get format-specific style for a field with dynamic color handling
export const getStyleForField = (
  format: string,
  field: string,
  userColors: UserColors
): { fontSize: number; fontFamily: string; color: string } => {
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

  console.log(`Applied style for ${format}.${field}:`, {
    fontSize: fieldStyle.fontSize,
    fontFamily: fieldStyle.fontFamily,
    color
  });

  return {
    fontSize: fieldStyle.fontSize,
    fontFamily: fieldStyle.fontFamily,
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
const getDefaultStyle = (field: string, userColors: UserColors): { fontSize: number; fontFamily: string; color: string } => {
  console.warn(`Using fallback style for field: ${field}`);

  const defaultStyles = {
    title: { fontSize: 48, fontFamily: 'Margem-Black' },
    classTheme: { fontSize: 28, fontFamily: 'Margem-Bold' },
    teacherName: { fontSize: 32, fontFamily: 'Margem-Regular' },
    date: { fontSize: 24, fontFamily: 'Margem-Regular' },
    time: { fontSize: 24, fontFamily: 'Margem-Regular' }
  };

  const defaultStyle = defaultStyles[field as keyof typeof defaultStyles] || {
    fontSize: 24,
    fontFamily: 'Margem-Regular'
  };

  return {
    ...defaultStyle,
    color: getColorForField(field, userColors)
  };
};

// Helper function to extract user colors from EventData
export const getUserColors = (eventData: EventData): UserColors => {
  return {
    textColor: eventData.textColor || '#FFFFFF',
    boxFontColor: eventData.boxFontColor || '#FFFFFF'
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