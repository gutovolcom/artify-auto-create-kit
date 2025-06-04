
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash } from 'lucide-react';
import { 
  getSelectedElementField, 
  elementNeedsFontProperties, 
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
                <p>Foto do Professor</p>
                <p>Use o mouse para posicionar a imagem no canvas.</p>
              </div>
            );
          }
          
          if (elementNeedsFontProperties(field)) {
            return (
              <>
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

                {field === 'classTheme' && (
                  <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
                    <p><strong>Tema da Aula:</strong></p>
                    <p>A cor do texto e do fundo são configuradas no painel do usuário.</p>
                  </div>
                )}

                {['title', 'teacherName', 'date', 'time'].includes(field) && (
                  <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
                    <p><strong>Cor do Texto:</strong></p>
                    <p>Configure a cor no painel do usuário no campo "Cor do texto".</p>
                  </div>
                )}
              </>
            );
          }
          
          return (
            <div className="text-sm text-gray-600">
              <p>Elemento selecionado: {field}</p>
              <p>Use o mouse para posicionar no canvas.</p>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};
