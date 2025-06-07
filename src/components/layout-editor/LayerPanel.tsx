import React, { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button'; // Assuming this is your button component path
import { ChevronUp, ChevronDown } from 'lucide-react'; // Assuming icon usage

interface LayerPanelProps {
  canvas: fabric.Canvas | null;
  // This prop is used to force a re-render when canvas objects change externally
  // Increment it when objects are added, removed, or layers are reordered by other means.
  canvasVersion: number;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ canvas, canvasVersion }) => {
  const [elements, setElements] = useState<fabric.Object[]>([]);

  useEffect(() => {
    if (canvas) {
      // Fabric's getObjects() returns objects in bottom-to-top order.
      // We want to display them top-to-bottom for typical layer UI.
      setElements(canvas.getObjects().slice().reverse());
    }
  }, [canvas, canvasVersion]); // Re-run when canvas instance or its version changes

  const bringForward = (obj: fabric.Object) => {
    if (canvas) {
      canvas.bringForward(obj);
      canvas.renderAll();
      // Trigger a refresh of the panel by updating elements state based on new order
      setElements(canvas.getObjects().slice().reverse());
      // Potentially, notify parent to update canvasVersion if other components depend on it.
    }
  };

  const sendBackwards = (obj: fabric.Object) => {
    if (canvas) {
      canvas.sendBackwards(obj);
      canvas.renderAll();
      // Trigger a refresh of the panel
      setElements(canvas.getObjects().slice().reverse());
      // Potentially, notify parent to update canvasVersion.
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
          // Try to get a meaningful name, fallback to type/index
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
