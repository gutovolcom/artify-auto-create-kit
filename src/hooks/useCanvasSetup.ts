
import { useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { loadBackgroundImage } from '@/components/layout-editor/canvasOperations';

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
}

export const useCanvasSetup = ({
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  onCanvasReady,
  onSelectionChange,
  onDeleteSelected,
  onBackgroundLoaded
}: UseCanvasSetupProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const backgroundLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to store the latest callback functions
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onDeleteSelectedRef = useRef(onDeleteSelected);
  const onBackgroundLoadedRef = useRef(onBackgroundLoaded);
  
  // Update refs when callbacks change
  onSelectionChangeRef.current = onSelectionChange;
  onDeleteSelectedRef.current = onDeleteSelected;
  onBackgroundLoadedRef.current = onBackgroundLoaded;

  // Function to load background with fallback mechanism
  const loadBackgroundWithFallback = (fabricCanvas: FabricCanvas, imageUrl: string) => {
    console.log('Loading background image with fallback:', imageUrl);
    
    // Set up a timeout fallback
    backgroundLoadTimeoutRef.current = setTimeout(() => {
      console.log('Background loading timeout reached, proceeding anyway');
      onBackgroundLoadedRef.current?.();
    }, 3000); // 3 second timeout

    loadBackgroundImage(fabricCanvas, imageUrl, scale)
      .then(() => {
        console.log('Background image loaded successfully');
        if (backgroundLoadTimeoutRef.current) {
          clearTimeout(backgroundLoadTimeoutRef.current);
          backgroundLoadTimeoutRef.current = null;
        }
        onBackgroundLoadedRef.current?.();
      })
      .catch((error) => {
        console.error('Error loading background image:', error);
        fabricCanvas.backgroundColor = '#f5f5f5';
        fabricCanvas.renderAll();
        if (backgroundLoadTimeoutRef.current) {
          clearTimeout(backgroundLoadTimeoutRef.current);
          backgroundLoadTimeoutRef.current = null;
        }
        onBackgroundLoadedRef.current?.();
      });
  };

  // Initialize canvas only once
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    console.log('Initializing Fabric.js canvas with dimensions:', displayWidth, 'x', displayHeight);

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: '#f5f5f5'
    });

    // Set up event listeners
    fabricCanvas.on('selection:created', (e) => {
      onSelectionChangeRef.current(e.selected?.[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      onSelectionChangeRef.current(e.selected?.[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      onSelectionChangeRef.current(null);
    });

    fabricCanvas.on('object:modified', (e) => {
      console.log('Object modified:', {
        target: e.target,
        left: e.target?.left,
        top: e.target?.top
      });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSelectedRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    fabricCanvasRef.current = fabricCanvas;
    
    // Notify parent that canvas is ready
    onCanvasReady(fabricCanvas);

    // Load background image immediately after canvas creation
    if (backgroundImageUrl) {
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
  }, []); // Only run once

  // Handle background image changes separately
  useEffect(() => {
    if (!fabricCanvasRef.current || !backgroundImageUrl) return;

    console.log('Background image URL changed:', backgroundImageUrl);
    loadBackgroundWithFallback(fabricCanvasRef.current, backgroundImageUrl);
  }, [backgroundImageUrl, scale]);

  return { canvasRef };
};
