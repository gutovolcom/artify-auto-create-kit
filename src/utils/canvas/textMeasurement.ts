
import { ensureFontLoaded, FontConfig } from './fontLoader';

// Enhanced measurement cache with proper invalidation
const measurementCache = new Map<string, number>();
const CACHE_SIZE_LIMIT = 1000;

// Accurate text measurement with guaranteed font loading
export const measureTextWidth = async (
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): Promise<number> => {
  const cacheKey = `${text}-${fontSize}-${fontFamily}-${fontWeight || 'normal'}`;
  
  if (measurementCache.has(cacheKey)) {
    return measurementCache.get(cacheKey)!;
  }
  
  // Ensure font is loaded before measuring
  const fontConfig: FontConfig = {
    family: fontFamily,
    size: fontSize,
    weight: fontWeight
  };
  
  const fontLoaded = await ensureFontLoaded(fontConfig);
  
  if (!fontLoaded) {
    console.warn(`⚠️ Font not loaded for measurement: ${fontFamily}, using fallback`);
    const fallbackWidth = text.length * fontSize * 0.65;
    return fallbackWidth;
  }
  
  const width = measureTextWithCanvas(text, fontSize, fontFamily, fontWeight);
  
  // Manage cache size
  if (measurementCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = measurementCache.keys().next().value;
    measurementCache.delete(firstKey);
  }
  
  measurementCache.set(cacheKey, width);
  return width;
};

// Synchronous measurement for when font is guaranteed to be loaded
export const measureTextWidthSync = (
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): number => {
  const cacheKey = `${text}-${fontSize}-${fontFamily}-${fontWeight || 'normal'}`;
  
  if (measurementCache.has(cacheKey)) {
    return measurementCache.get(cacheKey)!;
  }
  
  const width = measureTextWithCanvas(text, fontSize, fontFamily, fontWeight);
  
  // Manage cache size
  if (measurementCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = measurementCache.keys().next().value;
    measurementCache.delete(firstKey);
  }
  
  measurementCache.set(cacheKey, width);
  return width;
};

// Core canvas measurement function
const measureTextWithCanvas = (
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight?: string
): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    return text.length * fontSize * 0.65;
  }
  
  context.font = `${fontWeight || 'normal'} ${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(text);
  
  // Apply safety factors for different content types
  let safetyFactor = 1.1;
  
  if (/\d/.test(text)) {
    safetyFactor = 1.15; // Extra safety for numeric content
  }
  
  if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüý]/.test(text)) {
    safetyFactor = 1.2; // Extra safety for accented characters
  }
  
  return metrics.width * safetyFactor;
};

// Calculate dynamic safety margin based on font size
export const getDynamicSafetyMargin = (fontSize: number): number => {
  return Math.max(20, fontSize * 0.3);
};

// Get format-specific padding based on text alignment
export const getAlignmentPadding = (format: string, elementX: number, canvasWidth: number): number => {
  const leftAlignedFormats = ['youtube', 'feed', 'stories', 'ledStudio'];
  
  if (leftAlignedFormats.includes(format)) {
    return Math.min(60, canvasWidth - elementX - 100);
  } else {
    return 40;
  }
};

// Clear measurement cache
export const clearMeasurementCache = () => {
  measurementCache.clear();
  console.log('🧹 Text measurement cache cleared');
};
