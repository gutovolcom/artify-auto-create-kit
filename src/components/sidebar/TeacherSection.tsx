import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { MultiSelectTeacher } from "@/components/MultiSelectTeacher";

interface TeacherSectionProps {
  selectedTeacherIds: string[];
  onSelectionChange: (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => void;
}

export const TeacherSection = ({ selectedTeacherIds, onSelectionChange }: TeacherSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Foto do professor:
        </Label>
        <MultiSelectTeacher
          selectedTeacherIds={selectedTeacherIds || []}
          onSelectionChange={onSelectionChange}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};