
import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { toast } from 'sonner';
import { LayoutEditorProps } from './layout-editor/types';
import { CanvasArea } from './layout-editor/CanvasArea';
import { ElementToolbar } from './layout-editor/ElementToolbar';
import { PropertiesPanel } from './layout-editor/PropertiesPanel';
import { 
  addElementToCanvas, 
  serializeCanvasLayout
} from './layout-editor/canvasOperations';

type FabricCanvas = fabric.Canvas;

// Loading states for better state management
type LoadingState = 'idle' | 'initializing' | 'loading-background' | 'loading-elements' | 'ready' | 'error';

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  onSave
}) => {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [layoutLoadAttempts, setLayoutLoadAttempts] = useState(0);
  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  // Refs to store latest callbacks and prevent stale closures
  const canvasRef = useRef<FabricCanvas | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('LayoutEditor render:', {
    templateId,
    formatName,
    loadingState,
    layoutLoadAttempts,
    canvasReady: !!canvas
  });

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

  const loadLayoutElements = async (fabricCanvas: FabricCanvas) => {
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

  // Centralized function to check conditions and load elements
  const loadLayoutIfReady = async () => {
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
    
    const success = await loadLayoutElements(currentCanvas);
    if (success) {
      // Clear any pending timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  };

  const handleCanvasReady = (fabricCanvas: FabricCanvas) => {
    console.log('Canvas ready callback triggered');
    setCanvas(fabricCanvas);
    canvasRef.current = fabricCanvas;
    setLoadingState('initializing');
    
    // Try to load elements immediately when canvas is ready
    setTimeout(() => {
      loadLayoutIfReady();
    }, 100);
  };

  const handleBackgroundLoaded = () => {
    console.log('Background loaded callback triggered');
    setLoadingState('loading-background');
    
    // Try to load elements when background is ready
    setTimeout(() => {
      loadLayoutIfReady();
    }, 100);
  };

  const handleManualReload = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas não está disponível');
      return;
    }
    
    console.log('Manual reload triggered');
    setLayoutLoadAttempts(0);
    setLoadingState('loading-elements');
    await loadLayoutElements(canvasRef.current);
  };

  // Set up fallback timeout for loading elements
  useEffect(() => {
    if (canvas && loadingState !== 'ready' && layoutLoadAttempts < 3) {
      // Set up a timeout to load elements even if background doesn't load
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Timeout triggered for loading elements');
        loadLayoutIfReady();
      }, 2000); // 2 second timeout
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [canvas, loadingState, layoutLoadAttempts]);

  // Reset state when template or format changes
  useEffect(() => {
    console.log('Template or format changed, resetting state');
    setLoadingState('idle');
    setLayoutLoadAttempts(0);
    setLoadingError(null);
    canvasRef.current = null;
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [templateId, formatName]);

  const handleAddElement = (elementType: string) => {
    if (!canvas) {
      toast.error('Canvas não está disponível');
      return;
    }
    
    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) {
      toast.error('Elemento não encontrado');
      return;
    }

    // Remove any existing elements with the same field to prevent duplicates
    const objects = canvas.getObjects();
    const duplicates = objects.filter((obj: any) => obj.fieldMapping === elementType);
    duplicates.forEach(duplicate => {
      canvas.remove(duplicate);
    });

    // Position new elements in visible area with some randomness
    const randomX = 50 + Math.random() * (displayWidth - 300);
    const randomY = 50 + Math.random() * (displayHeight - 200);

    const elementConfig = {
      id: `${elementType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: element.element_type,
      field: element.field_mapping,
      position: { x: randomX, y: randomY },
      style: { 
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#333333'
      }
    };

    console.log('Adding new element:', elementConfig);
    addElementToCanvas(canvas, elementConfig, scale);
    toast.success('Elemento adicionado!');
  };

  const handleDeleteSelected = () => {
    if (!selectedObject || !canvas) {
      toast.error('Nenhum elemento selecionado');
      return;
    }
    
    try {
      console.log('Deleting selected object:', selectedObject.elementId);
      canvas.remove(selectedObject);
      setSelectedObject(null);
      canvas.renderAll();
      toast.success('Elemento removido!');
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Erro ao remover elemento');
    }
  };

  const handleSaveLayout = async () => {
    if (!canvas) {
      toast.error('Canvas não está disponível');
      return;
    }

    try {
      const elements = serializeCanvasLayout(canvas, scale);
      console.log('Saving layout with elements:', elements.length, 'elements');

      await saveLayout({
        template_id: templateId,
        format_name: formatName,
        layout_config: { elements }
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  if (elementsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando elementos de layout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar editor de layout</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <CanvasArea
        formatName={formatName}
        formatDimensions={formatDimensions}
        displayWidth={displayWidth}
        displayHeight={displayHeight}
        backgroundImageUrl={backgroundImageUrl}
        scale={scale}
        canvas={canvas}
        selectedObject={selectedObject}
        onCanvasReady={handleCanvasReady}
        onSelectionChange={setSelectedObject}
        onSave={handleSaveLayout}
        onDeleteSelected={handleDeleteSelected}
        onBackgroundLoaded={handleBackgroundLoaded}
      />

      <div className="w-80">
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={handleAddElement}
        />

        <PropertiesPanel
          selectedObject={selectedObject}
          scale={scale}
          onUpdateObject={() => {}}
          onDeleteSelected={handleDeleteSelected}
        />

        {/* Loading status and manual controls */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            <p><strong>Status:</strong> {loadingState}</p>
            <p><strong>Tentativas:</strong> {layoutLoadAttempts}</p>
            {loadingError && (
              <p className="text-red-600 mt-2">{loadingError}</p>
            )}
          </div>
          
          <button
            onClick={handleManualReload}
            disabled={loadingState === 'loading-elements'}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingState === 'loading-elements' ? 'Carregando...' : 'Recarregar Layout'}
          </button>
        </div>
      </div>
    </div>
  );
};
