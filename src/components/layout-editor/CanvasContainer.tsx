
import React from 'react';
import * as fabric from 'fabric';
import { useCanvasSetup } from '@/hooks/useCanvasSetup';
import './CanvasContainer.css'; // Import the new CSS file

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
    <div className="border rounded-lg p-4 mb-4 canvas-background-grid"> {/* Added class, removed bg-gray-50 */}
      <canvas 
        ref={canvasRef} 
        className="border rounded shadow-sm" 
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};
