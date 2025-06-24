
import { useState, useRef, useCallback } from 'react';
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
  const [isLoadingLayout, setIsLoadingLayout] = useState(false);
  const [deletedElementsSession, setDeletedElementsSession] = useState<Set<string>>(new Set());

  // Refs to store latest callbacks and prevent stale closures
  const canvasRef = useRef<FabricCanvas | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const layoutUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track deleted elements to prevent auto-restoration
  const addDeletedElement = useCallback((elementId: string) => {
    setDeletedElementsSession(prev => new Set([...prev, elementId]));
    console.log('🗑️ Element marked as deleted:', elementId);
  }, []);

  const isElementDeleted = useCallback((elementId: string) => {
    return deletedElementsSession.has(elementId);
  }, [deletedElementsSession]);

  const clearDeletedElements = useCallback(() => {
    setDeletedElementsSession(new Set());
    console.log('🧹 Cleared deleted elements session');
  }, []);

  // Immediate layout draft update - no debounce to prevent loss during resets
  const setLayoutDraftImmediate = useCallback((draft: any[]) => {
    // Filter out deleted elements from the draft
    const filteredDraft = draft.filter(element => !isElementDeleted(element.id));
    console.log('📝 Layout draft updated immediately:', filteredDraft.length, 'elements (filtered from', draft.length, ')');
    setLayoutDraft(filteredDraft);
    
    // Also persist to sessionStorage as backup
    try {
      sessionStorage.setItem('layoutDraft', JSON.stringify(filteredDraft));
      sessionStorage.setItem('deletedElements', JSON.stringify([...deletedElementsSession]));
    } catch (error) {
      console.warn('Failed to persist layout draft:', error);
    }
  }, [isElementDeleted, deletedElementsSession]);

  // Memoized resetState to prevent recreation and infinite loops
  const resetState = useCallback(() => {
    console.log('🔄 Resetting layout editor state');
    setLoadingState('idle');
    setLayoutLoadAttempts(0);
    setLoadingError(null);
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

    // Try to restore from sessionStorage if available
    try {
      const stored = sessionStorage.getItem('layoutDraft');
      const storedDeleted = sessionStorage.getItem('deletedElements');
      
      if (storedDeleted) {
        const deletedArray = JSON.parse(storedDeleted);
        setDeletedElementsSession(new Set(deletedArray));
        console.log('🔄 Restored deleted elements from storage:', deletedArray.length);
      }
      
      if (stored) {
        const restoredDraft = JSON.parse(stored);
        console.log('🔄 Restored layout draft from storage:', restoredDraft.length, 'elements');
        setLayoutDraft(restoredDraft);
        return;
      }
    } catch (error) {
      console.warn('Failed to restore layout draft:', error);
    }
    
    // Only clear draft if no stored version available
    setLayoutDraft([]);
    setDeletedElementsSession(new Set());
  }, []); // No dependencies to prevent recreation

  const safeSetLoadingState = useCallback((newState: LoadingState) => {
    console.log(`🔄 Loading state: ${loadingState} → ${newState}`);
    setLoadingState(newState);
  }, [loadingState]);

  const incrementLayoutAttempts = useCallback(() => {
    setLayoutLoadAttempts(prev => {
      const newCount = prev + 1;
      console.log(`🔄 Layout load attempt: ${newCount}`);
      return newCount;
    });
  }, []);

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
    setLayoutDraft: setLayoutDraftImmediate,
    isLoadingLayout,
    setIsLoadingLayout,
    canvasRef,
    loadingTimeoutRef,
    layoutUpdateTimeoutRef,
    resetState,
    addDeletedElement,
    isElementDeleted,
    clearDeletedElements,
    deletedElementsSession
  };
};
