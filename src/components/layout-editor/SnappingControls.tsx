
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Magnet, Grid3X3, Move } from 'lucide-react';
import { useCanvasSnapping } from '@/hooks/useCanvasSnapping';

export const SnappingControls: React.FC = () => {
  const { config, updateConfig, toggleSnapping } = useCanvasSnapping();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Magnet className="h-4 w-4" />
          Alinhamento e Snap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Snapping */}
        <div className="flex items-center justify-between">
          <Label htmlFor="snapping-enabled" className="text-xs">
            Ativar Snap
          </Label>
          <Switch
            id="snapping-enabled"
            checked={config.enabled}
            onCheckedChange={toggleSnapping}
          />
        </div>

        {config.enabled && (
          <>
            {/* Show Guides */}
            <div className="flex items-center justify-between">
              <Label htmlFor="show-guides" className="text-xs">
                Mostrar Guias
              </Label>
              <Switch
                id="show-guides"
                checked={config.showGuides}
                onCheckedChange={(checked) => updateConfig({ showGuides: checked })}
              />
            </div>

            {/* Snap Threshold */}
            <div className="space-y-2">
              <Label className="text-xs">
                Sensibilidade: {config.threshold}px
              </Label>
              <Slider
                value={[config.threshold]}
                onValueChange={(value) => updateConfig({ threshold: value[0] })}
                max={20}
                min={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Snap Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="snap-objects" className="text-xs flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Snap com Objetos
                </Label>
                <Switch
                  id="snap-objects"
                  checked={config.snapToObjects}
                  onCheckedChange={(checked) => updateConfig({ snapToObjects: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="snap-canvas" className="text-xs flex items-center gap-1">
                  <Grid3X3 className="h-3 w-3" />
                  Snap com Canvas
                </Label>
                <Switch
                  id="snap-canvas"
                  checked={config.snapToCanvas}
                  onCheckedChange={(checked) => updateConfig({ snapToCanvas: checked })}
                />
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSnapping}
            className="w-full text-xs"
          >
            {config.enabled ? 'Desativar Snap' : 'Ativar Snap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
