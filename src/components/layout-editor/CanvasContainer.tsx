
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
}

const CanvasRuler: React.FC<{ 
  direction: 'horizontal' | 'vertical'; 
  size: number; 
  scale: number;
}> = ({ direction, size, scale }) => {
  const marks = [];
  const step = 50; // Every 50px
  const actualSize = size / scale;
  
  for (let i = 0; i <= actualSize; i += step) {
    const position = (i * scale);
    if (direction === 'horizontal') {
      marks.push(
        <div
          key={i}
          className="absolute border-l border-gray-400"
          style={{
            left: `${position}px`,
            height: i % 100 === 0 ? '100%' : '50%',
            bottom: 0
          }}
        >
          {i % 100 === 0 && (
            <span className="absolute -bottom-4 -left-2 text-xs text-gray-600">
              {i}
            </span>
          )}
        </div>
      );
    } else {
      marks.push(
        <div
          key={i}
          className="absolute border-t border-gray-400"
          style={{
            top: `${position}px`,
            width: i % 100 === 0 ? '100%' : '50%',
            right: 0
          }}
        >
          {i % 100 === 0 && (
            <span className="absolute -right-6 -top-2 text-xs text-gray-600 transform -rotate-90 origin-center">
              {i}
            </span>
          )}
        </div>
      );
    }
  }
  
  return <>{marks}</>;
};

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

  const actualWidth = Math.round(displayWidth / scale);
  const actualHeight = Math.round(displayHeight / scale);

  return (
    <div className="p-6 mb-6">
      <div className="canvas-container canvas-background-grid">
        {/* Ruler Corner */}
        <div className="canvas-ruler-corner flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* Horizontal Ruler */}
        <div className="canvas-ruler-horizontal relative">
          <CanvasRuler direction="horizontal" size={displayWidth} scale={scale} />
        </div>
        
        {/* Vertical Ruler */}
        <div className="canvas-ruler-vertical relative">
          <CanvasRuler direction="vertical" size={displayHeight} scale={scale} />
        </div>
        
        {/* Canvas Wrapper */}
        <div className="canvas-wrapper">
          <canvas 
            ref={canvasRef} 
            className="border-0 shadow-lg rounded-lg" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              display: 'block'
            }}
          />
          
          {/* Canvas Info Overlay */}
          <div className="canvas-info-overlay">
            {actualWidth} × {actualHeight} px (Escala: {Math.round((1/scale) * 100)}%)
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-600 text-center space-y-1">
        <p className="font-medium">💡 Dicas de Uso do Canvas</p>
        <p>• Use as réguas para alinhamento preciso dos elementos</p>
        <p>• Arraste elementos para reposicionar • Arraste pelas bordas para redimensionar</p>
        <p>• As grades ajudam no alinhamento visual dos elementos</p>
      </div>
    </div>
  );
};
