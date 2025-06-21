
import { FabricText } from 'fabric';

export interface TextBreakResult {
  lines: string[];
  totalHeight: number;
  needsLineBreak: boolean;
}

export const breakTextToFitWidth = (
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string
): TextBreakResult => {
  // Create a temporary text object to measure width
  const tempText = new FabricText('', {
    fontSize,
    fontFamily
  });

  // Check if the full text fits in one line
  tempText.set({ text });
  if (tempText.width! <= maxWidth) {
    return {
      lines: [text],
      totalHeight: tempText.height!,
      needsLineBreak: false
    };
  }

  // Break text into lines
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    tempText.set({ text: testLine });

    if (tempText.width! <= maxWidth) {
      currentLine = testLine;
    } else {
      // If current line is not empty, push it and start new line
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word is too long, truncate it
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

  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate total height
  const lineHeight = tempText.height!;
  const totalHeight = lineHeight * lines.length;

  return {
    lines,
    totalHeight,
    needsLineBreak: lines.length > 1
  };
};
