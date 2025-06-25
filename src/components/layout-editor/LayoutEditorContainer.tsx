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

export const LayoutEditorContainer: React.FC<LayoutEditorProps & { onSave: () => void }> = (props) => {
  const { templateId, formatName, onSave, formatDimensions } = props;

  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  
  const state = useLayoutEditorState();
  const { canvas, canvasRef, loadingState, layoutLoadAttempts, loadingError, layoutDraft, isLoadingLayout } = state;
  
  // Calcula a escala e dimensões de exibição
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  const manager = useCanvasManager({ ...state, displayWidth, displayHeight, scale, getLayout });
  const operations = useLayoutOperations({ ...props, ...state, displayWidth, displayHeight, scale, layoutElements, saveLayout });

  if (elementsLoading || error) {
    return <LayoutEditorLoadingStates elementsLoading={elementsLoading} error={error} />;
  }

  return (
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
  );
};