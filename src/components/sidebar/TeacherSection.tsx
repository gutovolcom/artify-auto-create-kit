import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
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
  const [open, setOpen] = React.useState(false);

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
        {/* Selected teachers display */}
        {selectedTeachers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1 relative"
              >
                <img
                  src={teacher.image_url}
                  alt={teacher.name}
                  className="w-6 h-6 rounded-full object-cover object-top"
                />
                {/* Only show name when there's a single teacher selected */}
                {selectedTeachers.length === 1 && (
                  <span className="ml-2 text-sm text-foreground whitespace-nowrap">
                    {teacher.name}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(teacher.id);
                  }}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                error ? "border-destructive" : "border-border"
              )}
            >
              {selectedTeachers.length === 0 ? (
                <span className="text-muted-foreground">Adicionar professor</span>
              ) : (
                <span>
                  {selectedTeachers.length === 1 
                    ? `${selectedTeachers[0].name} selecionado`
                    : `${selectedTeachers.length} professores selecionados`
                  }
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" side="right" align="start">
            <Command>
              <CommandInput placeholder="Buscar professor..." />
              <CommandList className="max-h-48">
                <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
                <CommandGroup>
                  {teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      value={teacher.name}
                      onSelect={() => {
                        handleToggle(teacher.id);
                        // Keep popover open for multiple selection
                        // setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={teacher.image_url}
                        alt={teacher.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="flex-1">{teacher.name}</span>
                      {selectedTeacherIds.includes(teacher.id) && (
                        <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <ErrorBadge error={error} />
      </div>
    </div>
  );
};
