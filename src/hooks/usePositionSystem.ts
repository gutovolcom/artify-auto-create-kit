import { useRef, useEffect, useCallback } from 'react';
import { LayoutManager } from '@/utils/positioning/LayoutManager';
import { NormalizedPosition, NormalizedElement, FormatDimensions } from '@/utils/positioning/PositionSystem';

// Hook to use the position system
export const usePositionSystem = (
  formatDimensions: FormatDimensions,
  scale: number
) => {
  const layoutManagerRef = useRef<LayoutManager | null>(null);
  
  // Initialize layout manager
  useEffect(() => {
    layoutManagerRef.current = new LayoutManager(formatDimensions, scale);
    console.log('🎯 PositionSystem initialized:', { formatDimensions, scale });
  }, [formatDimensions, scale]);

  const addElement = useCallback((element: Omit<NormalizedElement, 'id'>) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return null;
    }
    
    const elementWithId: NormalizedElement = {
      ...element,
      id: `${element.field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    layoutManagerRef.current.addElement(elementWithId);
    console.log('➕ Element added to position system:', elementWithId);
    return elementWithId.id;
  }, []);

  const updateElementPosition = useCallback((elementId: string, position: NormalizedPosition) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return;
    }
    layoutManagerRef.current.updateElementPosition(elementId, position);
    console.log('📍 Element position updated:', { elementId, position });
  }, []);

  const updateFromCanvas = useCallback((fabricObject: any) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return;
    }
    layoutManagerRef.current.updateFromCanvas(fabricObject);
    console.log('🎨 Element updated from canvas:', fabricObject.elementId);
  }, []);

  const serializeLayout = useCallback(() => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return [];
    }
    const serialized = layoutManagerRef.current.serializeLayout();
    console.log('💾 Layout serialized:', serialized);
    return serialized;
  }, []);

  const deserializeLayout = useCallback((layoutData: any[]) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return;
    }
    layoutManagerRef.current.deserializeLayout(layoutData);
    console.log('📂 Layout deserialized:', layoutData);
  }, []);

  const getElementForCanvas = useCallback((elementId: string) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return null;
    }
    return layoutManagerRef.current.getElementForCanvas(elementId);
  }, []);

  const getElementForGeneration = useCallback((elementId: string) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return null;
    }
    return layoutManagerRef.current.getElementForGeneration(elementId);
  }, []);

  const getAllElements = useCallback(() => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return [];
    }
    return layoutManagerRef.current.getAllElements();
  }, []);

  const getElement = useCallback((elementId: string) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return undefined;
    }
    return layoutManagerRef.current.getElement(elementId);
  }, []);

  const removeElement = useCallback((elementId: string) => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return;
    }
    layoutManagerRef.current.removeElement(elementId);
    console.log('🗑️ Element removed:', elementId);
  }, []);

  const clear = useCallback(() => {
    if (!layoutManagerRef.current) {
      console.error('LayoutManager not initialized');
      return;
    }
    layoutManagerRef.current.clear();
    console.log('🧹 All elements cleared');
  }, []);

  return {
    addElement,
    updateElementPosition,
    updateFromCanvas,
    serializeLayout,
    deserializeLayout,
    getElementForCanvas,
    getElementForGeneration,
    getAllElements,
    getElement,
    removeElement,
    clear,
    layoutManager: layoutManagerRef.current,
    isReady: layoutManagerRef.current !== null
  };
}; 