
import { FabricText } from 'fabric';
import { calculateSmartTextSize, TextSizeConstraints } from './smartTextSizer';
import { calculateSafeZones, findBestTextPosition, ElementBounds } from './collisionDetector';

export interface SmartTextResult {
  fontSize: number;
  text: string;
  position: { x: number; y: number };
  actualWidth: number;
  actualHeight: number;
}

export interface SmartTextOptions {
  field: string;
  text: string;
  originalPosition: { x: number; y: number };
  fontFamily: string;
  canvasWidth: number;
  canvasHeight: number;
  format: string;
  occupiedAreas?: ElementBounds[];
  allowRepositioning?: boolean;
}

export const calculateSmartText = (options: SmartTextOptions): SmartTextResult => {
  const {
    field,
    text,
    originalPosition,
    fontFamily,
    canvasWidth,
    canvasHeight,
    format,
    occupiedAreas = [],
    allowRepositioning = false
  } = options;

  // Get field-specific constraints
  const constraints = getFieldConstraints(field, format, canvasWidth, canvasHeight);
  
  // Calculate available space from original position
  const availableWidth = Math.min(
    constraints.maxWidth,
    canvasWidth - originalPosition.x - 20 // 20px padding
  );
  const availableHeight = Math.min(
    constraints.maxHeight,
    canvasHeight - originalPosition.y - 20
  );

  // Adjust constraints based on available space
  const adjustedConstraints: TextSizeConstraints = {
    ...constraints,
    maxWidth: Math.max(availableWidth, constraints.maxWidth * 0.5), // At least 50% of desired width
    maxHeight: Math.max(availableHeight, constraints.maxHeight * 0.5)
  };

  // Calculate optimal text size
  const sizeResult = calculateSmartTextSize(text, adjustedConstraints, fontFamily);

  // Check if we need to reposition due to collisions
  let finalPosition = originalPosition;
  
  if (allowRepositioning && occupiedAreas.length > 0) {
    const safeZones = calculateSafeZones(canvasWidth, canvasHeight, occupiedAreas, format);
    const newPosition = findBestTextPosition(
      sizeResult.actualWidth,
      sizeResult.actualHeight,
      safeZones,
      originalPosition
    );
    
    if (newPosition) {
      finalPosition = newPosition;
    }
  }

  return {
    fontSize: sizeResult.fontSize,
    text: sizeResult.wrappedText,
    position: finalPosition,
    actualWidth: sizeResult.actualWidth,
    actualHeight: sizeResult.actualHeight
  };
};

const getFieldConstraints = (
  field: string,
  format: string,
  canvasWidth: number,
  canvasHeight: number
): TextSizeConstraints => {
  const baseConstraints = {
    maxWidth: canvasWidth * 0.8,
    maxHeight: canvasHeight * 0.3,
    minFontSize: 12,
    maxFontSize: 48,
    allowMultiline: false
  };

  // Field-specific constraints
  switch (field) {
    case 'title':
      return {
        ...baseConstraints,
        maxFontSize: getFormatMaxFontSize(format, 'title'),
        minFontSize: 18,
        allowMultiline: true,
        maxHeight: canvasHeight * 0.25
      };

    case 'classTheme':
      return {
        ...baseConstraints,
        maxFontSize: getFormatMaxFontSize(format, 'classTheme'),
        minFontSize: 14,
        allowMultiline: true,
        maxWidth: canvasWidth * 0.7,
        maxHeight: canvasHeight * 0.2
      };

    case 'teacherName':
      return {
        ...baseConstraints,
        maxFontSize: getFormatMaxFontSize(format, 'teacherName'),
        minFontSize: 16,
        allowMultiline: true,
        maxWidth: canvasWidth * 0.6,
        maxHeight: canvasHeight * 0.15
      };

    case 'date':
      return {
        ...baseConstraints,
        maxFontSize: getFormatMaxFontSize(format, 'date'),
        minFontSize: 14,
        allowMultiline: false,
        maxWidth: canvasWidth * 0.5,
        maxHeight: canvasHeight * 0.1
      };

    default:
      return baseConstraints;
  }
};

const getFormatMaxFontSize = (format: string, field: string): number => {
  const formatSizes: Record<string, Record<string, number>> = {
    youtube: {
      title: 48,
      classTheme: 32,
      teacherName: 28,
      date: 24
    },
    stories: {
      title: 42,
      classTheme: 28,
      teacherName: 24,
      date: 20
    },
    feed: {
      title: 36,
      classTheme: 24,
      teacherName: 20,
      date: 18
    },
    bannerGCO: {
      title: 40,
      classTheme: 26,
      teacherName: 22,
      date: 20
    },
    ledStudio: {
      title: 52,
      classTheme: 36,
      teacherName: 32,
      date: 28
    },
    LP: {
      title: 44,
      classTheme: 30,
      teacherName: 26,
      date: 22
    }
  };

  return formatSizes[format]?.[field] || 32;
};

export const constrainSmartTextToCanvas = (
  text: string,
  x: number,
  y: number,
  initialFontSize: number,
  fontFamily: string,
  canvasWidth: number,
  canvasHeight: number,
  field: string,
  format: string,
  occupiedAreas: ElementBounds[] = []
): SmartTextResult => {
  return calculateSmartText({
    field,
    text,
    originalPosition: { x, y },
    fontFamily,
    canvasWidth,
    canvasHeight,
    format,
    occupiedAreas,
    allowRepositioning: true
  });
};
