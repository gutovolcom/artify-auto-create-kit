// src/components/layout-editor/LayoutEditorContent.tsx (CORRIGIDO)

import React from 'react';
import { CanvasArea } from './CanvasArea';
import { ElementToolbar } from './ElementToolbar';

// A interface foi simplificada pois a lógica foi movida para o Container
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
  onSaveLayout
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
      />
      <ElementToolbar
        layoutElements={layoutElements}
        onAddElement={onAddElement}
      />
    </>
  );
};