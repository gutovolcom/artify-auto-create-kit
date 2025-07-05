// Unified positioning system - single source of truth
export interface NormalizedPosition {
  x: number; // 0-1 range
  y: number; // 0-1 range
}

export interface NormalizedSize {
  width: number; // 0-1 range
  height: number; // 0-1 range
}

export interface NormalizedElement {
  id: string;
  field: string;
  type: 'text' | 'image';
  position: NormalizedPosition;
  size: NormalizedSize;
  style?: any;
  imageUrl?: string;
}

export interface FormatDimensions {
  width: number;
  height: number;
}

export class PositionSystem {
  private formatDimensions: FormatDimensions;
  private scale: number;
  
  constructor(formatDimensions: FormatDimensions, scale: number = 1) {
    this.formatDimensions = formatDimensions;
    this.scale = scale;
  }

  // Convert from normalized coordinates to absolute pixels
  normalizedToAbsolute(normalized: NormalizedPosition): { x: number; y: number } {
    return {
      x: Math.round(normalized.x * this.formatDimensions.width * 1000) / 1000,
      y: Math.round(normalized.y * this.formatDimensions.height * 1000) / 1000
    };
  }

  // Convert from absolute pixels to normalized coordinates
  absoluteToNormalized(absolute: { x: number; y: number }): NormalizedPosition {
    return {
      x: Math.round((absolute.x / this.formatDimensions.width) * 1000) / 1000,
      y: Math.round((absolute.y / this.formatDimensions.height) * 1000) / 1000
    };
  }

  // Convert normalized to canvas coordinates (with scaling)
  normalizedToCanvas(normalized: NormalizedPosition): { x: number; y: number } {
    const absolute = this.normalizedToAbsolute(normalized);
    return {
      x: Math.round(absolute.x * this.scale * 1000) / 1000,
      y: Math.round(absolute.y * this.scale * 1000) / 1000
    };
  }

  // Convert canvas coordinates to normalized (with scaling)
  canvasToNormalized(canvas: { x: number; y: number }): NormalizedPosition {
    const absolute = {
      x: canvas.x / this.scale,
      y: canvas.y / this.scale
    };
    return this.absoluteToNormalized(absolute);
  }

  // Convert normalized size to absolute pixels
  normalizedSizeToAbsolute(normalizedSize: NormalizedSize): { width: number; height: number } {
    return {
      width: Math.round(normalizedSize.width * this.formatDimensions.width * 1000) / 1000,
      height: Math.round(normalizedSize.height * this.formatDimensions.height * 1000) / 1000
    };
  }

  // Convert absolute size to normalized
  absoluteSizeToNormalized(absoluteSize: { width: number; height: number }): NormalizedSize {
    return {
      width: Math.round((absoluteSize.width / this.formatDimensions.width) * 1000) / 1000,
      height: Math.round((absoluteSize.height / this.formatDimensions.height) * 1000) / 1000
    };
  }

  // Validate and constrain normalized element
  validateAndConstrain(element: NormalizedElement): NormalizedElement {
    // Constrain position to 0-1 range
    const constrainedPosition: NormalizedPosition = {
      x: Math.max(0, Math.min(1 - element.size.width, element.position.x)),
      y: Math.max(0, Math.min(1 - element.size.height, element.position.y))
    };

    // Constrain size to fit within canvas
    const constrainedSize: NormalizedSize = {
      width: Math.max(0.01, Math.min(1 - element.position.x, element.size.width)),
      height: Math.max(0.01, Math.min(1 - element.position.y, element.size.height))
    };

    return {
      ...element,
      position: constrainedPosition,
      size: constrainedSize
    };
  }

  // Get absolute bounds for element
  getAbsoluteBounds(element: NormalizedElement): {
    x: number;
    y: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  } {
    const position = this.normalizedToAbsolute(element.position);
    const size = this.normalizedSizeToAbsolute(element.size);
    
    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      right: position.x + size.width,
      bottom: position.y + size.height
    };
  }

  // Check if element fits within format dimensions
  isElementValid(element: NormalizedElement): boolean {
    const bounds = this.getAbsoluteBounds(element);
    return (
      bounds.x >= 0 &&
      bounds.y >= 0 &&
      bounds.right <= this.formatDimensions.width &&
      bounds.bottom <= this.formatDimensions.height
    );
  }
} 