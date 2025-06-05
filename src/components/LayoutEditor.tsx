
import React, { useEffect } from 'react';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';
import { LayoutEditorProps } from './layout-editor/types';
import { CanvasArea } from './layout-editor/CanvasArea';
import { ElementToolbar } from './layout-editor/ElementToolbar';
import { PropertiesPanel } from './layout-editor/PropertiesPanel';
import { DebugPanel } from './layout-editor/DebugPanel';

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  onSave
}) => {
  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  
  const {
    canvas,
    setCanvas,
    selectedObject,
    setSelectedObject,
    loadingState,
    setLoadingState,
    loadingError,
    setLoadingError,
    layoutLoadAttempts,
    setLayoutLoadAttempts,
    canvasRef,
    loadingTimeoutRef,
    resetState
  } = useLayoutEditorState();

  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  console.log('LayoutEditor render:', {
    templateId,
    formatName,
    loadingState,
    layoutLoadAttempts,
    canvasReady: !!canvas
  });

  const {
    handleCanvasReady,
    handleBackgroundLoaded,
    handleManualReload,
    loadLayoutIfReady
  } = useCanvasManager({
    canvas,
    canvasRef,
    loadingState,
    layoutLoadAttempts,
    loadingTimeoutRef,
    displayWidth,
    displayHeight,
    scale,
    setCanvas,
    setLoadingState,
    setLayoutLoadAttempts,
    setLoadingError,
    getLayout
  });

  const {
    handleAddElement,
    handleDeleteSelected,
    handleSaveLayout
  } = useLayoutOperations({
    canvas,
    selectedObject,
    setSelectedObject,
    scale,
    displayWidth,
    displayHeight,
    layoutElements,
    saveLayout,
    templateId,
    formatName,
    onSave
  });

  // Reset state when template or format changes
  useEffect(() => {
    console.log('Template or format changed, resetting state');
    resetState();
  }, [templateId, formatName]);

  // Set up fallback timeout trigger
  useEffect(() => {
    if (canvas && loadingState !== 'ready' && layoutLoadAttempts < 3) {
      const timeoutId = setTimeout(() => {
        console.log('Timeout triggered for loading elements');
        loadLayoutIfReady(templateId, formatName);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [canvas, loadingState, layoutLoadAttempts, templateId, formatName]);

  if (elementsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando elementos de layout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar editor de layout</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <CanvasArea
        formatName={formatName}
        formatDimensions={formatDimensions}
        displayWidth={displayWidth}
        displayHeight={displayHeight}
        backgroundImageUrl={backgroundImageUrl}
        scale={scale}
        canvas={canvas}
        selectedObject={selectedObject}
        onCanvasReady={(fabricCanvas) => handleCanvasReady(fabricCanvas, templateId, formatName)}
        onSelectionChange={setSelectedObject}
        onSave={handleSaveLayout}
        onDeleteSelected={handleDeleteSelected}
        onBackgroundLoaded={() => handleBackgroundLoaded(templateId, formatName)}
      />

      <div className="w-80">
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={handleAddElement}
        />

        <PropertiesPanel
          selectedObject={selectedObject}
          scale={scale}
          onUpdateObject={() => {}}
          onDeleteSelected={handleDeleteSelected}
        />

        <DebugPanel
          loadingState={loadingState}
          layoutLoadAttempts={layoutLoadAttempts}
          loadingError={loadingError}
          onManualReload={() => handleManualReload(templateId, formatName)}
        />
      </div>
    </div>
  );
};
