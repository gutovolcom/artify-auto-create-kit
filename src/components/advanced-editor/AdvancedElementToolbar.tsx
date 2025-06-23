
import React from 'react';
import { ElementToolbar } from '../layout-editor/ElementToolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Type, Image, Square } from 'lucide-react';

interface AdvancedElementToolbarProps {
  layoutElements: any[];
  onAddElement: (elementType: string) => void;
}

export const AdvancedElementToolbar: React.FC<AdvancedElementToolbarProps> = ({
  layoutElements,
  onAddElement
}) => {
  const getElementIcon = (elementType: string) => {
    switch (elementType) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Elements
          </CardTitle>
          <Badge variant="secondary">
            {layoutElements.length} available
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <ElementToolbar
          layoutElements={layoutElements}
          onAddElement={onAddElement}
        />
      </CardContent>
    </Card>
  );
};
