
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash } from 'lucide-react';
import { 
  getSelectedElementField, 
  elementNeedsOnlyPositionAndSize,
  getCurrentFontSize,
  getCurrentFontFamily,
  availableFonts
} from './utils';

interface PropertiesPanelProps {
  selectedObject: any;
  scale: number;
  onUpdateObject: (property: string, value: any) => void;
  onDeleteSelected: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  scale,
  onUpdateObject,
  onDeleteSelected
}) => {
  if (!selectedObject) return null;

  const field = getSelectedElementField(selectedObject);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Propriedades
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDeleteSelected}
            className="flex items-center gap-1"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(() => {
          if (elementNeedsOnlyPositionAndSize(field)) {
            return (
              <div className="text-sm text-gray-600">
                <p><strong>Foto do Professor</strong></p>
                <p>Use o mouse para posicionar e redimensionar a área da foto no canvas.</p>
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs font-medium text-blue-800">Dica:</p>
                  <p className="text-xs text-blue-700">A foto real será aplicada durante a geração das artes baseada na seleção do formulário.</p>
                </div>
              </div>
            );
          }
          
          return (
            <>
              <div className="text-sm">
                <p><strong>Campo:</strong> {field}</p>
                <p className="text-gray-600 mt-1">Use o mouse para posicionar o elemento no canvas.</p>
              </div>

              <div>
                <Label>Tamanho da Fonte</Label>
                <Input
                  type="number"
                  value={getCurrentFontSize(selectedObject, scale)}
                  onChange={(e) => onUpdateObject('fontSize', e.target.value)}
                  min="8"
                  max="200"
                  placeholder="24"
                />
              </div>

              <div>
                <Label>Fonte</Label>
                <Select
                  value={getCurrentFontFamily(selectedObject)}
                  onValueChange={(value) => onUpdateObject('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-md">
                <p className="text-xs font-medium text-amber-800">Cores e Estilos:</p>
                <p className="text-xs text-amber-700">As cores do texto e fundos são configuradas no formulário do evento e aplicadas automaticamente durante a geração.</p>
              </div>
            </>
          );
        })()}
      </CardContent>
    </Card>
  );
};
