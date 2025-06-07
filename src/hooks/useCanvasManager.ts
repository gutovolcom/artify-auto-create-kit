
import { useEffect } from 'react';
import type { Canvas } from 'fabric';
import { useCanvasEventHandlers } from './canvas/useCanvasEventHandlers';
import { useCanvasElementLoader } from './canvas/useCanvasElementLoader';
import { useCanvasLayoutManager } from './canvas/useCanvasLayoutManager';

type FabricCanvas = Canvas;

interface UseCanvasManagerProps {
  canvas: FabricCanvas | null;
  canvasRef: React.MutableRefObject<FabricCanvas | null>;
  loadingState: string;
  layoutLoadAttempts: number;
  isLoadingLayout: boolean;
  loadingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  layoutUpdateTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  layoutDraft: any[];
  setCanvas: (canvas: FabricCanvas | null) => void;
  setLoadingState: (state: any) => void;
  incrementLayoutAttempts: () => void;
  setLoadingError: (error: string | null) => void;
  setLayoutDraft: (draft: any[]) => void;
  setIsLoadingLayout: (loading: boolean) => void;
  getLayout: (templateId: string, formatName: string) => Promise<any>;
}

export const useCanvasManager = (props: UseCanvasManagerProps) => {
  const {
    canvas,
    loadingState,
    isLoadingLayout,
    layoutLoadAttempts,
    loadingTimeoutRef
  } = props;

  const { setupCanvasEventListeners, updateLayoutDraft, clearEventListeners } = useCanvasEventHandlers({
    scale: props.scale,
    setLayoutDraft: props.setLayoutDraft
  });

  const { loadLayoutElements } = useCanvasElementLoader({
    displayWidth: props.displayWidth,
    displayHeight: props.displayHeight,
    scale: props.scale,
    setIsLoadingLayout: props.setIsLoadingLayout,
    setLoadingState: props.setLoadingState,
    setLoadingError: props.setLoadingError,
    getLayout: props.getLayout
  });

  const { 
    loadLayoutIfReady, 
    handleCanvasReady, 
    handleBackgroundLoaded, 
    handleManualReload 
  } = useCanvasLayoutManager({
    canvasRef: props.canvasRef,
    layoutLoadAttempts: props.layoutLoadAttempts,
    isLoadingLayout: props.isLoadingLayout,
    loadingState: props.loadingState,
    setCanvas: props.setCanvas,
    setLoadingState: props.setLoadingState,
    incrementLayoutAttempts: props.incrementLayoutAttempts,
    setLoadingError: props.setLoadingError,
    setIsLoadingLayout: props.setIsLoadingLayout,
    loadingTimeoutRef: props.loadingTimeoutRef
  });

  // Enhanced loadLayoutElements wrapper that includes event listeners
  const loadLayoutElementsWithListeners = async (fabricCanvas: FabricCanvas, templateId: string, formatName: string) => {
    return loadLayoutElements(
      fabricCanvas, 
      templateId, 
      formatName, 
      setupCanvasEventListeners, 
      updateLayoutDraft,
      isLoadingLayout
    );
  };

  // Wrapper for loadLayoutIfReady
  const loadLayoutIfReadyWrapper = (templateId: string, formatName: string) => {
    loadLayoutIfReady(templateId, formatName, loadLayoutElementsWithListeners);
  };

  useEffect(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (canvas && loadingState !== 'ready' && !isLoadingLayout && layoutLoadAttempts < 3) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Timeout triggered for loading elements');
      }, 3000);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [canvas, loadingState, isLoadingLayout]);

  return {
    handleCanvasReady: (fabricCanvas: FabricCanvas, templateId: string, formatName: string) => 
      handleCanvasReady(fabricCanvas, templateId, formatName, loadLayoutIfReadyWrapper),
    handleBackgroundLoaded: (templateId: string, formatName: string) => 
      handleBackgroundLoaded(templateId, formatName, loadLayoutIfReadyWrapper),
    handleManualReload: (templateId: string, formatName: string) => 
      handleManualReload(templateId, formatName, loadLayoutElementsWithListeners, clearEventListeners),
    loadLayoutIfReady: loadLayoutIfReadyWrapper,
    updateLayoutDraft
  };
};
