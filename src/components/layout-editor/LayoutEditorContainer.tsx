
import React, { useEffect, useRef } from 'react';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useLayoutOperations } from '@/hooks/useLayoutOperations';
import { useCanvasMemoryManager } from '@/hooks/useCanvasMemoryManager';
import { useLayoutEditorPerformance } from '@/hooks/useLayoutEditorPerformance';
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

  // Integrate memory manager
  const {
    registerCanvas,
    unregisterCanvas,
    cleanupCanvas,
    getMemoryStats,
    forceGarbageCollection
  } = useCanvasMemoryManager();

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
    setCanvas: (newCanvas) => {
      // Unregister old canvas
      if (canvas) {
        unregisterCanvas(canvas);
      }
      // Register new canvas
      if (newCanvas) {
        registerCanvas(newCanvas);
      }
      setCanvas(newCanvas);
    },
    setLoadingState,
    incrementLayoutAttempts,
    setLoadingError,
    setLayoutDraft,
    setIsLoadingLayout,
    getLayout
  });

  // Integrate performance optimization
  const {
    addElementPerformant,
    updateElementPerformant,
    removeElementPerformant,
    loadImageOptimized,
    metrics,
    getPerformanceStats,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    cleanup: cleanupPerformance
  } = useLayoutEditorPerformance({
    canvas,
    onLayoutUpdate: updateLayoutDraft,
    onImageLoad: (url) => {
      console.log('🖼️ Image loaded optimally:', url);
    }
  });

  const {
    handleAddElement: originalAddElement,
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

  // Enhanced add element with performance optimization
  const handleAddElement = (elementType: string) => {
    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) return;

    const elementConfig = {
      id: `${elementType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: element.element_type,
      field: element.field_mapping,
      position: { 
        x: 50 + Math.random() * (displayWidth - 300),
        y: 50 + Math.random() * (displayHeight - 200)
      },
      style: { 
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#333333'
      }
    };

    addElementPerformant(elementConfig);
  };

  // Enhanced delete with performance optimization
  const handleDeleteSelectedPerformant = () => {
    if (!selectedObject) return;
    removeElementPerformant(selectedObject);
    setSelectedObject(null);
  };

  console.log('🎨 LayoutEditor render:', {
    templateId,
    formatName,
    loadingState,
    layoutLoadAttempts,
    isLoadingLayout,
    canvasReady: !!canvas,
    layoutDraftSize: layoutDraft.length,
    scale,
    formatDimensions,
    memoryStats: getMemoryStats(),
    performanceStats: canvas ? getPerformanceStats() : null
  });

  // Performance control handlers
  const handleToggleMonitoring = () => {
    if (metrics.renderTime > 0) { // Check if monitoring is active
      stopPerformanceMonitoring();
    } else {
      startPerformanceMonitoring();
    }
  };

  const handleResetPerformance = () => {
    const performanceStats = getPerformanceStats();
    console.log('🔄 Resetting performance metrics:', performanceStats);
  };

  // Fixed: Only reset when template or format actually changes
  useEffect(() => {
    const hasTemplateChanged = previousTemplateRef.current !== templateId;
    const hasFormatChanged = previousFormatRef.current !== formatName;
    
    if (hasTemplateChanged || hasFormatChanged) {
      console.log('🔄 Template or format actually changed, resetting state');
      previousTemplateRef.current = templateId;
      previousFormatRef.current = formatName;
      
      // Clean up previous canvas and performance monitoring
      if (canvas) {
        cleanupCanvas(canvas);
      }
      
      cleanupPerformance();
      resetState();
      forceGarbageCollection();
    }
  }, [templateId, formatName, canvas, cleanupCanvas, resetState, forceGarbageCollection, cleanupPerformance]);

  // Cleanup timeouts and canvas on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (layoutUpdateTimeoutRef.current) {
        clearTimeout(layoutUpdateTimeoutRef.current);
      }
      if (canvas) {
        cleanupCanvas(canvas);
      }
      cleanupPerformance();
    };
  }, [canvas, cleanupCanvas, cleanupPerformance]);

  // Show loading states if needed
  if (elementsLoading || error) {
    return (
      <LayoutEditorLoadingStates 
        elementsLoading={elementsLoading} 
        error={error} 
      />
    );
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
      performanceMetrics={metrics}
      isMonitoring={!!canvas && metrics.renderTime > 0}
      onCanvasReady={(fabricCanvas) => handleCanvasReady(fabricCanvas, templateId, formatName)}
      onSelectionChange={setSelectedObject}
      onSaveLayout={handleSaveLayout}
      onDeleteSelected={handleDeleteSelectedPerformant}
      onBackgroundLoaded={() => handleBackgroundLoaded(templateId, formatName)}
      onAddElement={handleAddElement}
      onManualReload={() => handleManualReload(templateId, formatName)}
      onToggleMonitoring={handleToggleMonitoring}
      onResetPerformance={handleResetPerformance}
    />
  );
};
