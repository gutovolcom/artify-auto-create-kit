
import React, { useState, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { toast } from 'sonner';
import { LayoutEditorProps } from './layout-editor/types';
import { CanvasArea } from './layout-editor/CanvasArea';
import { ElementToolbar } from './layout-editor/ElementToolbar';
import { PropertiesPanel } from './layout-editor/PropertiesPanel';
import { 
  loadBackgroundImage, 
  addElementToCanvas, 
  serializeCanvasLayout
} from './layout-editor/canvasOperations';

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
  const { layoutElements, saveLayout, getLayout, loading: elementsLoading, error } = useLayoutEditor();
  
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;
  const scale = Math.min(
    maxCanvasWidth / formatDimensions.width,
    maxCanvasHeight / formatDimensions.height
  );
  
  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  const addDefaultLayoutElements = (fabricCanvas: FabricCanvas) => {
    console.log('Adding default layout elements');
    
    const defaultElements = [
      {
        id: 'title',
        type: 'text',
        field: 'title',
        position: { x: 50, y: 50 },
        style: {}
      },
      {
        id: 'classTheme',
        type: 'text',
        field: 'classTheme',
        position: { x: 50, y: 150 },
        style: {}
      },
      {
        id: 'teacherName',
        type: 'text',
        field: 'teacherName',
        position: { x: 50, y: 250 },
        style: {}
      },
      {
        id: 'date',
        type: 'text',
        field: 'date',
        position: { x: 50, y: 320 },
        style: {}
      },
      {
        id: 'time',
        type: 'text',
        field: 'time',
        position: { x: 200, y: 320 },
        style: {}
      },
      {
        id: 'professorPhoto',
        type: 'image',
        field: 'professorPhotos',
        position: { x: formatDimensions.width - 250, y: formatDimensions.height - 250 },
        style: { width: 200, height: 200 }
      }
    ];

    defaultElements.forEach(element => {
      addElementToCanvas(fabricCanvas, element, scale);
    });
  };

  const handleCanvasReady = async (fabricCanvas: FabricCanvas) => {
    if (isInitialized) return;
    
    console.log('Canvas ready, initializing...');
    setCanvas(fabricCanvas);
    setIsInitialized(true);
    
    try {
      if (backgroundImageUrl) {
        await loadBackgroundImage(fabricCanvas, backgroundImageUrl, scale);
      } else {
        fabricCanvas.backgroundColor = '#f5f5f5';
        fabricCanvas.renderAll();
      }
      
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements && existingLayout.layout_config.elements.length > 0) {
        console.log('Loading existing layout');
        existingLayout.layout_config.elements.forEach((element: any) => {
          addElementToCanvas(fabricCanvas, element, scale);
        });
      } else {
        addDefaultLayoutElements(fabricCanvas);
      }
    } catch (error) {
      console.error('Error during canvas initialization:', error);
      fabricCanvas.backgroundColor = '#f5f5f5';
      fabricCanvas.renderAll();
      addDefaultLayoutElements(fabricCanvas);
      toast.error('Erro ao carregar imagem de fundo');
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

    const elementConfig = {
      type: element.element_type,
      field: element.field_mapping,
      position: { x: 50, y: 50 },
      style: {}
    };

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
      />

      <div className="w-80">
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={handleAddElement}
        />

        <PropertiesPanel
          selectedObject={selectedObject}
          scale={scale}
          onUpdateObject={() => {}} // Removed real-time updates
          onDeleteSelected={handleDeleteSelected}
        />
      </div>
    </div>
  );
};
