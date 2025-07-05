import React, { useRef, useEffect, useCallback } from 'react';
import { LayoutManager } from '../utils/positioning/LayoutManager';
import { NormalizedPosition, NormalizedElement, FormatDimensions } from '../utils/positioning/PositionSystem';

// Hook to use the position system
export const usePositionSystem = (
  formatDimensions: FormatDimensions,
  scale: number
) => {
  const layoutManagerRef = useRef<LayoutManager | null>(null);
  
  // Initialize layout manager
  useEffect(() => {
    layoutManagerRef.current = new LayoutManager(formatDimensions, scale);
  }, [formatDimensions, scale]);

  const addElement = useCallback((element: Omit<NormalizedElement, 'id'>) => {
    if (!layoutManagerRef.current) return;
    
    const elementWithId: NormalizedElement = {
      ...element,
      id: `${element.field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    layoutManagerRef.current.addElement(elementWithId);
    return elementWithId.id;
  }, []);

  const updateElementPosition = useCallback((elementId: string, position: NormalizedPosition) => {
    if (!layoutManagerRef.current) return;
    layoutManagerRef.current.updateElementPosition(elementId, position);
  }, []);

  const updateFromCanvas = useCallback((fabricObject: any) => {
    if (!layoutManagerRef.current) return;
    layoutManagerRef.current.updateFromCanvas(fabricObject);
  }, []);

  const serializeLayout = useCallback(() => {
    if (!layoutManagerRef.current) return [];
    return layoutManagerRef.current.serializeLayout();
  }, []);

  const deserializeLayout = useCallback((layoutData: any[]) => {
    if (!layoutManagerRef.current) return;
    layoutManagerRef.current.deserializeLayout(layoutData);
  }, []);

  const getElementForCanvas = useCallback((elementId: string) => {
    if (!layoutManagerRef.current) return null;
    return layoutManagerRef.current.getElementForCanvas(elementId);
  }, []);

  const getElementForGeneration = useCallback((elementId: string) => {
    if (!layoutManagerRef.current) return null;
    return layoutManagerRef.current.getElementForGeneration(elementId);
  }, []);

  return {
    addElement,
    updateElementPosition,
    updateFromCanvas,
    serializeLayout,
    deserializeLayout,
    getElementForCanvas,
    getElementForGeneration,
    layoutManager: layoutManagerRef.current
  };
}; 