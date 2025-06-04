import React, { useRef, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Save } from 'lucide-react';

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
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  formatName,
  formatDimensions,
  displayWidth,
  displayHeight,
  scale,
  canvas,
  selectedObject,
  onCanvasReady,
  onSelectionChange,
  onSave,
  onDeleteSelected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    console.log('Initializing Fabric.js canvas');

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: '#f5f5f5'
    });

    fabricCanvas.on('selection:created', (e) => {
      console.log('Selection created:', e.selected?.[0]);
      onSelectionChange(e.selected?.[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      console.log('Selection updated:', e.selected?.[0]);
      onSelectionChange(e.selected?.[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      console.log('Selection cleared');
      onSelectionChange(null);
    });

    fabricCanvas.on('object:moving', (e) => {
      console.log('Object moving:', e.target);
    });

    fabricCanvas.on('object:scaling', (e) => {
      console.log('Object scaling:', e.target);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSelected();
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
  }, [displayWidth, displayHeight, onCanvasReady, onSelectionChange, onDeleteSelected]);

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
            
            <div className="ml-auto text-sm text-gray-500">
              Escala: {Math.round(scale * 100)}%
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            <p>• Use as setas do teclado para mover elementos selecionados</p>
            <p>• Delete/Backspace para remover elemento selecionado</p>
            <p>• Arraste os cantos para redimensionar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
