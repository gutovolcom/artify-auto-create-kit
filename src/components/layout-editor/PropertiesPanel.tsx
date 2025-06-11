
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Info, Move, Maximize2 } from 'lucide-react';
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

const getElementTypeInfo = (field: string) => {
  switch (field) {
    case 'title':
      return { type: 'Título', font: 'Margem-Black', color: '#333333' };
    case 'classTheme':
      return { type: 'Tema da Aula', font: 'Margem-Bold', color: '#333333' };
    case 'teacherName':
      return { type: 'Professor', font: 'Margem-Regular', color: '#333333' };
    case 'date':
      return { type: 'Data', font: 'Margem-Regular', color: '#333333' };
    case 'time':
      return { type: 'Horário', font: 'Margem-Regular', color: '#333333' };
    default:
      return { type: 'Elemento', font: 'Margem-Regular', color: '#333333' };
  }
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  scale,
  onUpdateObject,
  onDeleteSelected
}) => {
  if (!selectedObject) {
    return (
      <Card className="mt-4 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5" />
            Propriedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Move className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Nenhum elemento selecionado
            </p>
            <p className="text-gray-400 text-xs">
              Clique em um elemento no canvas para editar suas propriedades
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const field = getSelectedElementField(selectedObject);
  const elementInfo = getElementTypeInfo(field || '');
  const x = Math.round((selectedObject.left || 0) / scale);
  const y = Math.round((selectedObject.top || 0) / scale);
  const width = Math.round(((selectedObject.width || 0) * (selectedObject.scaleX || 1)) / scale);
  const height = Math.round(((selectedObject.height || 0) * (selectedObject.scaleY || 1)) / scale);

  return (
    <Card className="mt-4 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Propriedades
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDeleteSelected}
            className="flex items-center gap-1 hover:shadow-md transition-shadow"
          >
            <Trash className="h-3 w-3" />
            Excluir
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Element Information */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="font-semibold text-primary">Elemento Selecionado</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tipo:</span>
              <span className="font-medium">{elementInfo.type}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Campo:</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {field || 'Não identificado'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fonte:</span>
              <span 
                className="text-sm font-medium"
                style={{ fontFamily: `'${elementInfo.font}', Arial, sans-serif` }}
              >
                {elementInfo.font}
              </span>
            </div>
          </div>
        </div>

        {/* Position and Size */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Move className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-700">Posição e Tamanho</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1">Posição X</div>
              <div className="font-mono text-lg font-semibold text-gray-800">{x}px</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1">Posição Y</div>
              <div className="font-mono text-lg font-semibold text-gray-800">{y}px</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                Largura
              </div>
              <div className="font-mono text-lg font-semibold text-gray-800">{width}px</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                Altura
              </div>
              <div className="font-mono text-lg font-semibold text-gray-800">{height}px</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-800">Como Editar</span>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Use o mouse para arrastar e reposicionar o elemento. 
              Arraste pelas bordas para redimensionar.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium text-amber-800">Hierarquia das Fontes</span>
            </div>
            <ul className="text-xs text-amber-700 space-y-1 leading-relaxed">
              <li>• <strong>Título:</strong> Margem-Black (mais pesada)</li>
              <li>• <strong>Tema da Aula:</strong> Margem-Bold</li>
              <li>• <strong>Professor/Data/Hora:</strong> Margem-Regular</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-800">Editor de Posicionamento</span>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              Este editor define apenas as posições dos elementos. 
              Cores e estilos são aplicados automaticamente na geração final.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
