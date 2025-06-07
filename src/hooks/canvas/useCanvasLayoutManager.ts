
import { useCallback } from 'react';
import type { Canvas } from 'fabric';
import { toast } from 'sonner';

type FabricCanvas = Canvas;

interface UseCanvasLayoutManagerProps {
  canvasRef: React.MutableRefObject<FabricCanvas | null>;
  layoutLoadAttempts: number;
  isLoadingLayout: boolean;
  loadingState: string;
  setCanvas: (canvas: FabricCanvas | null) => void;
  setLoadingState: (state: any) => void;
  incrementLayoutAttempts: () => void;
  setLoadingError: (error: string | null) => void;
  setIsLoadingLayout: (loading: boolean) => void;
  loadingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const useCanvasLayoutManager = ({
  canvasRef,
  layoutLoadAttempts,
  isLoadingLayout,
  loadingState,
  setCanvas,
  setLoadingState,
  incrementLayoutAttempts,
  setLoadingError,
  setIsLoadingLayout,
  loadingTimeoutRef
}: UseCanvasLayoutManagerProps) => {

  const loadLayoutIfReady = useCallback(async (
    templateId: string, 
    formatName: string,
    loadElements: (canvas: FabricCanvas, templateId: string, formatName: string) => Promise<boolean>
  ) => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || isLoadingLayout || loadingState === 'loading-elements' || loadingState === 'ready') {
      console.log('⏸️ Skipping load - conditions not met:', {
        hasCanvas: !!currentCanvas,
        isLoadingLayout,
        loadingState,
        attempts: layoutLoadAttempts
      });
      return;
    }

    if (layoutLoadAttempts >= 3) {
      console.log('⚠️ Max layout load attempts reached');
      setLoadingError('Máximo de tentativas de carregamento atingido');
      return;
    }

    console.log('🚀 Attempting to load layout elements, attempt:', layoutLoadAttempts + 1);
    incrementLayoutAttempts();
    
    const success = await loadElements(currentCanvas, templateId, formatName);
    if (success && loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [canvasRef, isLoadingLayout, loadingState, layoutLoadAttempts, incrementLayoutAttempts, setLoadingError, loadingTimeoutRef]);

  const handleCanvasReady = useCallback((fabricCanvas: FabricCanvas, templateId: string, formatName: string, loadIfReady: (templateId: string, formatName: string) => void) => {
    console.log('🎨 Canvas ready callback triggered');
    setCanvas(fabricCanvas);
    canvasRef.current = fabricCanvas;
    setLoadingState('initializing');
    
    setTimeout(() => {
      loadIfReady(templateId, formatName);
    }, 100);
  }, [setCanvas, canvasRef, setLoadingState]);

  const handleBackgroundLoaded = useCallback((templateId: string, formatName: string, loadIfReady: (templateId: string, formatName: string) => void) => {
    console.log('🖼️ Background loaded callback triggered');
    setLoadingState('loading-background');
    
    setTimeout(() => {
      loadIfReady(templateId, formatName);
    }, 100);
  }, [setLoadingState]);

  const handleManualReload = useCallback(async (
    templateId: string, 
    formatName: string,
    loadElements: (canvas: FabricCanvas, templateId: string, formatName: string) => Promise<boolean>,
    clearEventListeners: () => void
  ) => {
    if (!canvasRef.current) {
      toast.error('Canvas não está disponível');
      return;
    }
    
    console.log('🔄 Manual reload triggered');
    setIsLoadingLayout(false);
    clearEventListeners();
    setLoadingState('loading-elements');
    await loadElements(canvasRef.current, templateId, formatName);
  }, [canvasRef, setIsLoadingLayout, setLoadingState]);

  return {
    loadLayoutIfReady,
    handleCanvasReady,
    handleBackgroundLoaded,
    handleManualReload
  };
};
