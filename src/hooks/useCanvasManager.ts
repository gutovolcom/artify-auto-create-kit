
import { useEffect } from 'react';
import * as fabric from 'fabric';
import { toast } from 'sonner';
import { addElementToCanvas } from '@/components/layout-editor/canvasOperations';

type FabricCanvas = fabric.Canvas;

interface UseCanvasManagerProps {
  canvas: FabricCanvas | null;
  canvasRef: React.MutableRefObject<FabricCanvas | null>;
  loadingState: string;
  layoutLoadAttempts: number;
  loadingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  setCanvas: (canvas: FabricCanvas | null) => void;
  setLoadingState: (state: any) => void;
  setLayoutLoadAttempts: (fn: (prev: number) => number) => void;
  setLoadingError: (error: string | null) => void;
  getLayout: (templateId: string, formatName: string) => Promise<any>;
}

export const useCanvasManager = ({
  canvas,
  canvasRef,
  loadingState,
  layoutLoadAttempts,
  loadingTimeoutRef,
  displayWidth,
  displayHeight,
  scale,
  setCanvas,
  setLoadingState,
  setLayoutLoadAttempts,
  setLoadingError,
  getLayout
}: UseCanvasManagerProps) => {

  const addDefaultLayoutElements = (fabricCanvas: FabricCanvas) => {
    console.log('Adding default layout elements to canvas');
    
    const defaultElements = [
      {
        id: 'title',
        type: 'text',
        field: 'title',
        position: { x: 50, y: 50 },
        style: { fontSize: 24, fontFamily: 'Arial', color: '#333333' }
      },
      {
        id: 'classTheme',
        type: 'text',
        field: 'classTheme',
        position: { x: 50, y: 150 },
        style: { fontSize: 20, fontFamily: 'Arial', color: '#333333' }
      },
      {
        id: 'teacherName',
        type: 'text',
        field: 'teacherName',
        position: { x: 50, y: 250 },
        style: { fontSize: 18, fontFamily: 'Arial', color: '#333333' }
      },
      {
        id: 'date',
        type: 'text',
        field: 'date',
        position: { x: 50, y: 320 },
        style: { fontSize: 16, fontFamily: 'Arial', color: '#333333' }
      },
      {
        id: 'time',
        type: 'text',
        field: 'time',
        position: { x: 200, y: 320 },
        style: { fontSize: 16, fontFamily: 'Arial', color: '#333333' }
      },
      {
        id: 'teacherImages',
        type: 'image',
        field: 'teacherImages',
        position: { x: displayWidth - 250, y: displayHeight - 250 },
        style: { width: 200, height: 200 }
      }
    ];

    defaultElements.forEach(element => {
      addElementToCanvas(fabricCanvas, element, scale);
    });
  };

  const clearCanvasObjects = (fabricCanvas: FabricCanvas) => {
    console.log('Clearing canvas objects');
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      fabricCanvas.remove(obj);
    });
    fabricCanvas.renderAll();
  };

  const loadLayoutElements = async (fabricCanvas: FabricCanvas, templateId: string, formatName: string) => {
    if (!fabricCanvas) {
      console.warn('Cannot load layout: canvas not available');
      return false;
    }

    console.log('Loading layout elements for template:', templateId, 'format:', formatName);
    setLoadingState('loading-elements');
    setLoadingError(null);
    
    try {
      // Clear existing objects first
      clearCanvasObjects(fabricCanvas);
      
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements && existingLayout.layout_config.elements.length > 0) {
        console.log('Loading existing layout elements:', existingLayout.layout_config.elements.length, 'elements');
        
        // Deduplicate elements by field before adding to canvas
        const uniqueElements = new Map();
        existingLayout.layout_config.elements.forEach((element: any) => {
          uniqueElements.set(element.field, element);
        });
        
        const elementsToLoad = Array.from(uniqueElements.values());
        console.log('After deduplication:', elementsToLoad.length, 'unique elements');
        
        elementsToLoad.forEach((element: any) => {
          const elementConfig = {
            id: element.id,
            type: element.type,
            field: element.field,
            position: element.position,
            style: {
              fontSize: element.style?.fontSize || 24,
              fontFamily: element.style?.fontFamily || 'Arial',
              color: element.style?.color || '#333333',
              width: element.size?.width || element.style?.width,
              height: element.size?.height || element.style?.height,
              ...element.style
            }
          };
          console.log('Adding element from saved layout:', elementConfig.field, 'at position:', elementConfig.position);
          addElementToCanvas(fabricCanvas, elementConfig, scale);
        });
        
        console.log('Successfully loaded', elementsToLoad.length, 'elements from saved layout');
        toast.success(`Layout carregado: ${elementsToLoad.length} elementos`);
      } else {
        console.log('No existing layout found, adding default elements');
        addDefaultLayoutElements(fabricCanvas);
        toast.info('Layout padrão aplicado');
      }
      
      setLoadingState('ready');
      return true;
    } catch (error) {
      console.error('Error loading layout:', error);
      setLoadingError(`Erro ao carregar layout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Fallback to default layout
      console.log('Falling back to default layout');
      addDefaultLayoutElements(fabricCanvas);
      setLoadingState('ready');
      toast.error('Erro ao carregar layout salvo, usando layout padrão');
      return false;
    }
  };

  const loadLayoutIfReady = async (templateId: string, formatName: string) => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || loadingState === 'loading-elements' || loadingState === 'ready') {
      console.log('Skipping load - conditions not met:', {
        hasCanvas: !!currentCanvas,
        loadingState,
        attempts: layoutLoadAttempts
      });
      return;
    }

    console.log('Attempting to load layout elements, attempt:', layoutLoadAttempts + 1);
    setLayoutLoadAttempts(prev => prev + 1);
    
    const success = await loadLayoutElements(currentCanvas, templateId, formatName);
    if (success) {
      // Clear any pending timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  };

  const handleCanvasReady = (fabricCanvas: FabricCanvas, templateId: string, formatName: string) => {
    console.log('Canvas ready callback triggered');
    setCanvas(fabricCanvas);
    canvasRef.current = fabricCanvas;
    setLoadingState('initializing');
    
    // Try to load elements immediately when canvas is ready
    setTimeout(() => {
      loadLayoutIfReady(templateId, formatName);
    }, 100);
  };

  const handleBackgroundLoaded = (templateId: string, formatName: string) => {
    console.log('Background loaded callback triggered');
    setLoadingState('loading-background');
    
    // Try to load elements when background is ready
    setTimeout(() => {
      loadLayoutIfReady(templateId, formatName);
    }, 100);
  };

  const handleManualReload = async (templateId: string, formatName: string) => {
    if (!canvasRef.current) {
      toast.error('Canvas não está disponível');
      return;
    }
    
    console.log('Manual reload triggered');
    setLayoutLoadAttempts(0);
    setLoadingState('loading-elements');
    await loadLayoutElements(canvasRef.current, templateId, formatName);
  };

  // Set up fallback timeout for loading elements
  useEffect(() => {
    if (canvas && loadingState !== 'ready' && layoutLoadAttempts < 3) {
      // Set up a timeout to load elements even if background doesn't load
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Timeout triggered for loading elements');
        // Note: We can't call loadLayoutIfReady here without templateId/formatName
        // This will be handled by the parent component
      }, 2000); // 2 second timeout
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [canvas, loadingState, layoutLoadAttempts]);

  return {
    handleCanvasReady,
    handleBackgroundLoaded,
    handleManualReload,
    loadLayoutIfReady
  };
};
