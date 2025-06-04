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
  updateSelectedObjectProperty,
  serializeCanvasLayout
} from './layout-editor/canvasOperations';

interface ExtendedLayoutEditorProps extends LayoutEditorProps {
  eventData?: {
    title: string;
    classTheme: string;
    teacherName: string;
    date: string;
    time: string;
    textColor: string;
    boxColor: string;
    boxFontColor: string;
    teacherImages?: string[];
  };
}

export const LayoutEditor: React.FC<ExtendedLayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  eventData,
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

  const createSampleEventData = () => ({
    title: eventData?.title || 'Título do Evento',
    classTheme: eventData?.classTheme || 'Tema da Aula',
    teacherName: eventData?.teacherName || 'Nome do Professor',
    date: eventData?.date || '2024-01-25',
    time: eventData?.time || '19:00',
    textColor: eventData?.textColor || '#FFFFFF',
    boxColor: eventData?.boxColor || '#dd303e',
    boxFontColor: eventData?.boxFontColor || '#FFFFFF',
    teacherImages: eventData?.teacherImages || []
  });

  const addDefaultLayoutElements = (fabricCanvas: FabricCanvas) => {
    const sampleData = createSampleEventData();
    
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
        type: 'text_box',
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
        id: 'professorPhoto',
        type: 'image',
        field: 'professorPhotos',
        position: { x: formatDimensions.width - 250, y: formatDimensions.height - 250 },
        style: { width: 200, height: 200 }
      }
    ];

    defaultElements.forEach(element => {
      addElementToCanvas(fabricCanvas, element, scale, sampleData);
    });
  };

  const handleCanvasReady = async (fabricCanvas: FabricCanvas) => {
    if (isInitialized) return; // Prevent multiple initializations
    
    console.log('Canvas ready, initializing...');
    console.log('Background image URL:', backgroundImageUrl);
    setCanvas(fabricCanvas);
    setIsInitialized(true);
    
    try {
      // Always try to load background image first
      if (backgroundImageUrl) {
        await loadBackgroundImage(fabricCanvas, backgroundImageUrl, scale);
        console.log('Background image loaded successfully');
      } else {
        console.warn('No background image URL provided');
        // Set a default background color if no image
        fabricCanvas.backgroundColor = '#f5f5f5';
        fabricCanvas.renderAll();
      }
      
      // Then load existing layout or default elements
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements && existingLayout.layout_config.elements.length > 0) {
        console.log('Loading existing layout with', existingLayout.layout_config.elements.length, 'elements');
        existingLayout.layout_config.elements.forEach((element: any) => {
          addElementToCanvas(fabricCanvas, element, scale, createSampleEventData());
        });
      } else {
        console.log('No existing layout found, adding default elements');
        addDefaultLayoutElements(fabricCanvas);
      }
    } catch (error) {
      console.error('Error during canvas initialization:', error);
      // Set background color as fallback
      fabricCanvas.backgroundColor = '#f5f5f5';
      fabricCanvas.renderAll();
      // Even if layout loading fails, add default elements so the editor is usable
      addDefaultLayoutElements(fabricCanvas);
      toast.error('Erro ao carregar imagem de fundo, mas o editor está funcionando');
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

    const sampleData = createSampleEventData();
    
    const elementConfig = {
      type: element.element_type,
      field: element.field_mapping,
      position: { x: 50, y: 50 },
      style: {}
    };

    addElementToCanvas(canvas, elementConfig, scale, sampleData);
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

  const handleUpdateObject = (property: string, value: any) => {
    if (!selectedObject || !canvas) return;
    updateSelectedObjectProperty(selectedObject, canvas, property, value, scale);
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
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Editor de Posicionamento</h3>
          <p className="text-sm text-blue-700">
            Este editor é apenas para posicionar elementos. Todos os estilos, cores e fontes 
            são aplicados automaticamente baseados nas configurações do formulário durante a geração.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            <p><strong>Hierarquia Margem:</strong> Título (Black), Tema (Bold), Professor/Data (Regular)</p>
          </div>
        </div>

        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={handleAddElement}
        />

        <PropertiesPanel
          selectedObject={selectedObject}
          scale={scale}
          onUpdateObject={handleUpdateObject}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>
    </div>
  );
};
