
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Check } from "lucide-react";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { cn } from "@/lib/utils";

interface MultiSelectTeacherProps {
  selectedTeacherIds: string[];
  onSelectionChange: (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => void;
}

export const MultiSelectTeacher: React.FC<MultiSelectTeacherProps> = ({
  selectedTeacherIds,
  onSelectionChange
}) => {
  const { teachers, loading } = useSupabaseTeachers();
  const [open, setOpen] = useState(false);

  const selectedTeachers = teachers.filter(teacher => 
    selectedTeacherIds.includes(teacher.id)
  );

  const availableTeachers = teachers.filter(teacher => 
    !selectedTeacherIds.includes(teacher.id)
  );

  const handleSelectTeacher = (teacherId: string) => {
    const newSelectedIds = [...selectedTeacherIds, teacherId];
    const newTeachers = teachers.filter(t => newSelectedIds.includes(t.id));
    
    onSelectionChange(
      newSelectedIds,
      newTeachers.map(t => t.image_url).filter(Boolean),
      newTeachers.map(t => t.name)
    );
    setOpen(false);
  };

  const handleRemoveTeacher = (teacherId: string) => {
    const newSelectedIds = selectedTeacherIds.filter(id => id !== teacherId);
    const newTeachers = teachers.filter(t => newSelectedIds.includes(t.id));
    
    onSelectionChange(
      newSelectedIds,
      newTeachers.map(t => t.image_url).filter(Boolean),
      newTeachers.map(t => t.name)
    );
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando professores...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Professores Selecionados
      </label>
      
      {/* Selected teachers display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTeachers.map((teacher) => (
          <Badge
            key={teacher.id}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-1"
          >
            {teacher.image_url && (
              <img
                src={teacher.image_url}
                alt={teacher.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm">{teacher.name}</span>
            <button
              onClick={() => handleRemoveTeacher(teacher.id)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add teacher dropdown */}
      {selectedTeacherIds.length < 3 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Adicionar Professor
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar professor..." />
              <CommandList>
                <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
                <CommandGroup>
                  {availableTeachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      value={teacher.name}
                      onSelect={() => handleSelectTeacher(teacher.id)}
                      className="flex items-center gap-2"
                    >
                      {teacher.image_url && (
                        <img
                          src={teacher.image_url}
                          alt={teacher.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{teacher.name}</span>                      
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {selectedTeacherIds.length >= 3 && (
        <p className="text-sm text-gray-500">
          Máximo de 3 professores permitido
        </p>
      )}
    </div>
  );
};
