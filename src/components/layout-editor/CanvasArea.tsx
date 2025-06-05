
import React from 'react';
import * as fabric from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CanvasContainer } from './CanvasContainer';
import { CanvasControls } from './CanvasControls';

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
  return (
    <div className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>
            Layout Editor - {formatName} ({formatDimensions.width}x{formatDimensions.height})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          
          <CanvasControls
            selectedObject={selectedObject}
            onSave={onSave}
            onDeleteSelected={onDeleteSelected}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            scale={scale}
          />
        </CardContent>
      </Card>
    </div>
  );
};
