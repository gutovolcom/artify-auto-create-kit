
import React from 'react';
import { CanvasArea } from './CanvasArea';
import { ElementToolbar } from './ElementToolbar';

interface LayoutEditorContentProps {
  formatName: string;
  formatDimensions: { width: number; height: number };
  backgroundImageUrl: string;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  layoutElements: any[];
  onCanvasReady: (fabricCanvas: any) => void;
  onSelectionChange: (object: any) => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded: () => void;
  onAddElement: (elementType: string) => void;
  onSaveLayout?: () => void;
  setupEventHandlers?: (canvas: any, format?: string) => void;
}

export const LayoutEditorContent: React.FC<LayoutEditorContentProps> = ({
  formatName,
  formatDimensions,
  backgroundImageUrl,
  displayWidth,
  displayHeight,
  scale,
  layoutElements,
  onCanvasReady,
  onSelectionChange,
  onDeleteSelected,
  onBackgroundLoaded,
  onAddElement,
  onSaveLayout,
  setupEventHandlers
}) => {
  return (
    <>
      <CanvasArea
        formatName={formatName}
        formatDimensions={formatDimensions}
        displayWidth={displayWidth}
        displayHeight={displayHeight}
        backgroundImageUrl={backgroundImageUrl}
        scale={scale}
        onCanvasReady={onCanvasReady}
        onSelectionChange={onSelectionChange}
        onDeleteSelected={onDeleteSelected}
        onBackgroundLoaded={onBackgroundLoaded}
        onSaveLayout={onSaveLayout}
        setupEventHandlers={setupEventHandlers}
      />
      <ElementToolbar
        layoutElements={layoutElements}
        onAddElement={onAddElement}
      />
    
    {onSaveLayout && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={onSaveLayout}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition"
          >
            Salvar Layout
          </button>
        </div>
      )}
    </>
  );
};
