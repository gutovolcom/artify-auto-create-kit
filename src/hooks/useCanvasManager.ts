
import { useEffect, useCallback, useRef } from 'react';
import * as fabric from 'fabric';
import { toast } from 'sonner';
import { addElementToCanvas } from '@/components/layout-editor/elementManager';
import { serializeCanvasLayout } from '@/components/layout-editor/layoutSerializer';
import { constrainToCanvas } from '@/utils/positionValidation';

type FabricCanvas = fabric.Canvas;

interface UseCanvasManagerProps {
  canvas: FabricCanvas | null;
  canvasRef: React.MutableRefObject<FabricCanvas | null>;
  loadingState: string;
  layoutLoadAttempts: number;
  isLoadingLayout: boolean;
  loadingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  layoutUpdateTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  layoutDraft: any[];
  setCanvas: (canvas: FabricCanvas | null) => void;
  setLoadingState: (state: any) => void;
  incrementLayoutAttempts: () => void;
  setLoadingError: (error: string | null) => void;
  setLayoutDraft: (draft: any[]) => void;
  setIsLoadingLayout: (loading: boolean) => void;
  getLayout: (templateId: string, formatName: string) => Promise<any>;
}

export const useCanvasManager = ({
  canvas,
  canvasRef,
  loadingState,
  layoutLoadAttempts,
  isLoadingLayout,
  loadingTimeoutRef,
  layoutUpdateTimeoutRef,
  displayWidth,
  displayHeight,
  scale,
  layoutDraft,
  setCanvas,
  setLoadingState,
  incrementLayoutAttempts,
  setLoadingError,
  setLayoutDraft,
  setIsLoadingLayout,
  getLayout
}: UseCanvasManagerProps) => {

  // Store event listeners in refs to prevent loss during resets
  const eventListenersAttachedRef = useRef(false);

  // Immediate layout draft update - no debounce
  const updateLayoutDraft = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    const elements = serializeCanvasLayout(fabricCanvas, scale, format);
    setLayoutDraft(elements);
    console.log("📝 Layout updated immediately with boundary validation for format:", format, elements.length, "elements");
  }, [scale, setLayoutDraft]);

  // Enhanced boundary-aware element event handlers with persistence protection
  const setupCanvasEventListeners = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    // Prevent duplicate event listeners
    if (eventListenersAttachedRef.current) {
      console.log('⚠️ Event listeners already attached, skipping');
      return;
    }

    // Remove any existing listeners first
    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:moving');
    fabricCanvas.off('object:scaling');

    // Consolidated event handler with boundary validation and immediate persistence
    const handleElementChange = (e: fabric.ModifiedEvent) => {
      const obj = e.target;
      if (!obj || !format) {
        updateLayoutDraft(fabricCanvas, format);
        return;
      }

      // Real-time boundary constraint during interaction
      const unscaledX = (obj.left || 0) / scale;
      const unscaledY = (obj.top || 0) / scale;
      const objWidth = ((obj.width || 100) * (obj.scaleX || 1));
      const objHeight = ((obj.height || 50) * (obj.scaleY || 1));

      const constrained = constrainToCanvas(
        {
          position: { x: unscaledX, y: unscaledY },
          size: { width: objWidth / scale, height: objHeight / scale }
        },
        format,
        10 // 10px margin
      );

      // Apply constraints if position changed
      if (constrained.position.x !== unscaledX || constrained.position.y !== unscaledY) {
        obj.set({
          left: constrained.position.x * scale,
          top: constrained.position.y * scale
        });
        fabricCanvas.renderAll();
        console.log(`🚧 Element constrained to boundaries:`, constrained.position);
      }

      // Immediate update - no debounce
      updateLayoutDraft(fabricCanvas, format);
    };

    // Attach optimized event listeners
    fabricCanvas.on('object:modified', handleElementChange);
    fabricCanvas.on('object:moving', handleElementChange);
    fabricCanvas.on('object:scaling', handleElementChange);

    eventListenersAttachedRef.current = true;
    console.log('✅ Canvas event listeners setup with boundary validation and immediate persistence');
  }, [scale, updateLayoutDraft]);

  const addDefaultLayoutElements = useCallback((fabricCanvas: FabricCanvas, format?: string) => {
    console.log('📋 Adding default layout elements to canvas for format:', format);
    
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
        position: { x: Math.max(50, displayWidth - 250), y: Math.max(50, displayHeight - 250) },
        style: { width: 200, height: 200 }
      }
    ];

    defaultElements.forEach(element => {
      addElementToCanvas(fabricCanvas, element, scale, format);
    });

    setupCanvasEventListeners(fabricCanvas, format);
    updateLayoutDraft(fabricCanvas, format);
  }, [displayWidth, displayHeight, scale, setupCanvasEventListeners, updateLayoutDraft]);

  const clearCanvasObjects = useCallback((fabricCanvas: FabricCanvas) => {
    console.log('🧹 Clearing canvas objects');
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      fabricCanvas.remove(obj);
    });
    fabricCanvas.renderAll();
    
    // Reset event listener flag when clearing
    eventListenersAttachedRef.current = false;
  }, []);

  const loadLayoutElements = useCallback(async (fabricCanvas: FabricCanvas, templateId: string, formatName: string) => {
    if (!fabricCanvas || isLoadingLayout) {
      console.warn('⚠️ Cannot load layout: canvas not available or already loading');
      return false;
    }

    console.log('📥 Loading layout elements for template:', templateId, 'format:', formatName);
    setIsLoadingLayout(true);
    setLoadingState('loading-elements');
    setLoadingError(null);
    
    try {
      clearCanvasObjects(fabricCanvas);
      
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements && existingLayout.layout_config.elements.length > 0) {
        console.log('📂 Loading existing layout elements:', existingLayout.layout_config.elements.length, 'elements');
        
        // Deduplicate elements by field before adding to canvas
        const uniqueElements = new Map();
        existingLayout.layout_config.elements.forEach((element: any) => {
          uniqueElements.set(element.field, element);
        });
        
        const elementsToLoad = Array.from(uniqueElements.values());
        console.log('🔍 After deduplication:', elementsToLoad.length, 'unique elements');
        
        elementsToLoad.forEach((element: any) => {
          const elementConfig = {
            id: element.id,
            type: element.type,
            field: element.field,
            position: element.position,
            size: element.size,
            style: {
              fontSize: element.style?.fontSize || 24,
              fontFamily: element.style?.fontFamily || 'Arial',
              color: element.style?.color || '#333333',
              width: element.size?.width || element.style?.width,
              height: element.size?.height || element.style?.height,
              ...element.style
            }
          };
          console.log('➕ Adding element from saved layout:', elementConfig.field, 'with preserved size:', elementConfig.size);
          addElementToCanvas(fabricCanvas, elementConfig, scale, formatName);
        });
        
        setupCanvasEventListeners(fabricCanvas, formatName);
        updateLayoutDraft(fabricCanvas, formatName);
        console.log('✅ Successfully loaded', elementsToLoad.length, 'elements from saved layout');
        toast.success(`Layout carregado: ${elementsToLoad.length} elementos`);
      } else {
        console.log('📋 No existing layout found, adding default elements');
        addDefaultLayoutElements(fabricCanvas, formatName);
        toast.info('Layout padrão aplicado');
      }
      
      setLoadingState('ready');
      return true;
    } catch (error) {
      console.error('❌ Error loading layout:', error);
      setLoadingError(`Erro ao carregar layout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      console.log('🔄 Falling back to default layout');
      addDefaultLayoutElements(fabricCanvas, formatName);
      setLoadingState('ready');
      toast.error('Erro ao carregar layout salvo, usando layout padrão');
      return false;
    } finally {
      setIsLoadingLayout(false);
    }
  }, [isLoadingLayout, setIsLoadingLayout, setLoadingState, setLoadingError, clearCanvasObjects, getLayout, addDefaultLayoutElements, setupCanvasEventListeners, updateLayoutDraft, scale]);

  const loadLayoutIfReady = useCallback(async (templateId: string, formatName: string) => {
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
    
    const success = await loadLayoutElements(currentCanvas, templateId, formatName);
    if (success && loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [canvasRef, isLoadingLayout, loadingState, layoutLoadAttempts, incrementLayoutAttempts, setLoadingError, loadLayoutElements, loadingTimeoutRef]);

  const handleCanvasReady = useCallback((fabricCanvas: FabricCanvas, templateId: string, formatName: string) => {
    console.log('🎨 Canvas ready callback triggered');
    setCanvas(fabricCanvas);
    canvasRef.current = fabricCanvas;
    setLoadingState('initializing');
    
    // Try to load elements immediately when canvas is ready
    setTimeout(() => {
      loadLayoutIfReady(templateId, formatName);
    }, 100);
  }, [setCanvas, canvasRef, setLoadingState, loadLayoutIfReady]);

  const handleBackgroundLoaded = useCallback((templateId: string, formatName: string) => {
    console.log('🖼️ Background loaded callback triggered');
    setLoadingState('loading-background');
    
    // Try to load elements when background is ready
    setTimeout(() => {
      loadLayoutIfReady(templateId, formatName);
    }, 100);
  }, [setLoadingState, loadLayoutIfReady]);

  const handleManualReload = useCallback(async (templateId: string, formatName: string) => {
    if (!canvasRef.current) {
      toast.error('Canvas não está disponível');
      return;
    }
    
    console.log('🔄 Manual reload triggered');
    setIsLoadingLayout(false);
    eventListenersAttachedRef.current = false; // Reset listener flag
    setLoadingState('loading-elements');
    await loadLayoutElements(canvasRef.current, templateId, formatName);
  }, [canvasRef, setIsLoadingLayout, setLoadingState, loadLayoutElements]);

  // Simplified effect without layoutLoadAttempts to prevent loops
  useEffect(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (canvas && loadingState !== 'ready' && !isLoadingLayout && layoutLoadAttempts < 3) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Timeout triggered for loading elements');
      }, 3000);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [canvas, loadingState, isLoadingLayout]);

  return {
    handleCanvasReady,
    handleBackgroundLoaded,
    handleManualReload,
    loadLayoutIfReady,
    updateLayoutDraft
  };
};
