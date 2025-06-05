
export const getDefaultPositions = (format: string, width: number, height: number) => {
  switch (format) {
    case 'youtube':
      return {
        title: { x: 100, y: 100, fontSize: 48 },
        date: { x: 100, y: 200, fontSize: 24 },
        time: { x: 100, y: 250, fontSize: 24 },
        teacherName: { x: 100, y: 300, fontSize: 32 },
        classTheme: { x: 100, y: 400, fontSize: 28 }
      };
    case 'feed':
      return {
        title: { x: 50, y: 50, fontSize: 36 },
        date: { x: 50, y: 150, fontSize: 20 },
        time: { x: 50, y: 180, fontSize: 20 },
        teacherName: { x: 50, y: 220, fontSize: 24 },
        classTheme: { x: 50, y: 300, fontSize: 22 }
      };
    default:
      return {
        title: { x: 50, y: 50, fontSize: 24 },
        date: { x: 50, y: 100, fontSize: 16 },
        time: { x: 50, y: 130, fontSize: 16 },
        teacherName: { x: 50, y: 160, fontSize: 20 },
        classTheme: { x: 50, y: 200, fontSize: 18 }
      };
  }
};
