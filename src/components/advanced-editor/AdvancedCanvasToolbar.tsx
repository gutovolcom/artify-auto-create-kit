
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Undo2, 
  Redo2, 
  Save, 
  Trash2, 
  Copy, 
  Clipboard,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';

interface AdvancedCanvasToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  selectedObject: any;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onDeleteSelected: () => void;
  onSaveState: () => void;
}

export const AdvancedCanvasToolbar: React.FC<AdvancedCanvasToolbarProps> = ({
  canUndo,
  canRedo,
  selectedObject,
  onUndo,
  onRedo,
  onSave,
  onDeleteSelected,
  onSaveState
}) => {
  const handleCopy = () => {
    if (selectedObject) {
      // Copy functionality would be implemented here
      console.log('Copy selected object');
      onSaveState();
    }
  };

  const handlePaste = () => {
    // Paste functionality would be implemented here
    console.log('Paste object');
    onSaveState();
  };

  const handleRotateLeft = () => {
    if (selectedObject) {
      selectedObject.rotate(selectedObject.angle - 90);
      selectedObject.canvas?.renderAll();
      onSaveState();
    }
  };

  const handleRotateRight = () => {
    if (selectedObject) {
      selectedObject.rotate(selectedObject.angle + 90);
      selectedObject.canvas?.renderAll();
      onSaveState();
    }
  };

  const handleFlipHorizontal = () => {
    if (selectedObject) {
      selectedObject.set('flipX', !selectedObject.flipX);
      selectedObject.canvas?.renderAll();
      onSaveState();
    }
  };

  const handleFlipVertical = () => {
    if (selectedObject) {
      selectedObject.set('flipY', !selectedObject.flipY);
      selectedObject.canvas?.renderAll();
      onSaveState();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* File Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          title="Save Layout (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!selectedObject}
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePaste}
          title="Paste (Ctrl+V)"
        >
          <Clipboard className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteSelected}
          disabled={!selectedObject}
          title="Delete (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {selectedObject && (
        <>
          <Separator orientation="vertical" className="h-6" />

          {/* Transform Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotateLeft}
              title="Rotate Left"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotateRight}
              title="Rotate Right"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlipHorizontal}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlipVertical}
              title="Flip Vertical"
            >
              <FlipVertical className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* Status Badge */}
      <div className="ml-auto">
        <Badge variant={selectedObject ? "default" : "secondary"}>
          {selectedObject ? `Selected: ${selectedObject.type || 'Object'}` : 'No Selection'}
        </Badge>
      </div>
    </div>
  );
};
