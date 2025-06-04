
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { 
  getSelectedElementField, 
  elementNeedsOnlyPositionAndSize
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
  if (!selectedObject) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Propriedades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Selecione um elemento no canvas para editar suas propriedades.
          </p>
        </CardContent>
      </Card>
    );
  }

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
        <div className="text-sm">
          <p><strong>Campo:</strong> {field || 'Campo não identificado'}</p>
          <p className="text-gray-600 mt-1">Use o mouse para posicionar e redimensionar o elemento no canvas.</p>
        </div>

        {selectedObject && (
          <div className="space-y-2 text-xs text-gray-600">
            <p><strong>Posição:</strong> x: {Math.round((selectedObject.left || 0) / scale)}, y: {Math.round((selectedObject.top || 0) / scale)}</p>
            <p><strong>Tamanho:</strong> {Math.round(((selectedObject.width || 0) * (selectedObject.scaleX || 1)) / scale)} x {Math.round(((selectedObject.height || 0) * (selectedObject.scaleY || 1)) / scale)}</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs font-medium text-blue-800">Editor de Posicionamento:</p>
          <p className="text-xs text-blue-700">
            Este editor é apenas para posicionar elementos. Todos os estilos, cores e fontes 
            são aplicados automaticamente baseados nas configurações do formulário durante a geração.
          </p>
        </div>

        <div className="mt-3 p-3 bg-amber-50 rounded-md">
          <p className="text-xs font-medium text-amber-800">Hierarquia das Fontes Margem:</p>
          <ul className="text-xs text-amber-700 mt-1 space-y-1">
            <li>• Título: Margem-Black</li>
            <li>• Tema da Aula: Margem-Bold</li>
            <li>• Professor: Margem-Regular</li>
            <li>• Data/Hora: Margem-Regular</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
