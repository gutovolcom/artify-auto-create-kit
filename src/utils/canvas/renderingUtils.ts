
import { getDynamicSafetyMargin, getAlignmentPadding } from './textMeasurement';

// Helper function to get text alignment based on format
export const getTextAlignmentForFormat = (format: string): 'left' | 'center' => {
  const leftAlignedFormats = ['youtube', 'feed', 'stories', 'ledStudio'];
  const centerAlignedFormats = ['bannerGCO', 'LP'];
  
  if (leftAlignedFormats.includes(format)) {
    return 'left';
  } else if (centerAlignedFormats.includes(format)) {
    return 'center';
  }
  
  // Default fallback
  return 'center';
};

// Get format-specific padding for lesson theme boxes
export const getFormatSpecificPadding = (format: string): number => {
  const formatPadding = {
    'bannerGCO': 12, // Reduced from 20 for better proportion
    'ledStudio': 18,
    'youtube': 20,
    'feed': 20,
    'stories': 20,
    'LP': 20
  };
  
  return formatPadding[format as keyof typeof formatPadding] || 20;
};

// Improved format-specific max width calculation with accurate text measurement
export const getMaxTextWidthForFormat = (format: string, canvasWidth: number, elementX: number, field: string): number => {
  // For date/time fields that don't need text breaking, use very generous width
  if (field === 'date' || field === 'time') {
    const alignmentPadding = getAlignmentPadding(format, elementX, canvasWidth);
    return Math.min(canvasWidth - elementX - alignmentPadding, 800); // Much more generous for date/time
  }
  
  // For teacher names, use generous limits with dynamic padding
  if (field === 'teacherName') {
    const dynamicMargin = getDynamicSafetyMargin(60); // Assume average teacher name font size
    const formatLimits = {
      'youtube': Math.min(canvasWidth - elementX - dynamicMargin, 700),
      'feed': Math.min(canvasWidth - elementX - dynamicMargin, 650),
      'stories': Math.min(canvasWidth - elementX - dynamicMargin, 600),
      'ledStudio': Math.min(canvasWidth - elementX - dynamicMargin, 600),
      'bannerGCO': Math.min(canvasWidth - elementX - dynamicMargin, 500),
      'LP': Math.min(canvasWidth - elementX - dynamicMargin, 550)
    };
    return formatLimits[format as keyof typeof formatLimits] || Math.min(canvasWidth - elementX - dynamicMargin, 500);
  }
  
  // For other fields that need text breaking, use improved limits
  const dynamicMargin = getDynamicSafetyMargin(100); // Assume larger font size for titles
  const formatLimits = {
    'youtube': Math.min(canvasWidth - elementX - dynamicMargin, 800),
    'feed': Math.min(canvasWidth - elementX - dynamicMargin, 750),    
    'stories': Math.min(canvasWidth - elementX - dynamicMargin, 700),
    'ledStudio': Math.min(canvasWidth - elementX - dynamicMargin, 700),
    'bannerGCO': Math.min(canvasWidth - elementX - dynamicMargin, 500),
    'LP': Math.min(canvasWidth - elementX - dynamicMargin, 550)
  };
  
  return formatLimits[format as keyof typeof formatLimits] || Math.min(canvasWidth - elementX - dynamicMargin, 450);
};
