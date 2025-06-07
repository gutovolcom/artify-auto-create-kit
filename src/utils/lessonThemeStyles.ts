export const lessonThemeStyles = {
  Green: { boxColor: '#CAFF39', fontColor: '#DD303E' },
  Red: { boxColor: '#DD303E', fontColor: '#CAFF39' },
  White: { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  Transparent: { boxColor: null, fontColor: null },
} as const;

export type LessonThemeStyleName = keyof typeof lessonThemeStyles;
export interface LessonThemeStyle {
  boxColor: string | null;
  fontColor: string | null;
}
