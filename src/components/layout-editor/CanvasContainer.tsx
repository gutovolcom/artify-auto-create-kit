
import React from 'react';
import { useCanvasSetup } from '@/hooks/useCanvasSetup';

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
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  onCanvasReady,
  onSelectionChange,
  onDeleteSelected,
  onBackgroundLoaded
}) => {
  const { canvasRef } = useCanvasSetup({
    displayWidth,
    displayHeight,
    backgroundImageUrl,
    scale,
    onCanvasReady,
    onSelectionChange,
    onDeleteSelected,
    onBackgroundLoaded
  });

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
      <canvas 
        ref={canvasRef} 
        className="border rounded shadow-sm" 
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};
