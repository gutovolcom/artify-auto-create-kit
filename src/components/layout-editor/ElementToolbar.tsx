
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Type, Image, Package } from 'lucide-react';

interface LayoutElement {
  id: string;
  name: string;
  field_mapping: string;
  element_type: string;
  default_style: any;
}

interface ElementToolbarProps {
  layoutElements: LayoutElement[];
  onAddElement: (elementType: string) => void;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  layoutElements,
  onAddElement
}) => {
  const getElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'text':
      case 'text_box':
        return Type;
      case 'image':
        return Image;
      default:
        return Package;
    }
  };

  const getElementLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      classTheme: "Tema da Aula",
      teacherName: "Nome do Professor",
      teacherImages: "Fotos do Professor",
      professorPhotos: "Fotos do Professor"
    };
    return labels[fieldName] || fieldName;
  };

  const groupedElements = layoutElements.reduce((acc, element) => {
    const type = element.element_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(element);
    return acc;
  }, {} as Record<string, LayoutElement[]>);

  return (
    <Card className="w-full shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Elementos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(groupedElements).map(([type, elements]) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              {React.createElement(getElementIcon(type), { 
                className: "h-3 w-3 text-muted-foreground" 
              })}
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {type === 'text_box' ? 'Caixas de Texto' : type === 'text' ? 'Textos' : 'Imagens'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              {elements.map((element) => (
                <Button
                  key={element.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddElement(element.field_mapping)}
                  className="h-8 justify-start text-xs font-normal hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                >
                  {React.createElement(getElementIcon(element.element_type), { 
                    className: "h-3 w-3 mr-2" 
                  })}
                  {getElementLabel(element.field_mapping)}
                  <Badge variant="secondary" className="ml-auto text-xs h-4 px-1">
                    {element.element_type}
                  </Badge>
                </Button>
              ))}
            </div>
            
            {Object.keys(groupedElements).indexOf(type) < Object.keys(groupedElements).length - 1 && (
              <Separator className="my-2" />
            )}
          </div>
        ))}
        
        {layoutElements.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum elemento disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
