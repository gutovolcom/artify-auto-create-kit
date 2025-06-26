
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { MultiSelectTeacher } from "@/components/MultiSelectTeacher";

interface TeacherSectionProps {
  selectedTeacherIds: string[];
  onSelectionChange: (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => void;
}

export const TeacherSection = ({ selectedTeacherIds, onSelectionChange }: TeacherSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Professor</SidebarGroupLabel>
      <SidebarGroupContent>
        <MultiSelectTeacher
          selectedTeacherIds={selectedTeacherIds || []}
          onSelectionChange={onSelectionChange}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
