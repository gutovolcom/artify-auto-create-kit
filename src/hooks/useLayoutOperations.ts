
import { toast } from 'sonner';
import * as fabric from 'fabric';
import { addElementToCanvas } from '@/components/layout-editor/elementManager';
import { serializeCanvasLayout } from '@/components/layout-editor/layoutSerializer';

type FabricCanvas = fabric.Canvas;

interface LayoutElement {
  id: string;
  name: string;
  field_mapping: string;
  element_type: string;
  default_style: any;
}

interface UseLayoutOperationsProps {
  canvas: FabricCanvas | null;
  selectedObject: any;
  setSelectedObject: (obj: any) => void;
  scale: number;
  displayWidth: number;
  displayHeight: number;
  layoutElements: LayoutElement[];
  layoutDraft: any[];
  setLayoutDraft: (draft: any[]) => void;
  saveLayout: (config: any) => Promise<void>;
  templateId: string;
  formatName: string;
  onSave?: () => void;
  updateLayoutDraft: (canvas: FabricCanvas, format?: string) => void;
}

export const useLayoutOperations = ({
  canvas,
  selectedObject,
  setSelectedObject,
  scale,
  displayWidth,
  displayHeight,
  layoutElements,
  layoutDraft,
  setLayoutDraft,
  saveLayout,
  templateId,
  formatName,
  onSave,
  updateLayoutDraft
}: UseLayoutOperationsProps) => {

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

    // Position new elements in visible area with format-aware positioning
    const safeMargin = 50;
    const maxX = Math.max(safeMargin, displayWidth - 300);
    const maxY = Math.max(safeMargin, displayHeight - 200);
    
    const randomX = safeMargin + Math.random() * (maxX - safeMargin);
    const randomY = safeMargin + Math.random() * (maxY - safeMargin);

    // Enhanced element configuration with proper size handling
    const elementConfig = {
      id: `${elementType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: element.element_type,
      field: element.field_mapping,
      position: { x: randomX, y: randomY },
      style: { 
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#333333',
        // Add default sizes for different element types
        ...(element.element_type === 'image' ? { width: 200, height: 200 } : {})
      }
    };

    console.log('➕ Adding new element with format validation:', elementConfig);
    addElementToCanvas(canvas, elementConfig, scale, formatName);
    updateLayoutDraft(canvas, formatName);
    toast.success('Elemento adicionado!');
  };

  const handleDeleteSelected = () => {
    if (!selectedObject || !canvas) {
      toast.error('Nenhum elemento selecionado');
      return;
    }
    
    try {
      console.log('🗑️ Deleting selected object:', selectedObject.elementId);
      canvas.remove(selectedObject);
      setSelectedObject(null);
      canvas.renderAll();
      updateLayoutDraft(canvas, formatName);
      toast.success('Elemento removido!');
    } catch (error) {
      console.error('❌ Error deleting element:', error);
      toast.error('Erro ao remover elemento');
    }
  };

  const handleSaveLayout = async () => {
    if (!canvas) {
      toast.error('Canvas não está disponível');
      return;
    }

    try {
      // Use layout draft if available, otherwise serialize fresh with format validation
      const elements = layoutDraft.length > 0 ? layoutDraft : serializeCanvasLayout(canvas, scale, formatName);
      console.log('💾 Saving layout with validated elements for format:', formatName, 'Elements count:', elements.length);

      await saveLayout({
        template_id: templateId,
        format_name: formatName,
        layout_config: { elements }
      });

      onSave?.();
    } catch (error) {
      console.error('❌ Error saving layout:', error);
    }
  };

  return {
    handleAddElement,
    handleDeleteSelected,
    handleSaveLayout
  };
};
