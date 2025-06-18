
import { FabricText } from 'fabric';

export interface TextSizeResult {
  fontSize: number;
  wrappedText: string;
  lineCount: number;
  actualWidth: number;
  actualHeight: number;
}

export interface TextSizeConstraints {
  maxWidth: number;
  maxHeight: number;
  minFontSize: number;
  maxFontSize: number;
  allowMultiline: boolean;
  preserveAspectRatio?: boolean;
}

export const calculateSmartTextSize = (
  text: string,
  constraints: TextSizeConstraints,
  fontFamily: string
): TextSizeResult => {
  if (!text.trim()) {
    return {
      fontSize: constraints.minFontSize,
      wrappedText: text,
      lineCount: 1,
      actualWidth: 0,
      actualHeight: 0
    };
  }

  let fontSize = constraints.maxFontSize;
  let wrappedText = text;
  let lineCount = 1;

  // Create a test text object for measurements
  const testText = new FabricText(text, {
    fontSize,
    fontFamily
  });

  // If text fits at max font size, use it
  if (testText.width! <= constraints.maxWidth && testText.height! <= constraints.maxHeight) {
    return {
      fontSize,
      wrappedText: text,
      lineCount: 1,
      actualWidth: testText.width!,
      actualHeight: testText.height!
    };
  }

  // Binary search for optimal font size
  let minSize = constraints.minFontSize;
  let maxSize = constraints.maxFontSize;
  let bestResult: TextSizeResult = {
    fontSize: minSize,
    wrappedText: text,
    lineCount: 1,
    actualWidth: 0,
    actualHeight: 0
  };

  while (maxSize - minSize > 1) {
    fontSize = Math.floor((minSize + maxSize) / 2);
    testText.set({ fontSize });

    if (constraints.allowMultiline && testText.width! > constraints.maxWidth) {
      // Try wrapping text
      const wrapped = wrapText(text, fontSize, fontFamily, constraints.maxWidth);
      testText.set({ text: wrapped.text });
      
      if (testText.height! <= constraints.maxHeight) {
        bestResult = {
          fontSize,
          wrappedText: wrapped.text,
          lineCount: wrapped.lineCount,
          actualWidth: Math.min(testText.width!, constraints.maxWidth),
          actualHeight: testText.height!
        };
        minSize = fontSize;
      } else {
        maxSize = fontSize - 1;
      }
    } else if (testText.width! <= constraints.maxWidth && testText.height! <= constraints.maxHeight) {
      bestResult = {
        fontSize,
        wrappedText: text,
        lineCount: 1,
        actualWidth: testText.width!,
        actualHeight: testText.height!
      };
      minSize = fontSize;
    } else {
      maxSize = fontSize - 1;
    }
  }

  return bestResult;
};

export const wrapText = (
  text: string,
  fontSize: number,
  fontFamily: string,
  maxWidth: number
): { text: string; lineCount: number } => {
  const testText = new FabricText('', { fontSize, fontFamily });
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    testText.set({ text: testLine });

    if (testText.width! <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, try to break it
        const brokenWord = breakLongWord(word, fontSize, fontFamily, maxWidth);
        lines.push(...brokenWord.slice(0, -1));
        currentLine = brokenWord[brokenWord.length - 1];
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return {
    text: lines.join('\n'),
    lineCount: lines.length
  };
};

const breakLongWord = (
  word: string,
  fontSize: number,
  fontFamily: string,
  maxWidth: number
): string[] => {
  const testText = new FabricText('', { fontSize, fontFamily });
  const lines: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < word.length; i++) {
    const testChunk = currentChunk + word[i];
    testText.set({ text: testChunk });

    if (testText.width! <= maxWidth) {
      currentChunk = testChunk;
    } else {
      if (currentChunk) {
        lines.push(currentChunk);
        currentChunk = word[i];
      } else {
        // Single character is too wide, force it
        lines.push(word[i]);
        currentChunk = '';
      }
    }
  }

  if (currentChunk) {
    lines.push(currentChunk);
  }

  return lines.length > 0 ? lines : [word];
};

export const smartTruncateText = (
  text: string,
  maxLength: number,
  preserveWords: boolean = true
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  if (preserveWords) {
    const words = text.split(' ');
    let result = '';
    
    for (const word of words) {
      const testResult = result ? `${result} ${word}` : word;
      if (testResult.length + 3 <= maxLength) { // +3 for "..."
        result = testResult;
      } else {
        break;
      }
    }
    
    return result ? `${result}...` : text.substring(0, maxLength - 3) + '...';
  }

  return text.substring(0, maxLength - 3) + '...';
};
