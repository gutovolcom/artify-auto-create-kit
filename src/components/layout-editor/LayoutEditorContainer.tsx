
import React, { useEffect, useRef } from 'react';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';
import { LayoutEditorProps } from './types';
import { LayoutEditorLoadingStates } from './LayoutEditorLoadingStates';
import { LayoutEditorContent } from './LayoutEditorContent';

export const LayoutEditorContainer: React.FC<LayoutEditorProps> = ({
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
    incrementLayoutAttempts,
    layoutDraft,
    setLayoutDraft,
    isLoadingLayout,
    setIsLoadingLayout,
    canvasRef,
    loadingTimeoutRef,
    layoutUpdateTimeoutRef,
    resetState
  } = useLayoutEditorState();

  // Use refs to track previous values and prevent unnecessary resets
  const previousTemplateRef = useRef<string | null>(null);
  const previousFormatRef = useRef<string | null>(null);

  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  console.log('🎨 LayoutEditor render:', {
    templateId,
    formatName,
    loadingState,
    layoutLoadAttempts,
    isLoadingLayout,
    canvasReady: !!canvas,
    layoutDraftSize: layoutDraft.length,
    scale,
    formatDimensions
  });

  const {
    handleCanvasReady,
    handleBackgroundLoaded,
    handleManualReload,
    loadLayoutIfReady,
    updateLayoutDraft
  } = useCanvasManager({
    canvas,
    canvasRef,
    loadingState,
    layoutLoadAttempts,
    isLoadingLayout,
    loadingTimeoutRef,
    layoutUpdateTimeoutRef,
    displayWidth,
    displayHeight,
    scale,
    layoutDraft,
    setCanvas,
    setLoadingState,
    incrementLayoutAttempts,
    setLoadingError,
    setLayoutDraft,
    setIsLoadingLayout,
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
    layoutDraft,
    setLayoutDraft,
    saveLayout,
    templateId,
    formatName,
    onSave,
    updateLayoutDraft
  });

  // Fixed: Only reset when template or format actually changes
  useEffect(() => {
    const hasTemplateChanged = previousTemplateRef.current !== templateId;
    const hasFormatChanged = previousFormatRef.current !== formatName;
    
    console.log('[DEBUG] useEffect check:', { 
      templateId, 
      formatName, 
      hasTemplateChanged, 
      hasFormatChanged,
      previous: {
        template: previousTemplateRef.current,
        format: previousFormatRef.current
      }
    });

    if (hasTemplateChanged || hasFormatChanged) {
      console.log('🔄 Template or format actually changed, resetting state');
      previousTemplateRef.current = templateId;
      previousFormatRef.current = formatName;
      resetState();
    }
  }, [templateId, formatName]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (layoutUpdateTimeoutRef.current) {
        clearTimeout(layoutUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Show loading states if needed
  const loadingComponent = (
    <LayoutEditorLoadingStates 
      elementsLoading={elementsLoading} 
      error={error} 
    />
  );

  if (loadingComponent) {
    return loadingComponent;
  }

  return (
    <LayoutEditorContent
      templateId={templateId}
      formatName={formatName}
      formatDimensions={formatDimensions}
      backgroundImageUrl={backgroundImageUrl}
      displayWidth={displayWidth}
      displayHeight={displayHeight}
      scale={scale}
      canvas={canvas}
      selectedObject={selectedObject}
      loadingState={loadingState}
      layoutLoadAttempts={layoutLoadAttempts}
      loadingError={loadingError}
      layoutElements={layoutElements}
      onCanvasReady={(fabricCanvas) => handleCanvasReady(fabricCanvas, templateId, formatName)}
      onSelectionChange={setSelectedObject}
      onSaveLayout={handleSaveLayout}
      onDeleteSelected={handleDeleteSelected}
      onBackgroundLoaded={() => handleBackgroundLoaded(templateId, formatName)}
      onAddElement={handleAddElement}
      onManualReload={() => handleManualReload(templateId, formatName)}
    />
  );
};
