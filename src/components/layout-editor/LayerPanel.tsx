import React, { useEffect, useState } from 'react';
import type { Canvas } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface LayerPanelProps {
  canvas: Canvas | null;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ canvas }) => {
  const [objects, setObjects] = useState<any[]>([]);

  useEffect(() => {
    if (!canvas) return;

    const updateObjects = () => setObjects([...canvas.getObjects()]);

    updateObjects();

    const onObjectAdded = () => updateObjects();
    const onObjectRemoved = () => updateObjects();

    canvas.on('object:added', onObjectAdded);
    canvas.on('object:removed', onObjectRemoved);

    return () => {
      canvas.off('object:added', onObjectAdded);
      canvas.off('object:removed', onObjectRemoved);
    };
  }, [canvas]);

  const bringForward = (obj: any) => {
    if (!canvas) return;
    canvas.bringForward(obj);
    setObjects([...canvas.getObjects()]);
  };

  const sendBackward = (obj: any) => {
    if (!canvas) return;
    canvas.sendBackwards(obj);
    setObjects([...canvas.getObjects()]);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Camadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {objects.map((obj, index) => (
          <div
            key={obj.elementId || index}
            className="flex items-center justify-between gap-2"
          >
            <span className="text-sm">
              {obj.fieldMapping || obj.type || `Objeto ${index + 1}`}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bringForward(obj)}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendBackward(obj)}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {objects.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum objeto no canvas.</p>
        )}
      </CardContent>
    </Card>
  );
};
