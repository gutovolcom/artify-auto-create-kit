// src/components/layout-editor/PropertiesPanel.tsx (CORRIGIDO)

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Trash2, Move, Layers } from 'lucide-react';

// Interface corrigida, sem a prop onUpdateObject
interface PropertiesPanelProps {
  selectedObject: any;
  scale: number;
  onDeleteSelected: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  scale,
  onDeleteSelected // A prop onUpdateObject foi completamente removida
}) => {
  if (!selectedObject) {
    // O painel agora não renderiza nada se não houver objeto selecionado,
    // conforme sua solicitação de exibi-lo apenas quando necessário.
    return null;
  }

  const unscaledLeft = Math.round((selectedObject.left || 0) / scale);
  const unscaledTop = Math.round((selectedObject.top || 0) / scale);
  const elementType = selectedObject.elementType || selectedObject.type || 'unknown';
  const fieldName = selectedObject.fieldMapping || selectedObject.field || 'unknown';

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      classTheme: "Tema da Aula",
      teacherName: "Nome do Professor",
    };
    return labels[field] || field;
  };

  return (
    <Card className="w-full shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Propriedades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Elemento</span>
            <Badge variant="outline" className="text-xs h-5">
              {elementType}
            </Badge>
          </div>
          <p className="text-sm font-medium">{getFieldLabel(fieldName)}</p>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Move className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Posição</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 rounded px-2 py-1">
              <span className="text-muted-foreground">X:</span>
              <span className="ml-1 font-mono">{unscaledLeft}px</span>
            </div>
            <div className="bg-muted/50 rounded px-2 py-1">
              <span className="text-muted-foreground">Y:</span>
              <span className="ml-1 font-mono">{unscaledTop}px</span>
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            className="w-full h-8 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Remover Elemento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};