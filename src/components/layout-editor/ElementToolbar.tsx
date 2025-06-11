
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type, FileText, User, Calendar, Clock } from 'lucide-react';

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

const getElementIcon = (fieldMapping: string) => {
  switch (fieldMapping) {
    case 'title':
      return <Type className="w-5 h-5 text-primary" />;
    case 'classTheme':
      return <FileText className="w-5 h-5 text-secondary" />;
    case 'teacherName':
      return <User className="w-5 h-5 text-accent" />;
    case 'date':
      return <Calendar className="w-5 h-5 text-muted-foreground" />;
    case 'time':
      return <Clock className="w-5 h-5 text-muted-foreground" />;
    default:
      return <Type className="w-5 h-5 text-gray-500" />;
  }
};

const getElementDescription = (fieldMapping: string) => {
  switch (fieldMapping) {
    case 'title':
      return 'Título principal da aula';
    case 'classTheme':
      return 'Tema/conteúdo da aula';
    case 'teacherName':
      return 'Nome do professor';
    case 'date':
      return 'Data da aula';
    case 'time':
      return 'Horário da aula';
    default:
      return 'Elemento de texto';
  }
};

const getElementFont = (fieldMapping: string) => {
  switch (fieldMapping) {
    case 'title':
      return 'Margem-Black';
    case 'classTheme':
      return 'Margem-Bold';
    case 'teacherName':
    case 'date':
    case 'time':
      return 'Margem-Regular';
    default:
      return 'Margem-Regular';
  }
};

const getPreviewText = (fieldMapping: string) => {
  switch (fieldMapping) {
    case 'title':
      return 'Título da Aula';
    case 'classTheme':
      return 'Tema da Aula';
    case 'teacherName':
      return 'Nome do Professor';
    case 'date':
      return '15/06/2025';
    case 'time':
      return '14:30';
    default:
      return 'Texto';
  }
};

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  layoutElements,
  onAddElement
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" />
          Elementos Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground mb-4">
          Clique para adicionar elementos ao layout
        </div>
        
        {/* Text Elements Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
            Elementos de Texto
          </h4>
          
          {layoutElements.map((element) => (
            <div key={element.id} className="group">
              <Button
                variant="outline"
                className="w-full p-4 h-auto flex flex-col items-start gap-2 hover:shadow-md transition-all duration-200 hover:border-primary/50 group-hover:bg-gradient-to-r group-hover:from-primary/5 group-hover:to-transparent"
                onClick={() => onAddElement(element.field_mapping)}
              >
                <div className="flex items-center gap-2 w-full">
                  {getElementIcon(element.field_mapping)}
                  <span className="font-medium text-left">{element.name}</span>
                </div>
                
                <div className="text-xs text-muted-foreground text-left w-full">
                  {getElementDescription(element.field_mapping)}
                </div>
                
                <div 
                  className="text-sm text-left w-full border border-dashed border-gray-300 rounded px-2 py-1 bg-gray-50"
                  style={{ 
                    fontFamily: `'${getElementFont(element.field_mapping)}', Arial, sans-serif`,
                    fontWeight: element.field_mapping === 'title' ? 900 : 
                               element.field_mapping === 'classTheme' ? 700 : 400
                  }}
                >
                  {getPreviewText(element.field_mapping)}
                </div>
                
                <div className="text-xs text-gray-500 text-left w-full">
                  Fonte: {getElementFont(element.field_mapping)}
                </div>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-1">
            💡 Dica de Uso
          </div>
          <div className="text-xs text-blue-700">
            Os elementos serão posicionados aleatoriamente no canvas. 
            Use o mouse para movê-los e redimensioná-los conforme necessário.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
