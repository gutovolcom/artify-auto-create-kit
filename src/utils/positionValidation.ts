
import { platformConfigs } from "@/lib/platformConfigs";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementBounds {
  position: Position;
  size: Size;
}

export const getFormatDimensions = (format: string): { width: number; height: number } => {
  const config = platformConfigs[format as keyof typeof platformConfigs];
  if (!config) {
    console.warn(`Unknown format: ${format}, using default dimensions`);
    return { width: 1920, height: 1080 };
  }
  return { width: config.width, height: config.height };
};

export const validateElementPosition = (
  element: ElementBounds,
  format: string
): { isValid: boolean; violations: string[] } => {
  const formatDimensions = getFormatDimensions(format);
  const violations: string[] = [];
  
  // Check if element starts within canvas
  if (element.position.x < 0) {
    violations.push(`X position ${element.position.x} is negative`);
  }
  if (element.position.y < 0) {
    violations.push(`Y position ${element.position.y} is negative`);
  }
  
  // Check if element ends within canvas
  const elementRight = element.position.x + element.size.width;
  const elementBottom = element.position.y + element.size.height;
  
  if (elementRight > formatDimensions.width) {
    violations.push(`Element extends beyond right boundary: ${elementRight} > ${formatDimensions.width}`);
  }
  if (elementBottom > formatDimensions.height) {
    violations.push(`Element extends beyond bottom boundary: ${elementBottom} > ${formatDimensions.height}`);
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
};

export const constrainToCanvas = (
  element: ElementBounds,
  format: string,
  margin: number = 10
): ElementBounds => {
  const formatDimensions = getFormatDimensions(format);
  
  // For small formats (LP, Destaque, bannerGCO, LEDStudio), use ultra-minimal margins
  let effectiveMargin = margin;
  
  if (format === 'destaque' || format === 'bannerGCO' || format === 'LP' || format === 'ledStudio') {
    effectiveMargin = Math.min(margin, 1); // Ultra-minimal for small formats
    console.log(`📏 [${format}] Using ultra-minimal margin: ${effectiveMargin}px to preserve positioning`);
  } else {
    // For very small formats by area, ensure margin doesn't make positioning impossible
    const area = formatDimensions.width * formatDimensions.height;
    
    if (area < 60000) {
      effectiveMargin = Math.min(margin, Math.floor(Math.min(formatDimensions.width, formatDimensions.height) * 0.05));
      console.log(`📏 Adjusted margin for small format ${format}: ${margin} → ${effectiveMargin}px`);
    }
  }
  
  const maxX = formatDimensions.width - element.size.width - effectiveMargin;
  const maxY = formatDimensions.height - element.size.height - effectiveMargin;
  
  const constrainedPosition = {
    x: Math.max(effectiveMargin, Math.min(element.position.x, maxX)),
    y: Math.max(effectiveMargin, Math.min(element.position.y, maxY))
  };
  
  console.log(`Constrained element to canvas ${format} with ${effectiveMargin}px margin:`, {
    original: element.position,
    constrained: constrainedPosition,
    formatDimensions,
    elementSize: element.size
  });
  
  return {
    ...element,
    position: constrainedPosition
  };
};

export const getSafeZone = (format: string, margin: number = 50) => {
  const dimensions = getFormatDimensions(format);
  
  // For small formats, use smaller safe zone margins
  const area = dimensions.width * dimensions.height;
  let effectiveMargin = margin;
  
  if (area < 60000 || format === 'destaque' || format === 'LP' || format === 'ledStudio') {
    effectiveMargin = Math.min(margin, 10); // Much smaller safe zone for tiny formats
  }
  
  return {
    x: effectiveMargin,
    y: effectiveMargin,
    width: dimensions.width - (effectiveMargin * 2),
    height: dimensions.height - (effectiveMargin * 2)
  };
};
