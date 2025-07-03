
import React from 'react';
import * as fabric from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CanvasContainer } from './CanvasContainer';
import { Ruler } from 'lucide-react';

type FabricCanvas = fabric.Canvas;

interface CanvasAreaProps {
  formatName: string;
  formatDimensions: { width: number; height: number };
  displayWidth: number;
  displayHeight: number;
  backgroundImageUrl: string;
  scale: number;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onSelectionChange: (object: any) => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded?: () => void;
  onSaveLayout?: () => void;
  setupEventHandlers?: (canvas: FabricCanvas, format?: string) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  formatName,
  formatDimensions,
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  onCanvasReady,
  onSelectionChange,
  onDeleteSelected,
  onBackgroundLoaded,
  onSaveLayout,
  setupEventHandlers
}) => {
  return (
    <div className="flex-1">
      <Card className="shadow-lg border-slate-200/80 bg-slate-50 h-full">
        <CardHeader className="pb-4 border-b border-slate-200/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Editor de Layout: <span className="font-bold text-[#DD303E]">{formatName}</span>
            </CardTitle>
            
            <div className="flex items-center gap-2 text-sm font-medium bg-slate-200/80 text-slate-700 px-3 py-1 rounded-full">
              <Ruler className="w-4 h-4" />
              <span>{formatDimensions.width} × {formatDimensions.height} px</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 flex items-center justify-center">
          <CanvasContainer
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            backgroundImageUrl={backgroundImageUrl}
            scale={scale}
            onCanvasReady={onCanvasReady}
            onSelectionChange={onSelectionChange}
            onDeleteSelected={onDeleteSelected}
            onBackgroundLoaded={onBackgroundLoaded}
            setupEventHandlers={setupEventHandlers}
          />
        </CardContent>
      </Card>
    </div>
  );
};
