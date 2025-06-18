
import { FabricText } from 'fabric';

export const calculateOptimalTextSize = (
  text: string,
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  fontFamily: string
): { fontSize: number; text: string } => {
  let fontSize = initialFontSize;
  let wrappedText = text;

  const tempText = new FabricText(text, {
    fontSize,
    fontFamily
  });

  if (tempText.width! <= maxWidth && tempText.height! <= maxHeight) {
    return { fontSize, text };
  }

  while (fontSize > 12 && (tempText.width! > maxWidth || tempText.height! > maxHeight)) {
    fontSize -= 2;
    tempText.set({ fontSize });
  }

  if (tempText.width! > maxWidth) {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      tempText.set({ text: testLine });

      if (tempText.width! <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          let truncated = word;
          while (truncated.length > 3) {
            truncated = truncated.slice(0, -1);
            tempText.set({ text: truncated + '...' });
            if (tempText.width! <= maxWidth) {
              break;
            }
          }
          lines.push(truncated + '...');
          currentLine = '';
        }
      }
    }

    if (currentLine) lines.push(currentLine);

    wrappedText = lines.join('\n');
    tempText.set({ text: wrappedText });

    if (tempText.height! > maxHeight && lines.length > 1) {
      while (lines.length > 1 && tempText.height! > maxHeight) {
        lines.pop();
        wrappedText = lines.join('\n') + '...';
        tempText.set({ text: wrappedText });
      }
    }
  }

  return { fontSize, text: wrappedText };
};

export const constrainTextToCanvas = (
  text: string,
  x: number,
  y: number,
  initialFontSize: number,
  fontFamily: string,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 20
): { fontSize: number; text: string } => {
  const maxWidth = canvasWidth - x - padding;
  const maxHeight = canvasHeight - y - padding;
  
  if (maxWidth <= 0 || maxHeight <= 0) {
    console.warn('Text position is outside canvas bounds, using fallback');
    return { fontSize: Math.max(12, initialFontSize * 0.5), text };
  }
  
  return calculateOptimalTextSize(text, maxWidth, maxHeight, initialFontSize, fontFamily);
};
