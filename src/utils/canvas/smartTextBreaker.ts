
import { measureTextWidth, measureTextWidthSync } from './textMeasurement';
import { ensureFontLoaded } from './fontLoader';

export interface TextBreakResult {
  lines: string[];
  needsLineBreak: boolean;
  totalHeight: number;
  maxLineWidth: number;
}

// Enhanced text breaking with proper font loading
export const breakTextToFitWidth = async (
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): Promise<TextBreakResult> => {
  if (!text || maxWidth <= 0) {
    return {
      lines: [text || ''],
      needsLineBreak: false,
      totalHeight: fontSize * 1.2,
      maxLineWidth: 0
    };
  }

  // Ensure font is loaded before processing
  await ensureFontLoaded({
    family: fontFamily,
    size: fontSize,
    weight: fontWeight
  });

  // Check if the entire text fits
  const fullTextWidth = await measureTextWidth(text, fontSize, fontFamily, fontWeight);
  
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
    const testWidth = await measureTextWidth(testLine, fontSize, fontFamily, fontWeight);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
      maxLineWidth = Math.max(maxLineWidth, testWidth);
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
        
        const singleWordWidth = await measureTextWidth(word, fontSize, fontFamily, fontWeight);
        if (singleWordWidth > maxWidth) {
          console.log('⚠️ Word too long, breaking by character:', word);
          const brokenWord = await breakWordByCharacter(word, maxWidth, fontSize, fontFamily, fontWeight);
          lines.push(...brokenWord.lines);
          currentLine = '';
          maxLineWidth = Math.max(maxLineWidth, brokenWord.maxLineWidth);
        } else {
          maxLineWidth = Math.max(maxLineWidth, singleWordWidth);
        }
      } else {
        const brokenWord = await breakWordByCharacter(word, maxWidth, fontSize, fontFamily, fontWeight);
        lines.push(...brokenWord.lines);
        maxLineWidth = Math.max(maxLineWidth, brokenWord.maxLineWidth);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
    const lastLineWidth = await measureTextWidth(currentLine, fontSize, fontFamily, fontWeight);
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

// Synchronous version for backward compatibility
export const breakTextToFitWidthSync = (
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): TextBreakResult => {
  if (!text || maxWidth <= 0) {
    return {
      lines: [text || ''],
      needsLineBreak: false,
      totalHeight: fontSize * 1.2,
      maxLineWidth: 0
    };
  }

  // Check if the entire text fits
  const fullTextWidth = measureTextWidthSync(text, fontSize, fontFamily, fontWeight);
  
  if (fullTextWidth <= maxWidth) {
    return {
      lines: [text],
      needsLineBreak: false,
      totalHeight: fontSize * 1.2,
      maxLineWidth: fullTextWidth
    };
  }

  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';
  let maxLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureTextWidthSync(testLine, fontSize, fontFamily, fontWeight);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
      maxLineWidth = Math.max(maxLineWidth, testWidth);
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
        
        const singleWordWidth = measureTextWidthSync(word, fontSize, fontFamily, fontWeight);
        if (singleWordWidth > maxWidth) {
          const brokenWord = breakWordByCharacterSync(word, maxWidth, fontSize, fontFamily, fontWeight);
          lines.push(...brokenWord.lines);
          currentLine = '';
          maxLineWidth = Math.max(maxLineWidth, brokenWord.maxLineWidth);
        } else {
          maxLineWidth = Math.max(maxLineWidth, singleWordWidth);
        }
      } else {
        const brokenWord = breakWordByCharacterSync(word, maxWidth, fontSize, fontFamily, fontWeight);
        lines.push(...brokenWord.lines);
        maxLineWidth = Math.max(maxLineWidth, brokenWord.maxLineWidth);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
    const lastLineWidth = measureTextWidthSync(currentLine, fontSize, fontFamily, fontWeight);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
  }

  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

  return {
    lines,
    needsLineBreak: true,
    totalHeight,
    maxLineWidth
  };
};

// Helper function to break a word by character (async version)
const breakWordByCharacter = async (
  word: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): Promise<{ lines: string[]; maxLineWidth: number }> => {
  const lines: string[] = [];
  let currentLine = '';
  let maxLineWidth = 0;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const testLine = currentLine + char;
    const testWidth = await measureTextWidth(testLine, fontSize, fontFamily, fontWeight);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        const lineWidth = await measureTextWidth(currentLine, fontSize, fontFamily, fontWeight);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        currentLine = char;
      } else {
        lines.push(char);
        const charWidth = await measureTextWidth(char, fontSize, fontFamily, fontWeight);
        maxLineWidth = Math.max(maxLineWidth, charWidth);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
    const lineWidth = await measureTextWidth(currentLine, fontSize, fontFamily, fontWeight);
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }

  return { lines, maxLineWidth };
};

// Helper function to break a word by character (sync version)
const breakWordByCharacterSync = (
  word: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): { lines: string[]; maxLineWidth: number } => {
  const lines: string[] = [];
  let currentLine = '';
  let maxLineWidth = 0;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const testLine = currentLine + char;
    const testWidth = measureTextWidthSync(testLine, fontSize, fontFamily, fontWeight);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        const lineWidth = measureTextWidthSync(currentLine, fontSize, fontFamily, fontWeight);
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        currentLine = char;
      } else {
        lines.push(char);
        const charWidth = measureTextWidthSync(char, fontSize, fontFamily, fontWeight);
        maxLineWidth = Math.max(maxLineWidth, charWidth);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
    const lineWidth = measureTextWidthSync(currentLine, fontSize, fontFamily, fontWeight);
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }

  return { lines, maxLineWidth };
};

// Utility to estimate optimal break points for different content types
export const getOptimalBreakStrategy = (text: string, field: string): 'word' | 'character' | 'none' => {
  if (field === 'teacherName') {
    return 'word';
  }
  
  if (field === 'date'|| field === 'time') {
    return 'none';
  }
  
  const hasLongWords = text.split(' ').some(word => word.length > 15);
  return hasLongWords ? 'character' : 'word';
};
