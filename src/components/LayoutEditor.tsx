
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
  const { layoutElements, saveLayout, getLayout } = useLayoutEditor();
  
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
    
    // Add default elements with sample styling from event data
    const defaultElements = [
      {
        id: 'title',
        type: 'text',
        field: 'title',
        position: { x: 50, y: 50 },
        style: { 
          fontSize: 32, 
          color: sampleData.textColor,
          fontFamily: 'Margem-Regular'
        }
      },
      {
        id: 'classTheme',
        type: 'text_box',
        field: 'classTheme',
        position: { x: 50, y: 150 },
        style: { 
          fontSize: 24, 
          backgroundColor: sampleData.boxColor,
          textColor: sampleData.boxFontColor,
          fontFamily: 'Margem-Regular',
          padding: 20,
          borderRadius: 10
        }
      },
      {
        id: 'teacherName',
        type: 'text',
        field: 'teacherName',
        position: { x: 50, y: 250 },
        style: { 
          fontSize: 28, 
          color: sampleData.textColor,
          fontFamily: 'Margem-Regular'
        }
      },
      {
        id: 'date',
        type: 'text',
        field: 'date',
        position: { x: 50, y: 320 },
        style: { 
          fontSize: 22, 
          color: sampleData.textColor,
          fontFamily: 'Margem-Regular'
        }
      },
      {
        id: 'professorPhoto',
        type: 'image',
        field: 'professorPhotos',
        position: { x: formatDimensions.width - 250, y: formatDimensions.height - 250 },
        style: { 
          width: 200, 
          height: 200
        }
      }
    ];

    defaultElements.forEach(element => {
      addElementToCanvas(fabricCanvas, element, scale);
    });
  };

  const handleCanvasReady = async (fabricCanvas: FabricCanvas) => {
    setCanvas(fabricCanvas);
    
    // Load background image
    await loadBackgroundImage(fabricCanvas, backgroundImageUrl, scale);
    
    // Load existing layout or create default layout
    try {
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements && existingLayout.layout_config.elements.length > 0) {
        // Load existing layout with updated styling from current event data
        existingLayout.layout_config.elements.forEach((element: any) => {
          // Update element styling with current event data colors
          const updatedElement = {
            ...element,
            style: {
              ...element.style,
              color: eventData?.textColor || element.style?.color,
              backgroundColor: eventData?.boxColor || element.style?.backgroundColor,
              textColor: eventData?.boxFontColor || element.style?.textColor
            }
          };
          addElementToCanvas(fabricCanvas, updatedElement, scale);
        });
      } else {
        // Create default layout with current event data
        addDefaultLayoutElements(fabricCanvas);
      }
    } catch (error) {
      console.error('Error loading existing layout:', error);
      // Fallback to default layout
      addDefaultLayoutElements(fabricCanvas);
    }
  };

  const handleAddElement = (elementType: string) => {
    if (!canvas) return;
    
    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) return;

    const sampleData = createSampleEventData();
    
    // Create element with current event data styling
    const elementConfig = {
      type: element.element_type,
      field: element.field_mapping,
      position: { x: 50, y: 50 },
      style: {
        ...element.default_style,
        color: sampleData.textColor,
        backgroundColor: element.field_mapping === 'classTheme' ? sampleData.boxColor : undefined,
        textColor: element.field_mapping === 'classTheme' ? sampleData.boxFontColor : undefined
      }
    };

    addElementToCanvas(canvas, elementConfig, scale);
  };

  const handleDeleteSelected = () => {
    if (!selectedObject || !canvas) return;
    
    canvas.remove(selectedObject);
    setSelectedObject(null);
    canvas.renderAll();
    toast.success('Elemento removido!');
  };

  const handleUpdateObject = (property: string, value: any) => {
    if (!selectedObject || !canvas) return;
    updateSelectedObjectProperty(selectedObject, canvas, property, value, scale);
  };

  const handleSaveLayout = async () => {
    if (!canvas) return;

    try {
      const elements = serializeCanvasLayout(canvas, scale);

      await saveLayout({
        template_id: templateId,
        format_name: formatName,
        layout_config: { elements }
      });

      onSave?.();
    } catch (error) {
      // Error handled in hook
    }
  };

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
          <h3 className="font-medium text-blue-800 mb-2">Editor de Layout</h3>
          <p className="text-sm text-blue-700">
            Use este editor apenas para posicionar os elementos. As cores e estilos 
            serão aplicados automaticamente baseados nas configurações do formulário durante a geração.
          </p>
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
