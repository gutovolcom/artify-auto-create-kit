// Layout manager for handling collections of elements
export class LayoutManager {
  private positionSystem: PositionSystem;
  private elements: Map<string, NormalizedElement> = new Map();

  constructor(formatDimensions: FormatDimensions, scale: number = 1) {
    this.positionSystem = new PositionSystem(formatDimensions, scale);
  }

  // Add element to layout
  addElement(element: NormalizedElement): void {
    const validatedElement = this.positionSystem.validateAndConstrain(element);
    this.elements.set(element.id, validatedElement);
  }

  // Update element position
  updateElementPosition(elementId: string, newPosition: NormalizedPosition): void {
    const element = this.elements.get(elementId);
    if (!element) return;

    const updatedElement = {
      ...element,
      position: newPosition
    };

    const validatedElement = this.positionSystem.validateAndConstrain(updatedElement);
    this.elements.set(elementId, validatedElement);
  }

  // Get element for canvas rendering
  getElementForCanvas(elementId: string): {
    position: { x: number; y: number };
    size: { width: number; height: number };
    element: NormalizedElement;
  } | null {
    const element = this.elements.get(elementId);
    if (!element) return null;

    return {
      position: this.positionSystem.normalizedToCanvas(element.position),
      size: this.positionSystem.normalizedSizeToAbsolute(element.size),
      element
    };
  }

  // Get element for generation (absolute coordinates)
  getElementForGeneration(elementId: string): {
    position: { x: number; y: number };
    size: { width: number; height: number };
    element: NormalizedElement;
  } | null {
    const element = this.elements.get(elementId);
    if (!element) return null;

    return {
      position: this.positionSystem.normalizedToAbsolute(element.position),
      size: this.positionSystem.normalizedSizeToAbsolute(element.size),
      element
    };
  }

  // Serialize layout for storage
  serializeLayout(): Array<{
    id: string;
    field: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style?: any;
    imageUrl?: string;
  }> {
    return Array.from(this.elements.values()).map(element => ({
      id: element.id,
      field: element.field,
      type: element.type,
      position: this.positionSystem.normalizedToAbsolute(element.position),
      size: this.positionSystem.normalizedSizeToAbsolute(element.size),
      style: element.style,
      imageUrl: element.imageUrl
    }));
  }

  // Deserialize layout from storage
  deserializeLayout(layoutData: Array<{
    id: string;
    field: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style?: any;
    imageUrl?: string;
  }>): void {
    this.elements.clear();
    
    layoutData.forEach(data => {
      const normalizedElement: NormalizedElement = {
        id: data.id,
        field: data.field,
        type: data.type as 'text' | 'image',
        position: this.positionSystem.absoluteToNormalized(data.position),
        size: this.positionSystem.absoluteSizeToNormalized(data.size),
        style: data.style,
        imageUrl: data.imageUrl
      };
      
      this.addElement(normalizedElement);
    });
  }

  // Update from canvas (when user drags/resizes)
  updateFromCanvas(fabricObject: any): void {
    const elementId = fabricObject.elementId;
    if (!elementId) return;

    const canvasPosition = { x: fabricObject.left || 0, y: fabricObject.top || 0 };
    const canvasSize = { 
      width: (fabricObject.width || 100) * (fabricObject.scaleX || 1),
      height: (fabricObject.height || 50) * (fabricObject.scaleY || 1)
    };

    const normalizedPosition = this.positionSystem.canvasToNormalized(canvasPosition);
    const absoluteSize = { 
      width: canvasSize.width / this.positionSystem.scale,
      height: canvasSize.height / this.positionSystem.scale
    };
    const normalizedSize = this.positionSystem.absoluteSizeToNormalized(absoluteSize);

    const element = this.elements.get(elementId);
    if (!element) return;

    const updatedElement: NormalizedElement = {
      ...element,
      position: normalizedPosition,
      size: normalizedSize
    };

    const validatedElement = this.positionSystem.validateAndConstrain(updatedElement);
    this.elements.set(elementId, validatedElement);
  }

  // Get all elements
  getAllElements(): NormalizedElement[] {
    return Array.from(this.elements.values());
  }

  // Get element by ID
  getElement(elementId: string): NormalizedElement | undefined {
    return this.elements.get(elementId);
  }

  // Remove element
  removeElement(elementId: string): void {
    this.elements.delete(elementId);
  }

  // Clear all elements
  clear(): void {
    this.elements.clear();
  }
} 