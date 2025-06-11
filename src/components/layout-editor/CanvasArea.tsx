
import React from 'react';
import * as fabric from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CanvasContainer } from './CanvasContainer';
import { CanvasControls } from './CanvasControls';
import { Monitor, Ruler } from 'lucide-react';

type FabricCanvas = fabric.Canvas;

interface CanvasAreaProps {
  formatName: string;
  formatDimensions: { width: number; height: number };
  displayWidth: number;
  displayHeight: number;
  backgroundImageUrl: string;
  scale: number;
  canvas: FabricCanvas | null;
  selectedObject: any;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onSelectionChange: (object: any) => void;
  onSave: () => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  formatName,
  formatDimensions,
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  canvas,
  selectedObject,
  onCanvasReady,
  onSelectionChange,
  onSave,
  onDeleteSelected,
  onBackgroundLoaded
}) => {
  const actualScale = Math.round((1/scale) * 100);
  
  return (
    <div className="flex-1">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-primary" />
                <span>Layout Editor</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-600">
                <Ruler className="w-4 h-4" />
                <span>{formatName}</span>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-primary/10 px-3 py-1 rounded-full">
                <span className="font-medium text-primary">
                  {formatDimensions.width} × {formatDimensions.height} px
                </span>
              </div>
              <div className="bg-secondary/10 px-3 py-1 rounded-full">
                <span className="font-medium text-secondary">
                  Escala {actualScale}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="font-medium text-blue-800">
                Editor de Posicionamento de Elementos
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Defina a posição e tamanho dos elementos de texto. 
              As fontes e cores serão aplicadas automaticamente durante a geração.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <CanvasContainer
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            backgroundImageUrl={backgroundImageUrl}
            scale={scale}
            onCanvasReady={onCanvasReady}
            onSelectionChange={onSelectionChange}
            onDeleteSelected={onDeleteSelected}
            onBackgroundLoaded={onBackgroundLoaded}
          />
          
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <CanvasControls
              selectedObject={selectedObject}
              onSave={onSave}
              onDeleteSelected={onDeleteSelected}
              displayWidth={displayWidth}
              displayHeight={displayHeight}
              scale={scale}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
