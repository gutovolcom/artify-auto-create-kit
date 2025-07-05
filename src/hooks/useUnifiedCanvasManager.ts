import { 
  useRef, 
  useEffect, 
  useCallback, 
  useState 
} from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { 
  CanvasConfig, 
  CanvasManagerState, 
  CanvasManagerActions,
  UnifiedCanvasElement,
  SerializedLayout,
  CanvasMode
} from '@/types/canvas';
import { UnifiedElementSystem } from '@/utils/canvas/unifiedElementSystem';
import { LayoutSerializationService } from '@/utils/canvas/layoutSerializationService';
import { CanvasConfigFactory } from '@/utils/canvas/canvasConfigFactory';

export interface UnifiedCanvasManagerProps {
  mode: CanvasMode;
  width: number;
  height: number;
  format: string;
  scale: number;
  backgroundImageUrl?: string;
  onCanvasReady?: (canvas: FabricCanvas) => void;
  onElementChange?: (elements: UnifiedCanvasElement[]) => void;
  onError?: (error: string) => void;
  customConfig?: Partial<CanvasConfig>;
}

export const useUnifiedCanvasManager = (props: UnifiedCanvasManagerProps) => {
  const {
    mode,
    width,
    height,
    format,
    scale,
    backgroundImageUrl,
    onCanvasReady,
    onElementChange,
    onError,
    customConfig
  } = props;

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const elementSystemRef = useRef<UnifiedElementSystem | null>(null);
  const serializationServiceRef = useRef<LayoutSerializationService | null>(null);

  // State
  const [state, setState] = useState<CanvasManagerState>({
    canvas: null,
    isReady: false,
    isLoading: false,
    error: null
  });

  /**
   * Initialize canvas with configuration
   */
  const initializeCanvas = useCallback(async (
    canvasElement: HTMLCanvasElement,
    config: CanvasConfig
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Create Fabric canvas
      const fabricCanvas = new FabricCanvas(canvasElement, {
        width: config.width,
        height: config.height,
        backgroundColor: config.backgroundColor,
        selection: config.selection,
        interactive: config.interactive,
        preserveObjectStacking: config.preserveObjectStacking,
        renderOnAddRemove: config.renderOnAddRemove
      });

      // Initialize services
      const elementSystem = new UnifiedElementSystem(scale, format);
      const serializationService = new LayoutSerializationService(
        elementSystem.getScalingService(),
        elementSystem.getValidationService(),
        format
      );

      // Store references
      fabricCanvasRef.current = fabricCanvas;
      elementSystemRef.current = elementSystem;
      serializationServiceRef.current = serializationService;

      // Setup event listeners
      setupEventListeners(fabricCanvas);

      // Load background if provided
      if (backgroundImageUrl) {
        await loadBackgroundImage(fabricCanvas, backgroundImageUrl);
      }

      // Update state
      setState(prev => ({
        ...prev,
        canvas: fabricCanvas,
        isReady: true,
        isLoading: false
      }));

      // Notify parent
      onCanvasReady?.(fabricCanvas);

      console.log('✅ Canvas initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize canvas';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
      console.error('Error initializing canvas:', error);
    }
  }, [scale, format, backgroundImageUrl, onCanvasReady, onError]);

  /**
   * Setup canvas event listeners
   */
  const setupEventListeners = useCallback((canvas: FabricCanvas) => {
    const handleObjectModified = () => {
      if (onElementChange) {
        const elements = extractElementsFromCanvas(canvas);
        onElementChange(elements);
      }
    };

    const handleSelectionCreated = (e: any) => {
      console.log('Selection created:', e.selected);
    };

    const handleSelectionCleared = () => {
      console.log('Selection cleared');
    };

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:moving', handleObjectModified);
    canvas.on('object:scaling', handleObjectModified);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:cleared', handleSelectionCleared);

    console.log('✅ Canvas event listeners setup');
  }, [onElementChange]);

  /**
   * Load background image
   */
  const loadBackgroundImage = useCallback(async (
    canvas: FabricCanvas,
    imageUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        if (canvas.width && canvas.height) {
          const scaleX = canvas.width / (img.width || 1);
          const scaleY = canvas.height / (img.height || 1);
          
          img.set({
            scaleX,
            scaleY,
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            excludeFromExport: false
          });
        }
        
        canvas.backgroundImage = img;
        canvas.renderAll();
        resolve();
      }).catch(reject);
    });
  }, []);

  /**
   * Extract elements from canvas
   */
  const extractElementsFromCanvas = useCallback((canvas: FabricCanvas): UnifiedCanvasElement[] => {
    return canvas.getObjects().map(obj => ({
      id: (obj as any).elementId || 'unknown',
      field: (obj as any).fieldMapping || 'unknown',
      type: (obj as any).elementType || 'text',
      position: { x: obj.left || 0, y: obj.top || 0 },
      size: { 
        width: (obj.width || 100) * (obj.scaleX || 1), 
        height: (obj.height || 50) * (obj.scaleY || 1) 
      },
      mode
    }));
  }, [mode]);

  /**
   * Add element to canvas
   */
  const addElement = useCallback(async (element: UnifiedCanvasElement): Promise<void> => {
    if (!fabricCanvasRef.current || !elementSystemRef.current) {
      console.error('Canvas not initialized');
      return;
    }

    try {
      const context = {
        mode,
        canvas: fabricCanvasRef.current,
        scale,
        format,
        displayWidth: width,
        displayHeight: height
      };

      await elementSystemRef.current.addElementToCanvas(element, context);
      
      if (onElementChange) {
        const elements = extractElementsFromCanvas(fabricCanvasRef.current);
        onElementChange(elements);
      }
    } catch (error) {
      console.error('Error adding element:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to add element');
    }
  }, [mode, scale, format, width, height, onElementChange, onError, extractElementsFromCanvas]);

  /**
   * Remove element from canvas
   */
  const removeElement = useCallback((elementId: string): void => {
    if (!fabricCanvasRef.current) {
      console.error('Canvas not initialized');
      return;
    }

    const objects = fabricCanvasRef.current.getObjects();
    const elementToRemove = objects.find(obj => (obj as any).elementId === elementId);

    if (elementToRemove) {
      fabricCanvasRef.current.remove(elementToRemove);
      fabricCanvasRef.current.renderAll();

      if (onElementChange) {
        const elements = extractElementsFromCanvas(fabricCanvasRef.current);
        onElementChange(elements);
      }
    }
  }, [onElementChange, extractElementsFromCanvas]);

  /**
   * Serialize current layout
   */
  const serializeLayout = useCallback((): SerializedLayout => {
    if (!fabricCanvasRef.current || !serializationServiceRef.current) {
      console.error('Canvas not initialized');
      return {
        format,
        elements: [],
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          canvasSize: { width, height },
          scale
        }
      };
    }

    return serializationServiceRef.current.serialize(fabricCanvasRef.current);
  }, [format, width, height, scale]);

  /**
   * Deserialize layout to canvas
   */
  const deserializeLayout = useCallback(async (layout: SerializedLayout): Promise<void> => {
    if (!fabricCanvasRef.current || !serializationServiceRef.current) {
      console.error('Canvas not initialized');
      return;
    }

    try {
      await serializationServiceRef.current.deserialize(layout, fabricCanvasRef.current);
      
      if (onElementChange) {
        const elements = extractElementsFromCanvas(fabricCanvasRef.current);
        onElementChange(elements);
      }
    } catch (error) {
      console.error('Error deserializing layout:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to deserialize layout');
    }
  }, [onElementChange, onError, extractElementsFromCanvas]);

  /**
   * Cleanup canvas and services
   */
  const cleanup = useCallback((): void => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    elementSystemRef.current = null;
    serializationServiceRef.current = null;

    setState({
      canvas: null,
      isReady: false,
      isLoading: false,
      error: null
    });

    console.log('✅ Canvas cleanup completed');
  }, []);

  /**
   * Update scale for all services
   */
  const updateScale = useCallback((newScale: number): void => {
    if (elementSystemRef.current) {
      elementSystemRef.current.updateScale(newScale);
    }
  }, []);

  // Initialize canvas when element is ready
  useEffect(() => {
    if (canvasRef.current && !state.isReady && !state.isLoading) {
      const config = CanvasConfigFactory.createConfigForMode(
        mode,
        width,
        height,
        customConfig
      );
      
      initializeCanvas(canvasRef.current, config);
    }
  }, [canvasRef.current, state.isReady, state.isLoading, mode, width, height, customConfig, initializeCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Update scale when it changes
  useEffect(() => {
    updateScale(scale);
  }, [scale, updateScale]);

  // Update background when it changes
  useEffect(() => {
    if (fabricCanvasRef.current && backgroundImageUrl) {
      loadBackgroundImage(fabricCanvasRef.current, backgroundImageUrl);
    }
  }, [backgroundImageUrl, loadBackgroundImage]);

  return {
    // Canvas ref for mounting
    canvasRef,
    
    // State
    ...state,
    
    // Actions
    addElement,
    removeElement,
    serializeLayout,
    deserializeLayout,
    cleanup,
    updateScale
  };
}; 