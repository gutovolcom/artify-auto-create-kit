import { Label } from "@/components/ui/label";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { ErrorBadge } from "@/components/ui/error-badge";

interface TeacherSectionProps {
  selectedTeacherIds: string[];
  onSelectionChange: (ids: string[], photos: string[], names: string[]) => void;
  error?: string;
}

export const TeacherSection = ({
  selectedTeacherIds,
  onSelectionChange,
  error,
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

  const handleRemove = (id: string) => {
    const newSelected = selectedTeacherIds.filter(tid => tid !== id);
    const updated = teachers.filter(t => newSelected.includes(t.id));
    onSelectionChange(
      updated.map(t => t.id),
      updated.map(t => t.image_url),
      updated.map(t => t.name)
    );
  };

  const selectedTeachers = teachers.filter(t => selectedTeacherIds.includes(t.id));

  return (
    <div className="space-y-2 relative">
      <Label className="text-sm text-foreground font-medium">
        Foto do professor:
      </Label>

      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "border rounded-md flex items-center justify-between px-3 py-2 h-11 bg-background w-full cursor-pointer",
                error ? "border-destructive" : "border-border"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {selectedTeachers.length === 1 && (
                  <div className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1 relative">
                    <img
                      src={selectedTeachers[0].image_url}
                      alt={selectedTeachers[0].name}
                      className="w-8 h-8 rounded-full object-cover object-top"
                    />
                    <span className="ml-2 text-sm text-foreground whitespace-nowrap">{selectedTeachers[0].name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(selectedTeachers[0].id);
                      }}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}

                {selectedTeachers.length > 1 && (
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
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTeachers.length === 0 && (
                  <span className="text-sm text-muted-foreground">Adicionar professor</span>
                )}
              </div>

              <Search className="w-4 h-4 text-muted-foreground" />
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
        
        <ErrorBadge error={error} />
      </div>
    </div>
  );
};
