
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignVerticalJustifyStart, 
  AlignVerticalJustifyCenter, 
  AlignVerticalJustifyEnd,
  Move
} from 'lucide-react';
import * as fabric from 'fabric';
import { alignObjectToCanvas } from './alignmentUtils';

type FabricCanvas = fabric.Canvas;

interface AlignmentControlsProps {
  canvas: FabricCanvas | null;
  selectedObject: fabric.FabricObject | null;
  onUpdate?: () => void;
}

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({
  canvas,
  selectedObject,
  onUpdate
}) => {
  if (!selectedObject || !canvas) return null;

  const handleAlign = (alignment: string) => {
    alignObjectToCanvas(canvas, selectedObject, alignment as any);
    onUpdate?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Move className="w-4 h-4 text-primary" />
        <span className="font-semibold text-gray-700">Alinhamento Rápido</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('left')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <AlignLeft className="w-3 h-3" />
          <span className="text-xs">Esquerda</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('center-h')}
          className="flex flex-col items-center gap-1 h-auto py-2 border-primary/30 bg-primary/5"
        >
          <AlignCenter className="w-3 h-3" />
          <span className="text-xs">Centro H</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('right')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <AlignRight className="w-3 h-3" />
          <span className="text-xs">Direita</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('top')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <AlignVerticalJustifyStart className="w-3 h-3" />
          <span className="text-xs">Topo</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('center-v')}
          className="flex flex-col items-center gap-1 h-auto py-2 border-primary/30 bg-primary/5"
        >
          <AlignVerticalJustifyCenter className="w-3 h-3" />
          <span className="text-xs">Centro V</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAlign('bottom')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <AlignVerticalJustifyEnd className="w-3 h-3" />
          <span className="text-xs">Inferior</span>
        </Button>
      </div>
      
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          handleAlign('center-h');
          setTimeout(() => handleAlign('center-v'), 100);
        }}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      >
        <Move className="w-3 h-3 mr-2" />
        Centralizar no Canvas
      </Button>
    </div>
  );
};
