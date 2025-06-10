
import { useCallback } from 'react';
import * as fabric from 'fabric';
import { toast } from 'sonner';
import { addElementToCanvas } from '@/components/layout-editor/elementManager';
import { addTeacherPhotosToCanvas } from '../../utils/canvas/addTeacherPhotoToCanvas';

type FabricCanvas = fabric.Canvas;

interface UseCanvasElementLoaderProps {
  displayWidth: number;
  displayHeight: number;
  scale: number;
  setIsLoadingLayout: (loading: boolean) => void;
  setLoadingState: (state: any) => void;
  setLoadingError: (error: string | null) => void;
  getLayout: (templateId: string, formatName: string) => Promise<any>;
}

export const useCanvasElementLoader = ({
  displayWidth,
  displayHeight,
  scale,
  setIsLoadingLayout,
  setLoadingState,
  setLoadingError,
  getLayout
}: UseCanvasElementLoaderProps) => {

  const clearCanvasObjects = useCallback((fabricCanvas: FabricCanvas) => {
    console.log('🧹 Clearing canvas objects');
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      fabricCanvas.remove(obj);
    });
    fabricCanvas.renderAll();
  }, []);

  const addDefaultLayoutElements = useCallback((
    fabricCanvas: FabricCanvas, 
    format?: string,
    setupEventListeners?: (canvas: FabricCanvas, format?: string) => void,
    updateDraft?: (canvas: FabricCanvas, format?: string) => void
  ) => {
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
        type: 'text_box',
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

    if (setupEventListeners) {
      setupEventListeners(fabricCanvas, format);
    }
    if (updateDraft) {
      updateDraft(fabricCanvas, format);
    }
  }, [displayWidth, displayHeight, scale]);

  const loadLayoutElements = useCallback(async (
    fabricCanvas: FabricCanvas, 
    templateId: string, 
    formatName: string,
    setupEventListeners?: (canvas: FabricCanvas, format?: string) => void,
    updateDraft?: (canvas: FabricCanvas, format?: string) => void,
    isLoadingLayout?: boolean
  ) => {
    if (!fabricCanvas || isLoadingLayout) {
      console.warn('⚠️ Cannot load layout: canvas not available or already loading');
      return false;
    }

    // Log raw layout data and scale for bannerGCO
    if (formatName === 'bannerGCO') {
      const rawLayoutData = await getLayout(templateId, formatName);
      console.log('[bannerGCO] Raw layout data:', rawLayoutData);
      console.log('[bannerGCO] Scale factor:', scale);
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
        
        const uniqueElements = new Map();
existingLayout.layout_config.elements.forEach((element: any) => {
  const uniqueKey = `${element.field}-${element.type}`;
  if (!uniqueElements.has(uniqueKey)) {
    uniqueElements.set(uniqueKey, element);
  }
});

     console.log('✅ Final elements to load:', Array.from(uniqueElements.values()));
        
        const elementsToLoad = Array.from(uniqueElements.values());
        console.log('🔍 After deduplication:', elementsToLoad.length, 'unique elements');

        await addTeacherPhotosToCanvas(canvas, eventData.teacherImages || [], formatName, displayWidth, displayHeight);
        
        elementsToLoad.forEach((element: any) => {
          if (element.field === 'classTheme' && element.type !== 'text_box') {
           console.warn('⚠️ Corrigindo type de classTheme de', element.type, 'para text_box');
           element.type = 'text_box';
        }
          
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
        
        if (setupEventListeners) {
          setupEventListeners(fabricCanvas, formatName);
        }
        if (updateDraft) {
          updateDraft(fabricCanvas, formatName);
        }
        console.log('✅ Successfully loaded', elementsToLoad.length, 'elements from saved layout');
        toast.success(`Layout carregado: ${elementsToLoad.length} elementos`);
      } else {
        console.log('📋 No existing layout found, adding default elements');
        addDefaultLayoutElements(fabricCanvas, formatName, setupEventListeners, updateDraft);
        toast.info('Layout padrão aplicado');
      }
      
      setLoadingState('ready');
      return true;
    } catch (error) {
      console.error('❌ Error loading layout:', error);
      setLoadingError(`Erro ao carregar layout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      console.log('🔄 Falling back to default layout');
      addDefaultLayoutElements(fabricCanvas, formatName, setupEventListeners, updateDraft);
      setLoadingState('ready');
      toast.error('Erro ao carregar layout salvo, usando layout padrão');
      return false;
    } finally {
      setIsLoadingLayout(false);
    }
  }, [setIsLoadingLayout, setLoadingState, setLoadingError, clearCanvasObjects, getLayout, addDefaultLayoutElements, scale]);

  return {
    loadLayoutElements,
    addDefaultLayoutElements,
    clearCanvasObjects
  };
};
