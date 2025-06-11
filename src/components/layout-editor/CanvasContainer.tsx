
import React from 'react';
import * as fabric from 'fabric';
import { useCanvasSetup } from '@/hooks/useCanvasSetup';
import { CanvasWithGuides } from './CanvasWithGuides';
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
            <span className="absolute -bottom-4 -left-2 text-xs text-gray-600 font-mono">
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
            <span className="absolute -right-8 -top-2 text-xs text-gray-600 font-mono transform -rotate-90 origin-center">
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
    onCanvasReady: (canvas) => {
      // Enhance canvas for better element visibility
      canvas.selectionColor = 'rgba(59, 130, 246, 0.1)';
      canvas.selectionBorderColor = '#3b82f6';
      canvas.selectionLineWidth = 2;
      
      // Better selection styling
      canvas.on('object:added', (e) => {
        const obj = e.target;
        if (obj && obj.type !== 'line') {
          obj.set({
            borderColor: '#3b82f6',
            borderScaleFactor: 2,
            cornerColor: '#3b82f6',
            cornerStyle: 'circle',
            cornerSize: 8,
            transparentCorners: false
          });
        }
      });

      onCanvasReady(canvas);
    },
    onSelectionChange,
    onDeleteSelected,
    onBackgroundLoaded
  });

  const [canvas, setCanvas] = React.useState<FabricCanvas | null>(null);

  // Get canvas reference when it's ready
  React.useEffect(() => {
    const checkCanvas = () => {
      if (canvasRef.current) {
        const fabricCanvas = (canvasRef.current as any).__fabric;
        if (fabricCanvas && fabricCanvas !== canvas) {
          setCanvas(fabricCanvas);
        }
      }
    };

    const interval = setInterval(checkCanvas, 100);
    return () => clearInterval(interval);
  }, [canvasRef, canvas]);

  const actualWidth = Math.round(displayWidth / scale);
  const actualHeight = Math.round(displayHeight / scale);

  return (
    <div className="p-6 mb-6">
      <div className="canvas-container canvas-background-grid">
        {/* Ruler Corner */}
        <div className="canvas-ruler-corner flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
        </div>
        
        {/* Horizontal Ruler */}
        <div className="canvas-ruler-horizontal relative bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300">
          <CanvasRuler direction="horizontal" size={displayWidth} scale={scale} />
        </div>
        
        {/* Vertical Ruler */}
        <div className="canvas-ruler-vertical relative bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-300">
          <CanvasRuler direction="vertical" size={displayHeight} scale={scale} />
        </div>
        
        {/* Canvas Wrapper */}
        <div className="canvas-wrapper relative">
          <canvas 
            ref={canvasRef} 
            className="border-2 border-gray-300 shadow-xl rounded-lg bg-white" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              display: 'block'
            }}
          />
          
          {/* Canvas Info Overlay */}
          <div className="canvas-info-overlay bg-gray-900/90 text-white font-mono">
            {actualWidth} × {actualHeight} px • Escala: {Math.round((1/scale) * 100)}%
          </div>

          {/* Alignment Guides Component */}
          <CanvasWithGuides canvas={canvas} scale={scale} />
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Guias de Alinhamento
          </div>
          <p className="text-blue-700">Linhas azuis mostram o centro do canvas. Linhas vermelhas aparecem quando elementos se alinham.</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="font-semibold text-green-800 mb-1 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Controles de Precisão
          </div>
          <p className="text-green-700">Use as réguas para posicionamento preciso. Botões de alinhamento disponíveis no painel de propriedades.</p>
        </div>
      </div>
    </div>
  );
};
