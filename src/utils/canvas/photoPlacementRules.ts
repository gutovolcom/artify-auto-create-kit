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
  feed: {
    1: { width: 385, height: 550 },
    2: { width: 350, height: 500, xOffset: 320 },
    3: { width: 280, height: 400, xOffset: 305 }
  },
  stories: {
    1: { width: 630, height: 900 },
    2: { width: 490, height: 700, xOffset: 330 },
    3: { width: 420, height: 600, xOffset: 340 }
  }
};
