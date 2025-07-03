// src/components/layout-editor/LayoutEditorContainer.tsx (CORRIGIDO)

import React from 'react';
import { LayoutEditorProps } from './types';
import { LayoutEditorLoadingStates } from './LayoutEditorLoadingStates';
import { LayoutEditorContent } from './LayoutEditorContent';
import { PropertiesPanel } from './PropertiesPanel'; // CORREÇÃO: Importação adicionada
import { DebugPanel } from './DebugPanel';

// Seus hooks existentes
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';

export const LayoutEditorContainer: React.FC<LayoutEditorProps> = (props) => {
  const { templateId, formatName, formatDimensions, onSaveLayout } = props;

  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  
  const state = useLayoutEditorState();
  const { selectedObject } = state;
  
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / (formatDimensions.width || 1),
    maxCanvasHeight / (formatDimensions.height || 1)
  );
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  const manager = useCanvasManager({ ...state, displayWidth, displayHeight, scale, getLayout });
  const operations = useLayoutOperations({ ...props, ...state, displayWidth, displayHeight, scale, layoutElements, saveLayout, updateLayoutDraft: manager.updateLayoutDraft });

  if (elementsLoading || error) {
    return <LayoutEditorLoadingStates elementsLoading={elementsLoading} error={error} />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 relative">
        <LayoutEditorContent
          {...props}
          {...state}
          {...operations}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          scale={scale}
          layoutElements={layoutElements}
          onCanvasReady={(fabricCanvas) => manager.handleCanvasReady(fabricCanvas, templateId, formatName)}
          onSelectionChange={state.setSelectedObject}
          onDeleteSelected={operations.handleDeleteSelected}
          onBackgroundLoaded={() => manager.handleBackgroundLoaded(templateId, formatName)}
          onAddElement={operations.handleAddElement}
          onSaveLayout={operations.handleSaveLayout}
        />
      </div>
      <div className="w-full lg:w-72 space-y-4">
        {selectedObject && (
          <PropertiesPanel
            selectedObject={selectedObject}
            scale={scale}
            onDeleteSelected={operations.handleDeleteSelected}
          />
        )}
        {process.env.NODE_ENV === 'development' && (
          <DebugPanel
            loadingState={state.loadingState}
            layoutLoadAttempts={state.layoutLoadAttempts}
            loadingError={state.loadingError}
            onManualReload={() => manager.handleManualReload(templateId, formatName)}
          />
        )}
      </div>
    </div>
  );
};