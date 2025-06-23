
import { Canvas } from 'fabric';
import { useState, useCallback } from 'react';

const MAX_HISTORY_LENGTH = 20;

const serializationProperties = [
  'elementId',
  'elementType',
  'fieldMapping',
  'originalWidth',
  'originalHeight',
  'imageUrl',
  'text',
  'isFallback'
];

export interface CanvasHistory {
  undoStack: string[];
  redoStack: string[];
  clear: () => void;
  getCurrentSize: () => number;
  getLastActionTime: () => string | null;
}

export const useCanvasStateHistory = (initialCanvas?: Canvas) => {
  const [history, setHistory] = useState<CanvasHistory>({
    undoStack: [],
    redoStack: [],
    clear: () => {
      setHistory(prev => ({
        ...prev,
        undoStack: [],
        redoStack: []
      }));
    },
    getCurrentSize: () => history.undoStack.length,
    getLastActionTime: () => {
      return history.undoStack.length > 0 ? new Date().toISOString() : null;
    }
  });
  const [canvasInstance, setCanvasInstance] = useState<Canvas | null>(initialCanvas || null);

  const updateCanvasInstance = useCallback((canvas: Canvas) => {
    setCanvasInstance(canvas);
  }, []);

  const saveCanvasState = useCallback((reason?: string) => {
    if (!canvasInstance) return;
    console.log(`Saving canvas state (Reason: ${reason || 'Unknown'})`);
    const canvasJSON = JSON.stringify(canvasInstance.toJSON());

    setHistory((prevHistory) => {
      const newUndoStack = [...prevHistory.undoStack, canvasJSON];
      if (newUndoStack.length > MAX_HISTORY_LENGTH) {
        newUndoStack.shift();
      }
      return {
        ...prevHistory,
        undoStack: newUndoStack,
        redoStack: [],
      };
    });
  }, [canvasInstance, history.undoStack.length]);

  const undo = useCallback(() => {
    if (!canvasInstance || history.undoStack.length === 0) return;

    const lastState = history.undoStack[history.undoStack.length - 1];
    const currentCanvasJSON = JSON.stringify(canvasInstance.toJSON());

    setHistory((prevHistory) => {
      const newUndoStack = prevHistory.undoStack.slice(0, -1);
      return {
        ...prevHistory,
        undoStack: newUndoStack,
        redoStack: [...prevHistory.redoStack, currentCanvasJSON],
      };
    });

    canvasInstance.loadFromJSON(JSON.parse(lastState)).then(() => {
      canvasInstance.renderAll();
      console.log('Undo complete, canvas reloaded.');
    });
  }, [canvasInstance, history.undoStack]);

  const redo = useCallback(() => {
    if (!canvasInstance || history.redoStack.length === 0) return;

    const nextState = history.redoStack[history.redoStack.length - 1];
    const currentCanvasJSON = JSON.stringify(canvasInstance.toJSON());

    setHistory((prevHistory) => {
      const newRedoStack = prevHistory.redoStack.slice(0, -1);
      return {
        ...prevHistory,
        undoStack: [...prevHistory.undoStack, currentCanvasJSON],
        redoStack: newRedoStack,
      };
    });

    canvasInstance.loadFromJSON(JSON.parse(nextState)).then(() => {
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
