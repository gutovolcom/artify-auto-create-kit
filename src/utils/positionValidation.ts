
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
  const maxX = formatDimensions.width - element.size.width - margin;
  const maxY = formatDimensions.height - element.size.height - margin;
  
  const constrainedPosition = {
    x: Math.max(margin, Math.min(element.position.x, maxX)),
    y: Math.max(margin, Math.min(element.position.y, maxY))
  };
  
  console.log(`Constrained element to canvas ${format}:`, {
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
  return {
    x: margin,
    y: margin,
    width: dimensions.width - (margin * 2),
    height: dimensions.height - (margin * 2)
  };
};
