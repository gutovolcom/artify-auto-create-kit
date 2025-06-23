
import React from 'react';
import { CanvasArea } from '../layout-editor/CanvasArea';
import { AdvancedCanvasToolbar } from './AdvancedCanvasToolbar';
import { Card } from '@/components/ui/card';

interface AdvancedCanvasAreaProps {
  formatName: string;
  formatDimensions: { width: number; height: number };
  displayWidth: number;
  displayHeight: number;
  backgroundImageUrl: string;
  scale: number;
  canvas: any;
  selectedObject: any;
  canUndo: boolean;
  canRedo: boolean;
  onCanvasReady: (fabricCanvas: any) => void;
  onSelectionChange: (object: any) => void;
  onSave: () => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveState: () => void;
}

export const AdvancedCanvasArea: React.FC<AdvancedCanvasAreaProps> = ({
  formatName,
  formatDimensions,
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  canvas,
  selectedObject,
  canUndo,
  canRedo,
  onCanvasReady,
  onSelectionChange,
  onSave,
  onDeleteSelected,
  onBackgroundLoaded,
  onUndo,
  onRedo,
  onSaveState
}) => {
  return (
    <Card className="p-4">
      {/* Advanced Toolbar */}
      <AdvancedCanvasToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        selectedObject={selectedObject}
        onUndo={onUndo}
        onRedo={onRedo}
        onSave={onSave}
        onDeleteSelected={onDeleteSelected}
        onSaveState={onSaveState}
      />

      {/* Canvas Area */}
      <div className="mt-4">
        <CanvasArea
          formatName={formatName}
          formatDimensions={formatDimensions}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          backgroundImageUrl={backgroundImageUrl}
          scale={scale}
          canvas={canvas}
          selectedObject={selectedObject}
          onCanvasReady={onCanvasReady}
          onSelectionChange={onSelectionChange}
          onSave={onSave}
          onDeleteSelected={onDeleteSelected}
          onBackgroundLoaded={onBackgroundLoaded}
        />
      </div>
    </Card>
  );
};
