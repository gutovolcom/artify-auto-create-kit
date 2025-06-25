// src/components/layout-editor/LayoutEditorContent.tsx (CORRIGIDO)

import React from 'react';
import { CanvasArea } from './CanvasArea';
import { ElementToolbar } from './ElementToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { DebugPanel } from './DebugPanel'; // Corrigido para o nome correto do componente

interface LayoutEditorContentProps {
  // Todas as props que vêm do container
  formatName: string;
  formatDimensions: { width: number; height: number };
  backgroundImageUrl: string;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  selectedObject: any;
  loadingState: string;
  layoutLoadAttempts: number;
  loadingError: string | null;
  layoutElements: any[];
  onCanvasReady: (fabricCanvas: any) => void;
  onSelectionChange: (object: any) => void;
  onSaveLayout: () => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded: () => void;
  onAddElement: (elementType: string) => void;
  onManualReload: () => void;
}

export const LayoutEditorContent: React.FC<LayoutEditorContentProps> = ({
  formatName,
  formatDimensions,
  backgroundImageUrl,
  displayWidth,
  displayHeight,
  scale,
  selectedObject,
  loadingState,
  layoutLoadAttempts,
  loadingError,
  layoutElements,
  onCanvasReady,
  onSelectionChange,
  onSaveLayout,
  onDeleteSelected,
  onBackgroundLoaded,
  onAddElement,
  onManualReload,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 relative">
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
        />
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={onAddElement}
        />
      </div>

      <div className="w-full lg:w-72 space-y-4">
        {selectedObject && (
          <PropertiesPanel
            selectedObject={selectedObject}
            scale={scale}
            onDeleteSelected={onDeleteSelected}
          />
        )}
        
        {/* Renderiza o painel de debug apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <DebugPanel
            loadingState={loadingState}
            layoutLoadAttempts={layoutLoadAttempts}
            loadingError={loadingError}
            onManualReload={onManualReload}
          />
        )}
      </div>
    </div>
  );
};