
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { Settings, Users, FileText } from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const adminSections = [
  { id: "templates", label: "Templates", icon: FileText },
  { id: "teachers", label: "Professores", icon: Users },
];

export const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  return (
    <Sidebar className="border-r w-[360px] flex-shrink-0 bg-sidebar overflow-hidden">
      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <img src="/logo-nova.svg" alt="Logo GRAN" className="h-5 w-20 logo-light object-contain" />
          <img src="/logo-nova-white.svg" alt="Logo GRAN" className="h-5 w-20 logo-dark object-contain" />
        </div>
        <p className="text-sm text-muted-foreground">Painel Administrativo</p>
      </SidebarHeader>

      <SidebarContent className="px-4 pb-4 space-y-3 overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminSections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    isActive={activeSection === section.id}
                    onClick={() => onSectionChange(section.id)}
                    className="w-full justify-start"
                  >
                    <section.icon className="mr-2 h-4 w-4" />
                    {section.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
