
import { useCallback, useRef } from 'react';
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;

interface CanvasOperation {
  id: string;
  type: 'add' | 'update' | 'remove' | 'batch';
  element?: any;
  elements?: any[];
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

export const useCanvasOperations = () => {
  const operationQueue = useRef<CanvasOperation[]>([]);
  const isProcessing = useRef(false);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  const batchOperations = useCallback(async (
    canvas: FabricCanvas,
    operations: CanvasOperation[]
  ) => {
    console.log('🚀 Batching', operations.length, 'canvas operations');

    // Group operations by type for efficient processing
    const addOperations = operations.filter(op => op.type === 'add');
    const updateOperations = operations.filter(op => op.type === 'update');
    const removeOperations = operations.filter(op => op.type === 'remove');

    // Process removes first
    removeOperations.forEach(op => {
      if (op.element) {
        canvas.remove(op.element);
      }
    });

    // Process updates
    updateOperations.forEach(op => {
      if (op.element) {
        op.element.set(op.element.changedProperties || {});
      }
    });

    // Process adds in batch
    if (addOperations.length > 0) {
      const elementsToAdd = addOperations
        .map(op => op.element)
        .filter(Boolean);
      
      // Add multiple elements at once for better performance
      canvas.add(...elementsToAdd);
    }

    // Single render call for all changes
    canvas.renderAll();
    
    console.log('✅ Batch operations completed');
  }, []);

  const processOperationQueue = useCallback(async (canvas: FabricCanvas) => {
    if (isProcessing.current || operationQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    
    try {
      // Sort by priority and timestamp
      const sortedOperations = [...operationQueue.current].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

      // Process high priority operations immediately
      const highPriorityOps = sortedOperations.filter(op => op.priority === 'high');
      const otherOps = sortedOperations.filter(op => op.priority !== 'high');

      if (highPriorityOps.length > 0) {
        await batchOperations(canvas, highPriorityOps);
      }

      // Batch process other operations
      if (otherOps.length > 0) {
        // Use requestIdleCallback for background processing if available
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            batchOperations(canvas, otherOps);
          });
        } else {
          // Fallback to setTimeout for older browsers
          setTimeout(() => {
            batchOperations(canvas, otherOps);
          }, 0);
        }
      }

      // Clear processed operations
      operationQueue.current = [];
      
    } finally {
      isProcessing.current = false;
    }
  }, [batchOperations]);

  const scheduleOperation = useCallback((
    canvas: FabricCanvas,
    operation: Omit<CanvasOperation, 'id' | 'timestamp'>
  ) => {
    const newOperation: CanvasOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    operationQueue.current.push(newOperation);

    // Clear existing timeout
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    // Schedule processing based on priority
    const delay = operation.priority === 'high' ? 0 : 50;
    
    batchTimeout.current = setTimeout(() => {
      processOperationQueue(canvas);
    }, delay);

    console.log('📝 Scheduled canvas operation:', operation.type, 'Priority:', operation.priority);
  }, [processOperationQueue]);

  const addElement = useCallback((canvas: FabricCanvas, element: any, priority: 'high' | 'medium' | 'low' = 'medium') => {
    scheduleOperation(canvas, {
      type: 'add',
      element,
      priority
    });
  }, [scheduleOperation]);

  const updateElement = useCallback((canvas: FabricCanvas, element: any, priority: 'high' | 'medium' | 'low' = 'medium') => {
    scheduleOperation(canvas, {
      type: 'update',
      element,
      priority
    });
  }, [scheduleOperation]);

  const removeElement = useCallback((canvas: FabricCanvas, element: any, priority: 'high' | 'medium' | 'low' = 'high') => {
    scheduleOperation(canvas, {
      type: 'remove',
      element,
      priority
    });
  }, [scheduleOperation]);

  const addMultipleElements = useCallback((canvas: FabricCanvas, elements: any[], priority: 'high' | 'medium' | 'low' = 'low') => {
    scheduleOperation(canvas, {
      type: 'batch',
      elements,
      priority
    });
  }, [scheduleOperation]);

  const clearQueue = useCallback(() => {
    operationQueue.current = [];
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
      batchTimeout.current = null;
    }
    isProcessing.current = false;
    console.log('🧹 Canvas operation queue cleared');
  }, []);

  const getQueueStats = useCallback(() => {
    return {
      queueLength: operationQueue.current.length,
      isProcessing: isProcessing.current,
      highPriorityCount: operationQueue.current.filter(op => op.priority === 'high').length,
      mediumPriorityCount: operationQueue.current.filter(op => op.priority === 'medium').length,
      lowPriorityCount: operationQueue.current.filter(op => op.priority === 'low').length
    };
  }, []);

  return {
    addElement,
    updateElement,
    removeElement,
    addMultipleElements,
    clearQueue,
    getQueueStats,
    processOperationQueue: (canvas: FabricCanvas) => processOperationQueue(canvas)
  };
};
