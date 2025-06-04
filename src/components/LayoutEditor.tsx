import React, { useState, useEffect } from 'react';
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

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  onSave
}) => {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  console.log('LayoutEditor render:', {
    formatDimensions,
    scale,
    displayWidth,
    displayHeight,
    maxCanvasWidth,
    maxCanvasHeight
  });

  const addDefaultLayoutElements = (fabricCanvas: FabricCanvas) => {
    console.log('Adding default layout elements to canvas of size:', displayWidth, 'x', displayHeight);
    
    const defaultElements = [
      {
        id: 'title',
        type: 'text',
        field: 'title',
        position: { x: 50, y: 50 },
        style: { fontSize: 24 }
      },
      {
        id: 'classTheme',
        type: 'text',
        field: 'classTheme',
        position: { x: 50, y: 150 },
        style: { fontSize: 20 }
      },
      {
        id: 'teacherName',
        type: 'text',
        field: 'teacherName',
        position: { x: 50, y: 250 },
        style: { fontSize: 18 }
      },
      {
        id: 'date',
        type: 'text',
        field: 'date',
        position: { x: 50, y: 320 },
        style: { fontSize: 16 }
      },
      {
        id: 'time',
        type: 'text',
        field: 'time',
        position: { x: 200, y: 320 },
        style: { fontSize: 16 }
      },
      {
        id: 'professorPhoto',
        type: 'image',
        field: 'professorPhotos',
        position: { x: displayWidth - 250, y: displayHeight - 250 },
        style: { width: 200, height: 200 }
      }
    ];

    console.log('Default elements to add:', defaultElements);

    defaultElements.forEach(element => {
      addElementToCanvas(fabricCanvas, element, scale);
    });
  };

  const loadElementsToCanvas = async (fabricCanvas: FabricCanvas) => {
    console.log('Loading elements to canvas after background is ready');
    
    try {
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements && existingLayout.layout_config.elements.length > 0) {
        console.log('Loading existing layout elements:', existingLayout.layout_config.elements);
        existingLayout.layout_config.elements.forEach((element: any) => {
          // Convert saved layout to expected format
          const elementConfig = {
            id: element.id,
            type: element.type,
            field: element.field,
            position: element.position,
            style: element.style || {}
          };
          addElementToCanvas(fabricCanvas, elementConfig, scale);
        });
      } else {
        console.log('No existing layout found, adding default elements');
        addDefaultLayoutElements(fabricCanvas);
      }
    } catch (error) {
      console.error('Error loading layout:', error);
      addDefaultLayoutElements(fabricCanvas);
    }
  };

  const handleCanvasReady = (fabricCanvas: FabricCanvas) => {
    if (isInitialized) return;
    
    console.log('Canvas ready, waiting for background to load...');
    setCanvas(fabricCanvas);
    setIsInitialized(true);
  };

  const handleBackgroundLoaded = () => {
    console.log('Background loaded, now adding elements');
    setIsBackgroundLoaded(true);
    
    if (canvas) {
      loadElementsToCanvas(canvas);
    }
  };

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

    // Position new elements in visible area with some randomness
    const randomX = 50 + Math.random() * (displayWidth - 300);
    const randomY = 50 + Math.random() * (displayHeight - 200);

    const elementConfig = {
      type: element.element_type,
      field: element.field_mapping,
      position: { x: randomX, y: randomY },
      style: { fontSize: 20 }
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
      console.log('Saving layout with elements:', elements);

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
      </div>
    </div>
  );
};
