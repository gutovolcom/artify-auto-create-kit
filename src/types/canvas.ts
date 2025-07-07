// Canvas types for unified positioning system
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: number;
  [key: string]: any;
}

export interface ElementConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  lockAspectRatio?: boolean;
  preventOverflow?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

export type CanvasMode = 'layout-editor' | 'art-generation';

export interface UnifiedCanvasElement {
  id: string;
  field: string;
  type: string;
  position: Position;
  size: Size;
  mode: CanvasMode;
  style?: ElementStyle;
  imageUrl?: string;
  constraints?: ElementConstraints;
  text?: string;
  metadata?: Record<string, any>;
}

export interface SerializedElement {
  id: string;
  field: string;
  type: string;
  position: Position;
  size: Size;
  style?: ElementStyle;
  imageUrl?: string;
  constraints?: ElementConstraints;
  text?: string;
  metadata?: Record<string, any>;
}

export interface SerializedLayout {
  format: string;
  elements: SerializedElement[];
  metadata: {
    version: string;
    createdAt: string;
    canvasSize: Size;
    scale: number;
    [key: string]: any;
  };
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  selection?: boolean;
  interactive?: boolean;
  preserveObjectStacking?: boolean;
  renderOnAddRemove?: boolean;
  [key: string]: any;
}

export interface CanvasManagerState {
  canvas: any | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CanvasManagerActions {
  addElement: (element: UnifiedCanvasElement) => Promise<void>;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<UnifiedCanvasElement>) => void;
  serializeLayout: () => SerializedLayout;
  deserializeLayout: (layout: SerializedLayout) => Promise<void>;
  cleanup: () => void;
  updateScale: (scale: number) => void;
}

export interface ElementRenderContext {
  mode: CanvasMode;
  canvas: any;
  scale: number;
  format: string;
  displayWidth?: number;
  displayHeight?: number;
  eventData?: any;
}

export interface ElementRenderer {
  render(element: UnifiedCanvasElement, context: ElementRenderContext): Promise<void>;
  canHandle(element: UnifiedCanvasElement): boolean;
  getType(): string;
}

export interface PositionValidation {
  isValid: boolean;
  violations: string[];
  correctedPosition?: Position;
  correctedSize?: Size;
}

export interface FormatDimensions {
  width: number;
  height: number;
}

export interface CanvasElementConfig {
  id?: string;
  type: string;
  field: string;
  position: Position;
  size?: Size;
  style?: ElementStyle;
  imageUrl?: string;
  constraints?: ElementConstraints;
  text?: string;
  metadata?: Record<string, any>;
}

export interface LayoutElement {
  id: string;
  field: string;
  type: string;
  position: Position;
  size: Size;
  style?: ElementStyle;
}

export interface LayoutConfig {
  elements: LayoutElement[];
  metadata?: {
    version: string;
    createdAt: string;
    formatName: string;
    [key: string]: any;
  };
}

export interface EventData {
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  eventDescription?: string;
  teachers?: Array<{
    id: string;
    name: string;
    photo_url?: string;
  }>;
  classTheme?: string;
  [key: string]: any;
}

export interface CanvasElementData {
  id: string;
  field: string;
  type: string;
  position: Position;
  size: Size;
  style?: ElementStyle;
  text?: string;
  imageUrl?: string;
  fabricObject?: any;
}

export interface CanvasOperationResult {
  success: boolean;
  error?: string;
  data?: any;
} 