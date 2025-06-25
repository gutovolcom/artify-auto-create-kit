// src/components/layout-editor/ElementToolbar.tsx (COMPLETAMENTE NOVO)

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Type, Calendar, Clock, User } from 'lucide-react';

interface LayoutElement {
  id: string;
  name: string;
  field_mapping: string;
}

interface ElementToolbarProps {
  layoutElements: LayoutElement[];
  onAddElement: (elementType: string) => void;
}

const elementIconMap: Record<string, { icon: React.ElementType; label: string }> = {
  classTheme: { icon: Type, label: "Tema da Aula" },
  date: { icon: Calendar, label: "Data" },
  time: { icon: Clock, label: "Horário" },
  teacherName: { icon: User, label: "Nome do Professor" },
};

const hiddenElements = ['title', 'teacherImages', 'professorPhotos'];

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  layoutElements,
  onAddElement
}) => {
  const visibleElements = layoutElements.filter(el => 
    !hiddenElements.includes(el.field_mapping) && elementIconMap[el.field_mapping]
  );

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <TooltipProvider>
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg shadow-2xl border border-slate-200/80">
          {visibleElements.map((element) => {
            const { icon: Icon, label } = elementIconMap[element.field_mapping];
            return (
              <Tooltip key={element.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddElement(element.field_mapping)}
                    className="h-10 w-10 text-slate-600 hover:text-[#DD303E] hover:bg-red-50"
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar {label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};