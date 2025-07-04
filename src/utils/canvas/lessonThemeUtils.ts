
export const lessonThemeStyleColors = {
  'Green': { boxColor: '#CAFF39', fontColor: '#DD303E' },
  'Red':   { boxColor: '#DD303E', fontColor: '#CAFF39' },
  'White': { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  'Transparent': { boxColor: null, fontColor: null } // Special handling: fontColor will be eventData.textColor
};

export const CLASS_THEME_BOX_HEIGHTS = {
  youtube: 100,
  youtube_ao_vivo: 100,
  youtube_pos_evento: 100,
  feed: 64,
  stories: 132,
  bannerGCO: 35, // Reduced from 40.4 to 35 for better proportion
  destaque: 20, // Added proper height for destaque format (proportional to 14px font)
  ledStudio: 40, // Reduced from 54 to 40 for better proportion
  LP: 66,
  default: 50 // Default height if format not specified
};

export const getLessonThemeStyle = (
  selectedStyleName: string,
  eventData: any,
  format: string
) => {
  const styleConfig = lessonThemeStyleColors[selectedStyleName as keyof typeof lessonThemeStyleColors];
  
  if (!styleConfig) {
    return null;
  }

  const fixedBoxHeight = CLASS_THEME_BOX_HEIGHTS[format as keyof typeof CLASS_THEME_BOX_HEIGHTS] || CLASS_THEME_BOX_HEIGHTS.default;
  
  return {
    boxColor: styleConfig.boxColor || eventData.boxColor || '#dd303e',
    fontColor: styleConfig.fontColor === null ? eventData.textColor || '#FFFFFF' : styleConfig.fontColor,
    fixedBoxHeight
  };
};
