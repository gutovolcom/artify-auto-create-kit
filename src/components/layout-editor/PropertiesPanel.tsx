
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
        <div className="text-sm">
          <p><strong>Campo:</strong> {field}</p>
          <p className="text-gray-600 mt-1">Use o mouse para posicionar e redimensionar o elemento no canvas.</p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs font-medium text-blue-800">Editor de Posicionamento:</p>
          <p className="text-xs text-blue-700">
            Este editor é apenas para posicionar elementos. Todos os estilos, cores e fontes 
            são aplicados automaticamente baseados nas configurações do formulário durante a geração.
          </p>
        </div>

        <div className="mt-3 p-3 bg-amber-50 rounded-md">
          <p className="text-xs font-medium text-amber-800">Hierarchy das Fontes Margem:</p>
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
