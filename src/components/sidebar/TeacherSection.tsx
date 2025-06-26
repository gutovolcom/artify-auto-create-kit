// src/components/sidebar/TeacherSection.tsx

import { Label } from "@/components/ui/label";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TeacherSectionProps {
  selectedTeacherIds: string[];
  onSelectionChange: (ids: string[], photos: string[], names: string[]) => void;
}

export const TeacherSection = ({
  selectedTeacherIds,
  onSelectionChange,
}: TeacherSectionProps) => {
  const { teachers } = useSupabaseTeachers();

  const handleToggle = (teacherId: string) => {
    const isSelected = selectedTeacherIds.includes(teacherId);
    const newSelected = isSelected
      ? selectedTeacherIds.filter(id => id !== teacherId)
      : [...selectedTeacherIds, teacherId];

    const selectedTeachers = teachers.filter(t => newSelected.includes(t.id));
    const photos = selectedTeachers.map(t => t.image_url);
    const names = selectedTeachers.map(t => t.name);

    onSelectionChange(newSelected, photos, names);
  };

  const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id));

  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700 font-medium">Adicionar professor</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-11 rounded-lg border-gray-300 text-gray-800 text-sm font-normal"
          >
            {selectedTeachers.length === 0 && <span>Selecionar professores</span>}
            {selectedTeachers.length === 1 && (
              <div className="flex items-center space-x-2">
                <img
                  src={selectedTeachers[0].image_url}
                  alt={selectedTeachers[0].name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>{selectedTeachers[0].name}</span>
              </div>
            )}
            {selectedTeachers.length > 1 && (
              <div className="flex -space-x-2">
                {selectedTeachers.slice(0, 3).map(teacher => (
                  <img
                    key={teacher.id}
                    src={teacher.image_url}
                    alt={teacher.name}
                    className="w-6 h-6 rounded-full object-cover border-2 border-white"
                  />
                ))}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 space-y-2">
          <ScrollArea className="max-h-64">
            {teachers.map(teacher => (
              <div key={teacher.id} className="flex items-center space-x-3 py-1">
                <Checkbox
                  id={`teacher-${teacher.id}`}
                  checked={selectedTeacherIds.includes(teacher.id)}
                  onCheckedChange={() => handleToggle(teacher.id)}
                />
                <img
                  src={teacher.image_url}
                  alt={teacher.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <label htmlFor={`teacher-${teacher.id}`} className="text-sm">
                  {teacher.name}
                </label>
              </div>
            ))}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
