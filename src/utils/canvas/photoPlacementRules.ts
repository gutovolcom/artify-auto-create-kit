
// Photo placement rules for different formats and number of images
export const teacherImageRules: Record<string, Record<number, { width: number; height: number; xOffset: number }>> = {
  youtube: {
    1: { width: 180, height: 230, xOffset: 0 },
    2: { width: 160, height: 200, xOffset: 170 },
    3: { width: 140, height: 180, xOffset: 150 }
  },
  youtube_ao_vivo: {
    1: { width: 180, height: 230, xOffset: 0 },
    2: { width: 160, height: 200, xOffset: 170 },
    3: { width: 140, height: 180, xOffset: 150 }
  },
  youtube_pos_evento: {
    1: { width: 180, height: 230, xOffset: 0 },
    2: { width: 160, height: 200, xOffset: 170 },
    3: { width: 140, height: 180, xOffset: 150 }
  },
  feed: {
    1: { width: 150, height: 190, xOffset: 0 },
    2: { width: 130, height: 170, xOffset: 140 },
    3: { width: 110, height: 150, xOffset: 120 }
  },
  stories: {
    1: { width: 160, height: 210, xOffset: 0 },
    2: { width: 140, height: 180, xOffset: 150 },
    3: { width: 120, height: 160, xOffset: 130 }
  },
  ledStudio: {
    1: { width: 180, height: 230, xOffset: 0 },
    2: { width: 160, height: 200, xOffset: 170 },
    3: { width: 140, height: 180, xOffset: 150 }
  },
  destaque: {
    1: { width: 120, height: 150, xOffset: 0 },
    2: { width: 100, height: 130, xOffset: 110 },
    3: { width: 80, height: 110, xOffset: 90 }
  },
  LP: {
    1: { width: 140, height: 180, xOffset: 0 },
    2: { width: 120, height: 160, xOffset: 130 },
    3: { width: 100, height: 140, xOffset: 110 }
  }
  // Note: bannerGCO intentionally excluded as it should not have teacher photos
};

console.log('📸 Teacher image placement rules loaded for all formats including new YouTube variants');
