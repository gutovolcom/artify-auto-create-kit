
import { measureTextWidthSync } from './textMeasurement';

export interface TextBreakResult {
  lines: string[];
  needsLineBreak: boolean;
  totalHeight: number;
  maxLineWidth: number;
}

// Improved text breaking with better word handling and character-specific logic
export const breakTextToFitWidth = (
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string
): TextBreakResult => {
  if (!text || maxWidth <= 0) {
    return {
      lines: [text || ''],
      needsLineBreak: false,
      totalHeight: fontSize * 1.2,
      maxLineWidth: 0
    };
  }

  // First check if the entire text fits
  const fullTextWidth = measureTextWidthSync(text, fontSize, fontFamily);
  
  if (fullTextWidth <= maxWidth) {
    return {
      lines: [text],
      needsLineBreak: false,
      totalHeight: fontSize * 1.2,
      maxLineWidth: fullTextWidth
    };
  }

  console.log('🔤 Text breaking needed:', {
    text,
    textWidth: fullTextWidth,
    maxWidth,
    fontSize,
    fontFamily
  });

  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';
  let maxLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureTextWidthSync(testLine, fontSize, fontFamily);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
      maxLineWidth = Math.max(maxLineWidth, testWidth);
    } else {
      // If we have a current line, add it to lines
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
        
        // Check if the single word fits
        const singleWordWidth = measureTextWidthSync(word, fontSize, fontFamily);
        if (singleWordWidth > maxWidth) {
          // Break the word character by character
          console.log('⚠️ Word too long, breaking by character:', word);
          const brokenWord = breakWordByCharacter(word, maxWidth, fontSize, fontFamily);
          lines.push(...brokenWord.lines);
          currentLine = '';
          maxLineWidth = Math.max(maxLineWidth, brokenWord.maxLineWidth);
        } else {
          maxLineWidth = Math.max(maxLineWidth, singleWordWidth);
        }
      } else {
        // The single word is too long, break it
        const brokenWord = breakWordByCharacter(word, maxWidth, fontSize, fontFamily);
        lines.push(...brokenWord.lines);
        maxLineWidth = Math.max(maxLineWidth, brokenWord.maxLineWidth);
      }
    }
  }

  // Add the last line if it exists
  if (currentLine) {
    lines.push(currentLine);
    const lastLineWidth = measureTextWidthSync(currentLine, fontSize, fontFamily);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
  }

  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

  console.log('✂️ Text broken into lines:', {
    originalText: text,
    lines: lines,
    totalHeight,
    maxLineWidth,
    lineCount: lines.length
  });

  return {
    lines,
    needsLineBreak: true,
    totalHeight,
    maxLineWidth
  };
};

// Helper function to break a word by character when it's too long
const breakWordByCharacter = (
  word: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string
): { lines: string[]; maxLineWidth: number } => {
  const lines: string[] = [];
  let currentLine = '';
  let maxLineWidth = 0;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const testLine = currentLine + char;
    const testWidth = measureTextWidthSync(testLine, fontSize, fontFamily);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        const lineWidth = measureTextWidthSync(currentLine, fontSize, fontFamily);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        currentLine = char;
      } else {
        // Even a single character doesn't fit, force it
        lines.push(char);
        const charWidth = measureTextWidthSync(char, fontSize, fontFamily);
        maxLineWidth = Math.max(maxLineWidth, charWidth);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
    const lineWidth = measureTextWidthSync(currentLine, fontSize, fontFamily);
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }

  return { lines, maxLineWidth };
};

// Utility to estimate optimal break points for different content types
export const getOptimalBreakStrategy = (text: string, field: string): 'word' | 'character' | 'none' => {
  // For teacher names, prefer word breaks
  if (field === 'teacherName') {
    return 'word';
  }
  
  // For dates and times, don't break at all
  if (field === 'date'|| field === 'time') {
    return 'none';
  }
  
  // For titles and themes, use word breaks unless very long words exist
  const hasLongWords = text.split(' ').some(word => word.length > 15);
  return hasLongWords ? 'character' : 'word';
};
