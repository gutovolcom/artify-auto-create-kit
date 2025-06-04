
import React, { useRef, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

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
  backgroundImageUrl,
  canvas,
  selectedObject,
  onCanvasReady,
  onSelectionChange,
  onSave,
  onDeleteSelected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: '#f5f5f5'
    });

    fabricCanvas.on('selection:created', (e) => {
      onSelectionChange(e.selected?.[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      onSelectionChange(e.selected?.[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      onSelectionChange(null);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    onCanvasReady(fabricCanvas);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      fabricCanvas.dispose();
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
          <div className="border rounded-lg p-4 bg-gray-50">
            <canvas ref={canvasRef} className="border" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={onSave}>
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
        </CardContent>
      </Card>
    </div>
  );
};
