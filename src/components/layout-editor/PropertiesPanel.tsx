
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Info, Move, Maximize2 } from 'lucide-react';
import { AlignmentControls } from './AlignmentControls';
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
      <Card className="mt-4 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Propriedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Move className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Nenhum elemento selecionado
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Clique em um elemento no canvas para editar suas propriedades e usar ferramentas de alinhamento
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
    <Card className="mt-4 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Propriedades
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDeleteSelected}
            className="flex items-center gap-1 hover:shadow-md transition-all hover:scale-105"
          >
            <Trash className="h-3 w-3" />
            Excluir
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        
        {/* Element Information */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/70"></div>
            <span className="font-semibold text-primary">Elemento Selecionado</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tipo:</span>
              <span className="font-medium bg-white px-2 py-1 rounded-md text-sm border">{elementInfo.type}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Campo:</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border">
                {field || 'Não identificado'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fonte:</span>
              <span 
                className="text-sm font-medium bg-white px-2 py-1 rounded-md border"
                style={{ fontFamily: `'${elementInfo.font}', Arial, sans-serif` }}
              >
                {elementInfo.font}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Alignment Controls */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <AlignmentControls
            canvas={selectedObject.canvas}
            selectedObject={selectedObject}
            onUpdate={() => {
              // Force re-render to update position display
              selectedObject.canvas?.renderAll();
            }}
          />
        </div>

        {/* Position and Size */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Move className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-700">Posição e Tamanho</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 font-medium">Posição X</div>
              <div className="font-mono text-lg font-bold text-gray-800">{x}<span className="text-xs text-gray-500">px</span></div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 font-medium">Posição Y</div>
              <div className="font-mono text-lg font-bold text-gray-800">{y}<span className="text-xs text-gray-500">px</span></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1 font-medium">
                <Maximize2 className="w-3 h-3" />
                Largura
              </div>
              <div className="font-mono text-lg font-bold text-gray-800">{width}<span className="text-xs text-gray-500">px</span></div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1 font-medium">
                <Maximize2 className="w-3 h-3" />
                Altura
              </div>
              <div className="font-mono text-lg font-bold text-gray-800">{height}<span className="text-xs text-gray-500">px</span></div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-800">Controles de Edição</span>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Use os botões de alinhamento acima para posicionamento rápido. 
              Arraste elementos para reposicionar ou redimensione pelas bordas.
              Linhas guias aparecem automaticamente para ajudar no alinhamento.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-800">Editor de Layout</span>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              Este editor define apenas as posições dos elementos. 
              Cores e estilos finais são aplicados automaticamente durante a geração.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
