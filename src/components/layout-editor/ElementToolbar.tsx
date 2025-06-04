
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Elementos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {layoutElements.map((element) => (
          <Button
            key={element.id}
            variant="outline"
            className="w-full"
            onClick={() => onAddElement(element.field_mapping)}
          >
            Adicionar {element.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
