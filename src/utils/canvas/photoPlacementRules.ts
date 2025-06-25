
export type PhotoRule = {
  width: number;
  height: number;
  xOffset: number; // distância entre as fotos
};

export const teacherImageRules: Record<string, Record<number, PhotoRule>> = {
  youtube: {
    1: { width: 703, height: 1000, xOffset: 0 },
    2: { width: 492, height: 700, xOffset: 380 },
    3: { width: 387, height: 550, xOffset: 400 },
  },
  // Add identical rules for new YouTube formats
  youtube_ao_vivo: {
    1: { width: 703, height: 1000, xOffset: 0 },
    2: { width: 492, height: 700, xOffset: 380 },
    3: { width: 387, height: 550, xOffset: 400 },
  },
  youtube_pos_evento: {
    1: { width: 703, height: 1000, xOffset: 0 },
    2: { width: 492, height: 700, xOffset: 380 },
    3: { width: 387, height: 550, xOffset: 400 },
  },
  feed: {
    1: { width: 385, height: 550, xOffset: 0 },
    2: { width: 350, height: 500, xOffset: 320 },
    3: { width: 280, height: 400, xOffset: 305 }
  },
  stories: {
    1: { width: 630, height: 900, xOffset: 0 },
    2: { width: 490, height: 700, xOffset: 330 },
    3: { width: 420, height: 600, xOffset: 340 }
  },
  // bannerGCO: Teacher photos removed as requested since canvas is too small (255x192)
  // Future implementation can be added here if needed:
  // bannerGCO: {
  //   1: { width: 120, height: 150, xOffset: 0 },
  //   2: { width: 100, height: 125, xOffset: 110 },
  //   3: { width: 80, height: 100, xOffset: 90 }
  // },
  ledStudio: {
    // Reduced photo sizes to fit within 1024x256 canvas dimensions
    1: { width: 180, height: 230, xOffset: 0 }, // Reduced from 400x500
    2: { width: 160, height: 200, xOffset: 170 }, // Reduced from 350x450
    3: { width: 140, height: 180, xOffset: 150 } // Reduced from 300x400
  },
  lp: {
    1: { width: 500, height: 650, xOffset: 0 },
    2: { width: 420, height: 550, xOffset: 450 },
    3: { width: 350, height: 450, xOffset: 400 }
  }
};
