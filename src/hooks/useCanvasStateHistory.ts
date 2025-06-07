import { fabric } from 'fabric';
import { useState, useCallback } from 'react';

const MAX_HISTORY_LENGTH = 20;

// Define properties to include in canvas.toJSON()
const serializationProperties = [
  'elementId',
  'elementType',
  'fieldMapping',
  'originalWidth',
  'originalHeight',
  'imageUrl', // For images
  'text', // For text objects (actual text content if needed for history)
  'isFallback' // For image fallbacks
  // Add any other custom properties you've set on objects that need to be preserved
];

export interface CanvasHistory {
  undoStack: string[];
  redoStack: string[];
}

export const useCanvasStateHistory = (initialCanvas?: fabric.Canvas) => {
  const [history, setHistory] = useState<CanvasHistory>({
    undoStack: [],
    redoStack: [],
  });
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(initialCanvas || null);

  const updateCanvasInstance = useCallback((canvas: fabric.Canvas) => {
    setCanvasInstance(canvas);
  }, []);

  const saveCanvasState = useCallback((reason?: string) => {
    if (!canvasInstance) return;
    console.log(`Saving canvas state (Reason: ${reason || 'Unknown'})`);
    const canvasJSON = JSON.stringify(canvasInstance.toJSON(serializationProperties));

    setHistory((prevHistory) => {
      const newUndoStack = [...prevHistory.undoStack, canvasJSON];
      if (newUndoStack.length > MAX_HISTORY_LENGTH) {
        newUndoStack.shift(); // Remove the oldest state
      }
      return {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack on new save
      };
    });
  }, [canvasInstance]);

  const undo = useCallback(() => {
    if (!canvasInstance || history.undoStack.length === 0) return;

    const lastState = history.undoStack[history.undoStack.length - 1];
    const currentCanvasJSON = JSON.stringify(canvasInstance.toJSON(serializationProperties));

    setHistory((prevHistory) => {
      const newUndoStack = prevHistory.undoStack.slice(0, -1);
      return {
        undoStack: newUndoStack,
        redoStack: [...prevHistory.redoStack, currentCanvasJSON],
      };
    });

    canvasInstance.loadFromJSON(JSON.parse(lastState), () => {
      canvasInstance.renderAll();
      console.log('Undo complete, canvas reloaded.');
    });
  }, [canvasInstance, history.undoStack]);

  const redo = useCallback(() => {
    if (!canvasInstance || history.redoStack.length === 0) return;

    const nextState = history.redoStack[history.redoStack.length - 1];
    const currentCanvasJSON = JSON.stringify(canvasInstance.toJSON(serializationProperties));

    setHistory((prevHistory) => {
      const newRedoStack = prevHistory.redoStack.slice(0, -1);
      return {
        undoStack: [...prevHistory.undoStack, currentCanvasJSON],
        redoStack: newRedoStack,
      };
    });

    canvasInstance.loadFromJSON(JSON.parse(nextState), () => {
      canvasInstance.renderAll();
      console.log('Redo complete, canvas reloaded.');
    });
  }, [canvasInstance, history.redoStack]);

  return {
    history,
    saveCanvasState,
    undo,
    redo,
    canUndo: history.undoStack.length > 0,
    canRedo: history.redoStack.length > 0,
    updateCanvasInstance
  };
};
