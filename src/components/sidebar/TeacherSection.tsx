import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";

interface TeacherSectionProps {
  selectedTeacherIds: string[];
  onSelectionChange: (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => void;
}

export const TeacherSection = ({ selectedTeacherIds, onSelectionChange }: TeacherSectionProps) => {
  const { teachers } = useSupabaseTeachers();
  const [selectedTeachers, setSelectedTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (teachers.length > 0 && selectedTeacherIds.length > 0) {
      const matched = teachers.filter(t => selectedTeacherIds.includes(t.id));
      setSelectedTeachers(matched);
    }
  }, [teachers, selectedTeacherIds]);

  const handleSelect = (teacher: any) => {
    const alreadySelected = selectedTeachers.find(t => t.id === teacher.id);
    let updatedTeachers;
    if (alreadySelected) {
      updatedTeachers = selectedTeachers.filter(t => t.id !== teacher.id);
    } else {
      updatedTeachers = [...selectedTeachers, teacher];
    }
    setSelectedTeachers(updatedTeachers);
    onSelectionChange(
      updatedTeachers.map(t => t.id),
      updatedTeachers.map(t => t.photo_url),
      updatedTeachers.map(t => t.name)
    );
  };

  const handleRemove = (id: string) => {
    const updated = selectedTeachers.filter(t => t.id !== id);
    setSelectedTeachers(updated);
    onSelectionChange(
      updated.map(t => t.id),
      updated.map(t => t.photo_url),
      updated.map(t => t.name)
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Adicionar professor:</Label>

        <div className="relative w-full">
          <div className="border rounded-md px-3 py-2 bg-white min-h-[44px]">
            {selectedTeachers.length === 1 && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <img
                    src={selectedTeachers[0].photo_url || "/placeholder.jpg"}
                    alt={selectedTeachers[0].name}
                    className="h-10 w-10 rounded-full object-cover object-top"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <button
                    onClick={() => handleRemove(selectedTeachers[0].id)}
                    className="absolute top-[-6px] right-[-6px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
                <span className="text-sm text-gray-700">{selectedTeachers[0].name}</span>
              </div>
            )}

            {selectedTeachers.length > 1 && (
              <div className="flex items-center -space-x-3">
                {selectedTeachers.map(t => (
                  <div key={t.id} className="relative">
                    <img
                      src={t.photo_url || "/placeholder.jpg"}
                      alt={t.name}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover object-top"
                      onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                    />
                    <button
                      onClick={() => handleRemove(t.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {teachers.map((teacher: any) => (
            <div
              key={teacher.id}
              className={
                "cursor-pointer border rounded-md p-1 text-center " +
                (selectedTeacherIds.includes(teacher.id)
                  ? "ring-2 ring-blue-500"
                  : "hover:border-gray-400")
              }
              onClick={() => handleSelect(teacher)}
            >
              <img
                src={teacher.photo_url || "/placeholder.jpg"}
                alt={teacher.name}
                className="h-16 w-full object-cover object-top rounded"
                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
              />
              <p className="text-xs mt-1 text-gray-700 truncate">{teacher.name}</p>
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
