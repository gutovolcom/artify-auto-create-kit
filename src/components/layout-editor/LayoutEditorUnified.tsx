// Updated layout editor using unified canvas system
import React from 'react';
import { LayoutEditorProps } from './types';
import { useUnifiedCanvasManager } from '@/hooks/useUnifiedCanvasManager';
import { UnifiedCanvasElement } from '@/types/canvas';
import { useLayoutEditor } from '@/hooks/useLayoutEditor';
import { toast } from 'sonner';

export const LayoutEditorUnified: React.FC<LayoutEditorProps> = ({
  templateId,
  formatName,
  backgroundImageUrl,
  formatDimensions,
  onSaveLayout
}) => {
  const { layoutElements, saveLayout, getLayout } = useLayoutEditor();
  const [selectedElement, setSelectedElement] = React.useState<UnifiedCanvasElement | null>(null);

  // Calculate scale to fit canvas in container
  const containerWidth = 800;
  const containerHeight = 600;
  const scale = Math.min(
    containerWidth / formatDimensions.width,
    containerHeight / formatDimensions.height
  );

  const displayWidth = formatDimensions.width * scale;
  const displayHeight = formatDimensions.height * scale;

  const {
    canvasRef,
    canvas,
    isReady,
    isLoading,
    error,
    addElement,
    removeElement,
    serializeLayout,
    deserializeLayout
  } = useUnifiedCanvasManager({
    mode: 'layout-editor',
    width: displayWidth,
    height: displayHeight,
    format: formatName,
    scale,
    backgroundImageUrl,
    onCanvasReady: handleCanvasReady,
    onElementChange: handleElementChange,
    onError: handleError
  });

  // Handle canvas ready
  async function handleCanvasReady(fabricCanvas: any) {
    console.log('Canvas ready, loading existing layout...');
    
    try {
      const existingLayout = await getLayout(templateId, formatName);
      
      if (existingLayout?.layout_config?.elements) {
        const unifiedElements: UnifiedCanvasElement[] = existingLayout.layout_config.elements.map(el => ({
          id: el.id,
          field: el.field,
          type: el.type,
          position: el.position,
          size: el.size || { width: 100, height: 50 },
          mode: 'layout-editor' as const,
          style: el.style
        }));

        // Add each element to canvas
        for (const element of unifiedElements) {
          await addElement(element);
        }
      }
    } catch (error) {
      console.error('Error loading existing layout:', error);
      toast.error('Erro ao carregar layout existente');
    }
  }

  // Handle element changes
  function handleElementChange(elements: UnifiedCanvasElement[]) {
    console.log('Elements changed:', elements);
    // Auto-save could be implemented here
  }

  // Handle errors
  function handleError(error: string) {
    console.error('Canvas error:', error);
    toast.error(error);
  }

  // Add new element
  const handleAddElement = async (elementType: string) => {
    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) {
      console.error('Element not found:', elementType);
      return;
    }

    const newElement: UnifiedCanvasElement = {
      id: `${elementType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      field: element.field_mapping,
      type: element.element_type,
      position: { 
        x: 50 + Math.random() * Math.max(50, displayWidth - 300),
        y: 50 + Math.random() * Math.max(50, displayHeight - 200)
      },
      size: { width: 200, height: 50 },
      mode: 'layout-editor',
      style: {
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#333333',
        ...element.default_style
      }
    };

    await addElement(newElement);
  };

  // Save layout
  const handleSaveLayout = async () => {
    try {
      const serializedLayout = serializeLayout();
      
      await saveLayout({
        template_id: templateId,
        format_name: formatName,
        layout_config: {
          elements: serializedLayout.elements.map(el => ({
            id: el.id,
            type: el.type,
            field: el.field,
            position: el.position,
            size: el.size,
            style: el.style
          }))
        }
      });

      toast.success('Layout salvo com sucesso!');
      onSaveLayout?.();
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Erro ao salvar layout');
    }
  };

  // Delete selected element
  const handleDeleteSelected = () => {
    if (selectedElement) {
      removeElement(selectedElement.id);
      setSelectedElement(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando editor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-600">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Canvas Area */}
      <div className="flex-1 relative">
        <div className="border rounded-lg p-4 bg-gray-50">
          <div 
            className="relative mx-auto bg-white shadow-lg"
            style={{ width: displayWidth, height: displayHeight }}
          >
            <canvas 
              ref={canvasRef}
              className="absolute inset-0"
            />
          </div>
        </div>

        {/* Element Toolbar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {layoutElements.map((element) => (
            <button
              key={element.id}
              onClick={() => handleAddElement(element.field_mapping)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              + {element.name}
            </button>
          ))}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSaveLayout}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition"
          >
            Salvar Layout
          </button>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-full lg:w-72 space-y-4">
        {selectedElement && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Propriedades</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Campo:</label>
                <div className="text-sm text-gray-600">{selectedElement.field}</div>
              </div>
              <div>
                <label className="block text-sm font-medium">Tipo:</label>
                <div className="text-sm text-gray-600">{selectedElement.type}</div>
              </div>
              <div>
                <label className="block text-sm font-medium">Posição:</label>
                <div className="text-sm text-gray-600">
                  X: {Math.round(selectedElement.position.x)}, Y: {Math.round(selectedElement.position.y)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Tamanho:</label>
                <div className="text-sm text-gray-600">
                  W: {Math.round(selectedElement.size.width)}, H: {Math.round(selectedElement.size.height)}
                </div>
              </div>
              <button
                onClick={handleDeleteSelected}
                className="w-full mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Debug Info</h3>
            <div className="text-sm space-y-1">
              <div>Canvas Ready: {isReady ? 'Yes' : 'No'}</div>
              <div>Format: {formatName}</div>
              <div>Scale: {scale.toFixed(2)}</div>
              <div>Display: {displayWidth}x{displayHeight}</div>
              <div>Original: {formatDimensions.width}x{formatDimensions.height}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 