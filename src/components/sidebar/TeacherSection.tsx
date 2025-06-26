// src/components/sidebar/TeacherSection.tsx

import { Label } from "@/components/ui/label";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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
      <Label className="text-sm text-gray-700 font-medium">Foto do professor:</Label>
      <Popover>
        <PopoverTrigger asChild>
          <div className="w-full relative border rounded-full px-4 py-2 flex items-center justify-between bg-white shadow-sm cursor-pointer">
            {selectedTeachers.length === 1 && (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="relative">
                  <img
                    src={selectedTeachers[0].image_url}
                    alt={selectedTeachers[0].name}
                    className="w-10 h-10 rounded-full object-cover object-top"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(selectedTeachers[0].id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <span className="text-sm text-gray-700">{selectedTeachers[0].name}</span>
              </div>
            )}

            {selectedTeachers.length > 1 && (
              <div className="flex -space-x-2">
                {selectedTeachers.map((t) => (
                  <div key={t.id} className="relative">
                    <img
                      src={t.image_url}
                      alt={t.name}
                      className="w-9 h-9 rounded-full border-2 border-white object-cover object-top"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(t.id);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Search className="w-4 h-4 text-gray-500" />
          </div>
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
