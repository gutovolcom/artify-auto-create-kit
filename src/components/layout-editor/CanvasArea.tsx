
import React, { useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Save } from 'lucide-react';
import { loadBackgroundImage } from './canvasOperations';

type FabricCanvas = fabric.Canvas;

interface CanvasAreaProps {
  formatName: string;
  formatDimensions: { width: number; height: number };
  displayWidth: number;
  displayHeight: number;
  backgroundImageUrl: string;
  scale: number;
  canvas: FabricCanvas | null;
  selectedObject: any;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onSelectionChange: (object: any) => void;
  onSave: () => void;
  onDeleteSelected: () => void;
  onBackgroundLoaded?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  formatName,
  formatDimensions,
  displayWidth,
  displayHeight,
  backgroundImageUrl,
  scale,
  canvas,
  selectedObject,
  onCanvasReady,
  onSelectionChange,
  onSave,
  onDeleteSelected,
  onBackgroundLoaded
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  // Use refs to store the latest callback functions
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onDeleteSelectedRef = useRef(onDeleteSelected);
  const onBackgroundLoadedRef = useRef(onBackgroundLoaded);
  
  // Update refs when callbacks change
  onSelectionChangeRef.current = onSelectionChange;
  onDeleteSelectedRef.current = onDeleteSelected;
  onBackgroundLoadedRef.current = onBackgroundLoaded;

  // Initialize canvas only once
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    console.log('Initializing Fabric.js canvas with dimensions:', displayWidth, 'x', displayHeight);
    console.log('Format dimensions:', formatDimensions);
    console.log('Scale factor:', scale);

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: '#f5f5f5'
    });

    // Load background image if provided
    if (backgroundImageUrl) {
      console.log('Loading background image during canvas initialization:', backgroundImageUrl);
      loadBackgroundImage(fabricCanvas, backgroundImageUrl, scale)
        .then(() => {
          console.log('Background image loaded successfully');
          onBackgroundLoadedRef.current?.();
        })
        .catch((error) => {
          console.error('Error loading background image:', error);
          fabricCanvas.backgroundColor = '#f5f5f5';
          fabricCanvas.renderAll();
          onBackgroundLoadedRef.current?.();
        });
    } else {
      onBackgroundLoadedRef.current?.();
    }

    fabricCanvas.on('selection:created', (e) => {
      console.log('Object selected:', e.selected?.[0]);
      onSelectionChangeRef.current(e.selected?.[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      console.log('Selection updated:', e.selected?.[0]);
      onSelectionChangeRef.current(e.selected?.[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      console.log('Selection cleared');
      onSelectionChangeRef.current(null);
    });

    fabricCanvas.on('object:modified', (e) => {
      console.log('Object modified:', {
        target: e.target,
        left: e.target?.left,
        top: e.target?.top,
        scaleX: e.target?.scaleX,
        scaleY: e.target?.scaleY
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
    onCanvasReady(fabricCanvas);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []); // Only run once

  // Handle background image changes separately to avoid canvas recreation
  useEffect(() => {
    if (!fabricCanvasRef.current || !backgroundImageUrl) return;

    console.log('Background image URL changed, updating background:', backgroundImageUrl);
    loadBackgroundImage(fabricCanvasRef.current, backgroundImageUrl, scale)
      .then(() => {
        console.log('Background image updated successfully');
        onBackgroundLoadedRef.current?.();
      })
      .catch((error) => {
        console.error('Error updating background image:', error);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.backgroundColor = '#f5f5f5';
          fabricCanvasRef.current.renderAll();
        }
        onBackgroundLoadedRef.current?.();
      });
  }, [backgroundImageUrl, scale]);

  return (
    <div className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>
            Layout Editor - {formatName} ({formatDimensions.width}x{formatDimensions.height})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <canvas 
              ref={canvasRef} 
              className="border rounded shadow-sm" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Button onClick={onSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Layout
            </Button>
            
            {selectedObject && (
              <Button 
                variant="destructive" 
                onClick={onDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash className="h-4 w-4" />
                Remover Elemento
              </Button>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            <p>• Use as setas do teclado para mover elementos selecionados</p>
            <p>• Delete/Backspace para remover elemento selecionado</p>
            <p>• Arraste os cantos para redimensionar</p>
            <p>• Canvas: {displayWidth}x{displayHeight} (escala: {scale.toFixed(2)})</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
