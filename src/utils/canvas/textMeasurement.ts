
// Font loading utilities
const fontLoadingCache = new Map<string, boolean>();
const measurementCache = new Map<string, number>();

// Check if a font is loaded and ready for measurement
const ensureFontLoaded = async (fontFamily: string, fontSize: number): Promise<boolean> => {
  const fontKey = `${fontFamily}-${fontSize}`;
  
  if (fontLoadingCache.has(fontKey)) {
    return fontLoadingCache.get(fontKey)!;
  }
  
  try {
    // Use document.fonts.check to verify font is loaded
    const fontString = `${fontSize}px ${fontFamily}`;
    const isLoaded = document.fonts.check(fontString);
    
    if (!isLoaded) {
      console.log(`⏳ Font not loaded, waiting: ${fontString}`);
      // Wait for font to load
      await document.fonts.load(fontString);
      
      // Verify it's loaded now
      const finalCheck = document.fonts.check(fontString);
      fontLoadingCache.set(fontKey, finalCheck);
      
      console.log(`✅ Font loading result: ${fontString} = ${finalCheck}`);
      return finalCheck;
    }
    
    fontLoadingCache.set(fontKey, true);
    return true;
  } catch (error) {
    console.error('❌ Font loading error:', error);
    fontLoadingCache.set(fontKey, false);
    return false;
  }
};

// Accurate text measurement utility with font loading checks
export const measureTextWidth = async (
  text: string,
  fontSize: number,
  fontFamily: string
): Promise<number> => {
  // Create cache key for this specific measurement
  const cacheKey = `${text}-${fontSize}-${fontFamily}`;
  
  if (measurementCache.has(cacheKey)) {
    return measurementCache.get(cacheKey)!;
  }
  
  // Ensure font is loaded before measuring
  const fontLoaded = await ensureFontLoaded(fontFamily, fontSize);
  
  if (!fontLoaded) {
    console.warn(`⚠️ Font not loaded for measurement: ${fontFamily}, using fallback calculation`);
    // Fallback calculation with conservative estimates
    const fallbackWidth = text.length * fontSize * 0.65; // More conservative than 0.6
    measurementCache.set(cacheKey, fallbackWidth);
    return fallbackWidth;
  }
  
  // Create a temporary canvas for accurate text measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    // Fallback calculation if canvas context not available
    const fallbackWidth = text.length * fontSize * 0.65;
    measurementCache.set(cacheKey, fallbackWidth);
    return fallbackWidth;
  }
  
  // Set font properties to match the actual text rendering
  context.font = `${fontSize}px ${fontFamily}`;
  
  // Measure the text width
  const metrics = context.measureText(text);
  
  // Add character-specific safety factors
  let safetyFactor = 1.2; // Base safety factor
  
  // Add extra safety for numeric strings (like times) that may have different widths
  if (/\d/.test(text)) {
    safetyFactor = 1.25; // Extra safety for numeric content
    console.log('🔢 Numeric content detected, using extra safety factor');
  }
  
  // Add extra safety for text with special characters
  if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüý]/.test(text)) {
    safetyFactor = 1.3; // Extra safety for accented characters
    console.log('🔤 Special characters detected, using extra safety factor');
  }
  
  const finalWidth = metrics.width * safetyFactor;
  
  console.log('📏 Text measurement:', {
    text,
    fontSize,
    fontFamily,
    rawWidth: metrics.width,
    safetyFactor,
    finalWidth,
    fontLoaded
  });
  
  measurementCache.set(cacheKey, finalWidth);
  return finalWidth;
};

// Synchronous version for backward compatibility (with font loading warnings)
export const measureTextWidthSync = (
  text: string,
  fontSize: number,
  fontFamily: string
): number => {
  const cacheKey = `${text}-${fontSize}-${fontFamily}`;
  
  if (measurementCache.has(cacheKey)) {
    return measurementCache.get(cacheKey)!;
  }
  
  // Check if font is loaded synchronously
  const fontString = `${fontSize}px ${fontFamily}`;
  const isLoaded = document.fonts.check(fontString);
  
  if (!isLoaded) {
    console.warn(`⚠️ Font not loaded for sync measurement: ${fontString}`);
  }
  
  // Create a temporary canvas for accurate text measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    // Fallback calculation if canvas context not available
    return text.length * fontSize * 0.65;
  }
  
  // Set font properties to match the actual text rendering
  context.font = fontString;
  
  // Measure the text width
  const metrics = context.measureText(text);
  
  // Add character-specific safety factors
  let safetyFactor = isLoaded ? 1.2 : 1.3; // Extra safety if font not loaded
  
  if (/\d/.test(text)) {
    safetyFactor += 0.05; // Extra safety for numeric content
  }
  
  if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüý]/.test(text)) {
    safetyFactor += 0.1; // Extra safety for accented characters
  }
  
  const finalWidth = metrics.width * safetyFactor;
  measurementCache.set(cacheKey, finalWidth);
  return finalWidth;
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

// Clear caches (useful for testing)
export const clearMeasurementCaches = () => {
  fontLoadingCache.clear();
  measurementCache.clear();
  console.log('🧹 Text measurement caches cleared');
};
