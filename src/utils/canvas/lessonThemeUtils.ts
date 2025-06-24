
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
  stories: 100,
  bannerGCO: 35,
  ledStudio: 45, // Reduced from 54 to 45 for better proportion
  destaque: 28, // Reduced significantly from default for better proportion with smaller text
  LP: 66,
  default: 50
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
