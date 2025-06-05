
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

  // Refs to store latest callbacks and prevent stale closures
  const canvasRef = useRef<FabricCanvas | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetState = () => {
    console.log('Resetting layout editor state');
    setLoadingState('idle');
    setLayoutLoadAttempts(0);
    setLoadingError(null);
    canvasRef.current = null;
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  return {
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
  };
};
