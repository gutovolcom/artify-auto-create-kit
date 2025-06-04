
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

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
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

  const handleCanvasReady = async (fabricCanvas: FabricCanvas) => {
    setCanvas(fabricCanvas);
    
    // Load background image
    await loadBackgroundImage(fabricCanvas, backgroundImageUrl, scale);
    
    // Load existing layout
    try {
      const existingLayout = await getLayout(templateId, formatName);
      if (existingLayout?.layout_config?.elements) {
        existingLayout.layout_config.elements.forEach((element: any) => {
          addElementToCanvas(fabricCanvas, element, scale);
        });
      }
    } catch (error) {
      console.error('Error loading existing layout:', error);
    }
  };

  const handleAddElement = (elementType: string) => {
    if (!canvas) return;
    
    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) return;

    addElementToCanvas(canvas, {
      type: element.element_type,
      field: element.field_mapping,
      position: { x: 50, y: 50 },
      style: element.default_style
    }, scale);
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
