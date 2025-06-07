
import React, { useEffect, useState } from 'react';
import { Canvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface LayerPanelProps {
  canvas: Canvas | null;
  canvasVersion: number;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ canvas, canvasVersion }) => {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    if (canvas) {
      setElements(canvas.getObjects().slice().reverse());
    }
  }, [canvas, canvasVersion]);

  const bringForward = (obj: any) => {
    if (canvas) {
      canvas.bringObjectForward(obj);
      canvas.renderAll();
      setElements(canvas.getObjects().slice().reverse());
    }
  };

  const sendBackwards = (obj: any) => {
    if (canvas) {
      canvas.sendObjectBackwards(obj);
      canvas.renderAll();
      setElements(canvas.getObjects().slice().reverse());
    }
  };

  if (!canvas) {
    return <div className="p-2 text-sm text-gray-500">Canvas not available.</div>;
  }

  if (elements.length === 0) {
    return <div className="p-2 text-sm text-gray-500">No elements on canvas.</div>;
  }

  return (
    <div className="mt-4 p-2 border rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Layers</h3>
      <ul className="space-y-1">
        {elements.map((element, index) => {
          const name = (element as any).fieldMapping ||
                       (element as any).elementType ||
                       element.type ||
                       `Element ${elements.length - index}`;

          const isTop = index === 0;
          const isBottom = index === elements.length - 1;

          return (
            <li
              key={(element as any).elementId || index}
              className="flex items-center justify-between p-2 border-b text-sm"
            >
              <span>{name}</span>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bringForward(element)}
                  disabled={isTop}
                  title="Bring Forward"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendBackwards(element)}
                  disabled={isBottom}
                  title="Send Backward"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LayerPanel;
