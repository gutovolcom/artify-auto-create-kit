
import { useCallback } from 'react';
import * as fabric from 'fabric';
import { addElementToCanvas } from '@/components/layout-editor/elementManager';
import { serializeCanvasLayout } from '@/components/layout-editor/layoutSerializer';
import { toast } from 'sonner';

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
  setSelectedObject: (object: any) => void;
  scale: number;
  displayWidth: number;
  displayHeight: number;
  layoutElements: LayoutElement[];
  layoutDraft: any[];
  setLayoutDraft: (draft: any[]) => void;
  saveLayout: any;
  templateId: string;
  formatName: string;
  onSave?: () => void;
  updateLayoutDraft: (fabricCanvas: FabricCanvas, format?: string) => void;
  addDeletedElement: (elementId: string) => void;
  isElementDeleted: (elementId: string) => boolean;
}

export const useLayoutOperations = (props: UseLayoutOperationsProps) => {
  const {
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
    updateLayoutDraft,
    addDeletedElement,
    isElementDeleted
  } = props;

  const handleAddElement = useCallback((elementType: string) => {
    if (!canvas) {
      console.error('Canvas is not available');
      return;
    }

    const element = layoutElements.find(el => el.field_mapping === elementType);
    if (!element) {
      console.error('Element not found:', elementType);
      return;
    }

    const elementConfig = {
      id: `${elementType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: element.element_type,
      field: element.field_mapping,
      position: { 
        x: 50 + Math.random() * Math.max(50, displayWidth - 300),
        y: 50 + Math.random() * Math.max(50, displayHeight - 200)
      },
      style: { 
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#333333',
        ...element.default_style
      }
    };

    console.log('🎨 Adding element to canvas:', elementConfig);
    addElementToCanvas(canvas, elementConfig, scale, formatName);
    
    // Update layout draft immediately
    updateLayoutDraft(canvas, formatName);
  }, [canvas, layoutElements, displayWidth, displayHeight, formatName, scale, updateLayoutDraft]);

  const handleDeleteSelected = useCallback(() => {
    if (!canvas || !selectedObject) {
      console.log('No canvas or selected object to delete');
      return;
    }

    const elementId = selectedObject.elementId || selectedObject.id;
    const fieldMapping = selectedObject.fieldMapping || selectedObject.field;
    
    console.log('🗑️ Deleting selected element:', { elementId, fieldMapping });
    
    // Mark element as deleted in session
    if (elementId) {
      addDeletedElement(elementId);
    }
    if (fieldMapping) {
      addDeletedElement(fieldMapping);
    }
    
    // Remove from canvas
    canvas.remove(selectedObject);
    canvas.renderAll();
    
    // Clear selection
    setSelectedObject(null);
    
    // Update layout draft
    updateLayoutDraft(canvas, formatName);
    
    toast.success('Elemento removido');
    console.log('✅ Element deleted successfully');
  }, [canvas, selectedObject, setSelectedObject, formatName, updateLayoutDraft, addDeletedElement]);

  const handleSaveLayout = useCallback(async () => {
    if (!canvas) {
      toast.error('Canvas não está disponível');
      return;
    }

    try {
      console.log('💾 Saving layout configuration...');
      
      const elements = serializeCanvasLayout(canvas, scale, formatName);
      console.log('📄 Serialized layout:', elements);
      
      const layoutConfig = {
        template_id: templateId,
        format_name: formatName,
        layout_config: {
          elements: elements
        }
      };

      await saveLayout(layoutConfig);
      
      // Update local draft
      setLayoutDraft(elements);
      
      if (onSave) {
        onSave();
      }
      
      console.log('✅ Layout saved successfully');
    } catch (error) {
      console.error('❌ Error saving layout:', error);
      toast.error('Erro ao salvar layout');
    }
  }, [canvas, scale, formatName, templateId, saveLayout, setLayoutDraft, onSave]);

  return {
    handleAddElement,
    handleDeleteSelected,
    handleSaveLayout
  };
};
