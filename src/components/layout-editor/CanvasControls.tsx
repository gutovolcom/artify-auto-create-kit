
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Save, Undo2, Redo2 } from 'lucide-react';

interface CanvasControlsProps {
  selectedObject: any;
  onSave: () => void;
  onDeleteSelected: () => void;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  selectedObject,
  onSave,
  onDeleteSelected,
  displayWidth,
  displayHeight,
  scale,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
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

        {onUndo && (
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Undo2 className="h-4 w-4" />
            Desfazer
          </Button>
        )}

        {onRedo && (
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Redo2 className="h-4 w-4" />
            Refazer
          </Button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <p>• Use as setas do teclado para mover elementos selecionados</p>
        <p>• Delete/Backspace para remover elemento selecionado</p>
        <p>• Arraste os cantos para redimensionar</p>
        <p>• Canvas: {displayWidth}x{displayHeight} (escala: {scale.toFixed(2)})</p>
      </div>
    </>
  );
};
