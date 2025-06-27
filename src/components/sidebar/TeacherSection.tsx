import { Label } from "@/components/ui/label";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Search, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherSectionProps {
  selectedTeacherIds: string[];
  onSelectionChange: (ids: string[], photos: string[], names: string[]) => void;
  error?: string; // ⚠️ importante para validação
}

export const TeacherSection = ({
  selectedTeacherIds,
  onSelectionChange,
  error,
}: TeacherSectionProps) => {
  const { teachers } = useSupabaseTeachers();

  const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id));

  const handleToggle = (teacherId: string) => {
    const isSelected = selectedTeacherIds.includes(teacherId);
    const newSelected = isSelected
      ? selectedTeacherIds.filter(id => id !== teacherId)
      : [...selectedTeacherIds, teacherId];

    const updated = teachers.filter(t => newSelected.includes(t.id));
    onSelectionChange(
      updated.map(t => t.id),
      updated.map(t => t.image_url),
      updated.map(t => t.name)
    );
  };

  const handleRemove = (id: string) => {
    const newSelected = selectedTeacherIds.filter(tid => tid !== id);
    const updated = teachers.filter(t => newSelected.includes(t.id));
    onSelectionChange(
      updated.map(t => t.id),
      updated.map(t => t.image_url),
      updated.map(t => t.name)
    );
  };

  return (
    <div className="space-y-2 relative">
      <Label className="text-sm text-gray-700 font-medium flex items-center gap-2">
        Foto do professor:
        {error && (
          <Badge variant="destructive" className="text-xs font-normal px-2 py-0.5">
            <Info className="w-3 h-3 mr-1" />
            {error}
          </Badge>
        )}
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <div className={cn(
            "border rounded-md flex items-center justify-between px-3 py-2 h-11 bg-white w-full cursor-pointer",
            error ? "border-red-500" : "border-gray-300"
          )}>
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedTeachers.length > 0 ? (
                selectedTeachers.length === 1 ? (
                  <div className="flex items-center bg-gray-100 rounded-full pl-1 pr-2 py-1 relative">
                    <img
                      src={selectedTeachers[0].image_url}
                      alt={selectedTeachers[0].name}
                      className="w-8 h-8 rounded-full object-cover object-top"
                    />
                    <span className="ml-2 text-sm text-gray-800 whitespace-nowrap">
                      {selectedTeachers[0].name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(selectedTeachers[0].id);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {selectedTeachers.map((teacher) => (
                      <div key={teacher.id} className="relative">
                        <img
                          src={teacher.image_url}
                          alt={teacher.name}
                          className="w-8 h-8 rounded-full object-cover object-top"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(teacher.id);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <span className="text-sm text-gray-500">Adicionar professor</span>
              )}
            </div>

            <Search className="w-4 h-4 text-gray-500" />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-4 space-y-2 z-50">
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
