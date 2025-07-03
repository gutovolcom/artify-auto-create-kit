
import { useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { loadBackgroundImage } from '@/components/layout-editor/backgroundLoader';
import { batchLoadFonts, ensureFontLoaded, FontConfig } from '@/utils/canvas/fontLoader';

type FabricCanvas = fabric.Canvas;

interface UseCanvasSetupProps {
  displayWidth: number;
  displayHeight: number;
  backgroundImageUrl: string;
  scale: number;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onSelectionChange: (object: any) => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded?: () => void;
  setupEventHandlers?: (canvas: FabricCanvas, format?: string) => void;
}

export const useCanvasSetup = ({
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  onCanvasReady,
  onSelectionChange,
  onDeleteSelected,
  onBackgroundLoaded,
  setupEventHandlers
}: UseCanvasSetupProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const backgroundLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousBackgroundRef = useRef<string>('');
  
  // Use refs to store the latest callback functions
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onDeleteSelectedRef = useRef(onDeleteSelected);
  const onBackgroundLoadedRef = useRef(onBackgroundLoaded);
  const setupEventHandlersRef = useRef(setupEventHandlers);
  
  // Update refs when callbacks change
  onSelectionChangeRef.current = onSelectionChange;
  onDeleteSelectedRef.current = onDeleteSelected;
  onBackgroundLoadedRef.current = onBackgroundLoaded;
  setupEventHandlersRef.current = setupEventHandlers;

  // Preload essential fonts
  const preloadFonts = async () => {
    const essentialFonts: FontConfig[] = [
      { family: 'Arial', size: 16 },
      { family: 'Arial', size: 20 },
      { family: 'Arial', size: 24 },
      { family: 'Helvetica', size: 16 },
      { family: 'Helvetica', size: 20 },
      { family: 'Times New Roman', size: 16 },
      { family: 'Times New Roman', size: 20 }
    ];

    console.log('🔤 Preloading essential fonts...');
    const results = await batchLoadFonts(essentialFonts);
    const loadedCount = results.filter(Boolean).length;
    console.log(`✅ Preloaded ${loadedCount}/${essentialFonts.length} fonts`);
  };

  // Function to load background with fallback mechanism
  const loadBackgroundWithFallback = async (fabricCanvas: FabricCanvas, imageUrl: string) => {
    console.log('Loading background image with fallback:', imageUrl);
    
    // Set up a timeout fallback
    backgroundLoadTimeoutRef.current = setTimeout(() => {
      console.log('Background loading timeout reached, proceeding anyway');
      onBackgroundLoadedRef.current?.();
    }, 3000); // 3 second timeout

    try {
      await loadBackgroundImage(fabricCanvas, imageUrl, scale);
      console.log('Background image loaded successfully');
      if (backgroundLoadTimeoutRef.current) {
        clearTimeout(backgroundLoadTimeoutRef.current);
        backgroundLoadTimeoutRef.current = null;
      }
      onBackgroundLoadedRef.current?.();
    } catch (error) {
      console.error('Error loading background image:', error);
      fabricCanvas.backgroundColor = '#f5f5f5';
      fabricCanvas.renderAll();
      if (backgroundLoadTimeoutRef.current) {
        clearTimeout(backgroundLoadTimeoutRef.current);
        backgroundLoadTimeoutRef.current = null;
      }
      onBackgroundLoadedRef.current?.();
    }
  };

  // Enhanced keyboard handler for arrow key movement
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();
    
    // Arrow key movement
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (activeObject) {
        e.preventDefault();
        
        const step = e.shiftKey ? 10 : 1; // 10px with Shift, 1px without
        const currentLeft = activeObject.left || 0;
        const currentTop = activeObject.top || 0;
        
        switch (e.key) {
          case 'ArrowLeft':
            activeObject.set('left', Math.max(0, currentLeft - step));
            break;
          case 'ArrowRight':
            activeObject.set('left', currentLeft + step);
            break;
          case 'ArrowUp':
            activeObject.set('top', Math.max(0, currentTop - step));
            break;
          case 'ArrowDown':
            activeObject.set('top', currentTop + step);
            break;
        }
        
        activeObject.setCoords();
        canvas.fire('object:modified', { target: activeObject });
        canvas.renderAll();
        console.log(`Moved element by ${step}px with arrow keys`);
      }
    }
    
    // Delete/Backspace for deletion
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDeleteSelectedRef.current();
    }
  };

  // Initialize canvas only once
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    console.log('Initializing Fabric.js canvas with dimensions:', displayWidth, 'x', displayHeight);

    // Preload fonts before creating canvas
    preloadFonts().then(() => {
      const fabricCanvas = new fabric.Canvas(canvasRef.current!, {
        width: displayWidth,
        height: displayHeight,
        backgroundColor: '#f5f5f5'
      });

      // Set up basic event listeners for selection
      fabricCanvas.on('selection:created', (e) => {
        onSelectionChangeRef.current(e.selected?.[0]);
      });

      fabricCanvas.on('selection:updated', (e) => {
        onSelectionChangeRef.current(e.selected?.[0]);
      });

      fabricCanvas.on('selection:cleared', () => {
        onSelectionChangeRef.current(null);
      });

      // Set up enhanced event handlers if provided
      if (setupEventHandlersRef.current) {
        setupEventHandlersRef.current(fabricCanvas);
      }

      document.addEventListener('keydown', handleKeyDown);
      fabricCanvasRef.current = fabricCanvas;
      
      // Notify parent that canvas is ready
      onCanvasReady(fabricCanvas);

      // Load background image immediately after canvas creation
      if (backgroundImageUrl) {
        previousBackgroundRef.current = backgroundImageUrl;
        loadBackgroundWithFallback(fabricCanvas, backgroundImageUrl);
      } else {
        // No background, trigger callback immediately
        setTimeout(() => {
          onBackgroundLoadedRef.current?.();
        }, 100);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (backgroundLoadTimeoutRef.current) {
          clearTimeout(backgroundLoadTimeoutRef.current);
        }
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
      };
    });
  }, []); // Only run once

  // Handle background image changes separately with proper change detection
  useEffect(() => {
    if (!fabricCanvasRef.current || !backgroundImageUrl) return;
    
    // Only reload if the URL actually changed
    if (previousBackgroundRef.current !== backgroundImageUrl) {
      console.log('Background image URL changed from', previousBackgroundRef.current, 'to', backgroundImageUrl);
      previousBackgroundRef.current = backgroundImageUrl;
      loadBackgroundWithFallback(fabricCanvasRef.current, backgroundImageUrl);
    }
  }, [backgroundImageUrl, scale]);

  return { canvasRef };
};
