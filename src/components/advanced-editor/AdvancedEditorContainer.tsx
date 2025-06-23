
import React, { useEffect, useRef } from 'react';
import { useAdvancedLayoutEditor } from '@/hooks/useAdvancedLayoutEditor';
import { useLayoutEditorState } from '@/hooks/useLayoutEditorState';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useCanvasMemoryManager } from '@/hooks/useCanvasMemoryManager';
import { useLayoutEditorPerformance } from '@/hooks/useLayoutEditorPerformance';
import { useCanvasStateHistory } from '@/hooks/useCanvasStateHistory';
import { AdvancedEditorContent } from './AdvancedEditorContent';
import { AdvancedEditorLoadingStates } from './AdvancedEditorLoadingStates';

interface AdvancedEditorContainerProps {
  templateId: string;
  formatName: string;
  backgroundImageUrl: string;
  formatDimensions: { width: number; height: number };
  onSave: (layoutData: any) => void;
}

// Define the Advanced Layout Element interface specifically for this editor
interface AdvancedLayoutElement {
  id: string;
  name: string;
  element_type: string;
  field_mapping: string;
  default_style?: any;
}

export const AdvancedEditorContainer: React.FC<AdvancedEditorContainerProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  onSave
}) => {
  const { layoutElements, saveAdvancedLayout, getAdvancedLayout, loading: elementsLoading, error } = useAdvancedLayoutEditor();
  
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

  // Enhanced memory management for advanced editor
  const {
    registerCanvas,
    unregisterCanvas,
    cleanupCanvas,
    getMemoryStats,
    forceGarbageCollection
  } = useCanvasMemoryManager();

  // Advanced undo/redo system
  const {
    history,
    saveCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
    updateCanvasInstance
  } = useCanvasStateHistory(canvas);

  // Track previous values to prevent unnecessary resets
  const previousTemplateRef = useRef<string | null>(null);
  const previousFormatRef = useRef<string | null>(null);

  const maxCanvasWidth = 900;
  const maxCanvasHeight = 700;
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
      if (canvas) {
        unregisterCanvas(canvas);
      }
      if (newCanvas) {
        registerCanvas(newCanvas);
        updateCanvasInstance(newCanvas);
      }
      setCanvas(newCanvas);
    },
    setLoadingState,
    incrementLayoutAttempts,
    setLoadingError,
    setLayoutDraft,
    setIsLoadingLayout,
    getLayout: getAdvancedLayout
  });

  // Performance monitoring with advanced features
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
      console.log('🖼️ Advanced Editor - Image loaded optimally:', url);
    }
  });

  // Enhanced add element with undo/redo support
  const handleAddElement = (elementType: string) => {
    const element = layoutElements.find(el => el.field_mapping === elementType) as AdvancedLayoutElement;
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

    // Save state before modification
    saveCanvasState('Add Element');
    addElementPerformant(elementConfig);
  };

  // Enhanced delete with undo/redo support
  const handleDeleteSelectedAdvanced = () => {
    if (!selectedObject) return;
    
    // Save state before modification
    saveCanvasState('Delete Element');
    removeElementPerformant(selectedObject);
    setSelectedObject(null);
  };

  // Enhanced save with advanced features
  const handleSaveAdvancedLayout = async () => {
    try {
      await saveAdvancedLayout(templateId, formatName, layoutDraft);
      // Clear undo history after successful save
      history.clear();
      console.log('Advanced layout saved successfully');
    } catch (error) {
      console.error('Error saving advanced layout:', error);
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (canUndo) {
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
    }
  };

  // Helper function to get history stats
  const getHistoryStats = () => {
    return {
      currentSize: history.getCurrentSize(),
      maxSize: 20,
      lastActionTime: history.getLastActionTime()
    };
  };

  console.log('🎨 Advanced Editor render:', {
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
    performanceStats: canvas ? getPerformanceStats() : null,
    historyStats: getHistoryStats(),
    canUndo,
    canRedo
  });

  // Reset when template or format changes
  useEffect(() => {
    const hasTemplateChanged = previousTemplateRef.current !== templateId;
    const hasFormatChanged = previousFormatRef.current !== formatName;
    
    if (hasTemplateChanged || hasFormatChanged) {
      console.log('🔄 Advanced Editor - Template or format changed, resetting state');
      previousTemplateRef.current = templateId;
      previousFormatRef.current = formatName;
      
      if (canvas) {
        cleanupCanvas(canvas);
      }
      
      cleanupPerformance();
      history.clear();
      resetState();
      forceGarbageCollection();
    }
  }, [templateId, formatName, canvas, cleanupCanvas, resetState, forceGarbageCollection, cleanupPerformance, history]);

  // Cleanup on unmount
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
      history.clear();
    };
  }, [canvas, cleanupCanvas, cleanupPerformance, history]);

  // Show loading states if needed
  if (elementsLoading || error) {
    return (
      <AdvancedEditorLoadingStates 
        elementsLoading={elementsLoading} 
        error={error} 
      />
    );
  }

  return (
    <AdvancedEditorContent
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
      layoutElements={layoutElements as AdvancedLayoutElement[]}
      performanceMetrics={metrics}
      isMonitoring={!!canvas && metrics.renderTime > 0}
      canUndo={canUndo}
      canRedo={canRedo}
      historyStats={getHistoryStats()}
      onCanvasReady={(fabricCanvas) => handleCanvasReady(fabricCanvas, templateId, formatName)}
      onSelectionChange={setSelectedObject}
      onSaveLayout={handleSaveAdvancedLayout}
      onDeleteSelected={handleDeleteSelectedAdvanced}
      onBackgroundLoaded={() => handleBackgroundLoaded(templateId, formatName)}
      onAddElement={handleAddElement}
      onManualReload={() => handleManualReload(templateId, formatName)}
      onToggleMonitoring={() => {
        if (metrics.renderTime > 0) {
          stopPerformanceMonitoring();
        } else {
          startPerformanceMonitoring();
        }
      }}
      onResetPerformance={() => {
        const performanceStats = getPerformanceStats();
        console.log('🔄 Advanced Editor - Resetting performance metrics:', performanceStats);
      }}
      onUndo={handleUndo}
      onRedo={handleRedo}
      onSaveState={() => saveCanvasState('Manual Save State')}
    />
  );
};
