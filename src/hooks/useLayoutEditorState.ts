
import { useState, useRef } from 'react';
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;
type LoadingState = 'idle' | 'initializing' | 'loading-background' | 'loading-elements' | 'ready' | 'error';

export const useLayoutEditorState = () => {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [layoutLoadAttempts, setLayoutLoadAttempts] = useState(0);
  const [layoutDraft, setLayoutDraft] = useState<any[]>([]);
  const [isLoadingLayout, setIsLoadingLayout] = useState(false); // Prevent concurrent loads

  // Refs to store latest callbacks and prevent stale closures
  const canvasRef = useRef<FabricCanvas | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced layout draft update to prevent excessive state changes
  const debouncedSetLayoutDraft = (draft: any[]) => {
    if (layoutUpdateTimeoutRef.current) {
      clearTimeout(layoutUpdateTimeoutRef.current);
    }
    
    layoutUpdateTimeoutRef.current = setTimeout(() => {
      setLayoutDraft(draft);
      console.log('📝 Layout draft updated (debounced):', draft.length, 'elements');
    }, 150); // 150ms debounce
  };

  const resetState = () => {
    console.log('🔄 Resetting layout editor state');
    setLoadingState('idle');
    setLayoutLoadAttempts(0);
    setLoadingError(null);
    setLayoutDraft([]);
    setIsLoadingLayout(false);
    canvasRef.current = null;
    
    // Clear all timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (layoutUpdateTimeoutRef.current) {
      clearTimeout(layoutUpdateTimeoutRef.current);
      layoutUpdateTimeoutRef.current = null;
    }
  };

  const safeSetLoadingState = (newState: LoadingState) => {
    console.log(`🔄 Loading state: ${loadingState} → ${newState}`);
    setLoadingState(newState);
  };

  const incrementLayoutAttempts = () => {
    setLayoutLoadAttempts(prev => {
      const newCount = prev + 1;
      console.log(`🔄 Layout load attempt: ${newCount}`);
      return newCount;
    });
  };

  return {
    canvas,
    setCanvas,
    selectedObject,
    setSelectedObject,
    loadingState,
    setLoadingState: safeSetLoadingState,
    loadingError,
    setLoadingError,
    layoutLoadAttempts,
    setLayoutLoadAttempts,
    incrementLayoutAttempts,
    layoutDraft,
    setLayoutDraft: debouncedSetLayoutDraft,
    isLoadingLayout,
    setIsLoadingLayout,
    canvasRef,
    loadingTimeoutRef,
    layoutUpdateTimeoutRef,
    resetState
  };
};
