// src/components/layout-editor/LayoutEditorContainer.tsx (CORRIGIDO)

import React from 'react';
import { LayoutEditorProps } from './types';
import { LayoutEditorLoadingStates } from './LayoutEditorLoadingStates';
import { LayoutEditorContent } from './LayoutEditorContent';

// Seus hooks existentes
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';
import { DebugPanel } from './DebugPanel'; // Importação correta

export const LayoutEditorContainer: React.FC<LayoutEditorProps & { onSave: () => void }> = (props) => {
  const { templateId, formatName, formatDimensions, onSave } = props;

  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  const state = useLayoutEditorState();
  
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / (formatDimensions.width || 1),
    maxCanvasHeight / (formatDimensions.height || 1)
  );
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  const manager = useCanvasManager({ ...state, displayWidth, displayHeight, scale, getLayout });
  
  // CORREÇÃO: Passamos a prop 'updateLayoutDraft' que estava faltando
  const operations = useLayoutOperations({
    ...props,
    ...state,
    displayWidth,
    displayHeight,
    scale,
    layoutElements,
    saveLayout,
    updateLayoutDraft: manager.updateLayoutDraft // Prop adicionada aqui
  });

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
          onManualReload={() => manager.handleManualReload(templateId, formatName)}
          onSaveLayout={operations.handleSaveLayout}
        />
      </div>
      <div className="w-full lg:w-72 space-y-4">
        {state.selectedObject && (
          <PropertiesPanel
            selectedObject={state.selectedObject}
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