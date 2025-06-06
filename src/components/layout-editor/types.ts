
export interface LayoutEditorProps {
  templateId: string;
  formatName: string;
  backgroundImageUrl: string;
  formatDimensions: { width: number; height: number };
  onSave?: () => void;
}

export interface CanvasElementConfig {
  id?: string;
  type: string;
  field: string;
  position: { x: number; y: number };
  style: any;
  imageUrl?: string;
  size?: {
    width: number;
    height: number;
  };
  constraints?: any;
}

export interface ElementProperties {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  padding?: number;
  borderRadius?: number;
}
