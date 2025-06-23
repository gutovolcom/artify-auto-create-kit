
// Accurate text measurement utility for better width calculations
export const measureTextWidth = (
  text: string,
  fontSize: number,
  fontFamily: string
): number => {
  // Create a temporary canvas for accurate text measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    // Fallback calculation if canvas context not available
    return text.length * fontSize * 0.6;
  }
  
  // Set font properties to match the actual text rendering
  context.font = `${fontSize}px ${fontFamily}`;
  
  // Measure the text width
  const metrics = context.measureText(text);
  
  // Add a safety factor of 20% to account for font rendering variations
  const safetyFactor = 1.2;
  
  return metrics.width * safetyFactor;
};

// Calculate dynamic safety margin based on font size
export const getDynamicSafetyMargin = (fontSize: number): number => {
  // Larger fonts need proportionally larger margins
  return Math.max(20, fontSize * 0.3);
};

// Get format-specific padding based on text alignment
export const getAlignmentPadding = (format: string, elementX: number, canvasWidth: number): number => {
  const leftAlignedFormats = ['youtube', 'feed', 'stories', 'ledStudio'];
  
  if (leftAlignedFormats.includes(format)) {
    // For left-aligned formats, use more generous right padding
    return Math.min(60, canvasWidth - elementX - 100);
  } else {
    // For center-aligned formats, use balanced padding
    return 40;
  }
};
