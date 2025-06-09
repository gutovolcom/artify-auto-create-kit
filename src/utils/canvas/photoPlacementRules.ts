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
  // Adicione outros formatos aqui
};
