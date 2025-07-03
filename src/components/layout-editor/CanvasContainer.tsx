
import React from 'react';
import * as fabric from 'fabric';
import { useCanvasSetup } from '@/hooks/useCanvasSetup';
import './CanvasContainer.css';

type FabricCanvas = fabric.Canvas;

interface CanvasContainerProps {
  displayWidth: number;
  displayHeight: number;
  backgroundImageUrl: string;
  scale: number;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onSelectionChange: (object: any) => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded?: () => void;
  setupEventHandlers?: (canvas: FabricCanvas, format?: string) => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  onCanvasReady,
  onSelectionChange,
  onDeleteSelected,
  onBackgroundLoaded,
  setupEventHandlers
}) => {
  const { canvasRef } = useCanvasSetup({
    displayWidth,
    displayHeight,
    backgroundImageUrl,
    scale,
    onCanvasReady,
    onSelectionChange,
    onDeleteSelected,
    onBackgroundLoaded,
    setupEventHandlers
  });

  return (
    <div className="canvas-background-grid">
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
