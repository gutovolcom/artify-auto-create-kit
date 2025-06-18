
import { 
  Calendar, 
  Home, 
  Image, 
  Settings, 
  Users, 
  Palette,
  Download,
  LayoutDashboard,
  Sparkles
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isAdmin?: boolean
  userEmail?: string
}

export function AppSidebar({ activeTab, onTabChange, isAdmin, userEmail }: AppSidebarProps) {
  const mainItems = [
    {
      title: "Create Art",
      url: "#",
      icon: Sparkles,
      id: "input",
      description: "Generate new artwork"
    },
    {
      title: "Gallery",
      url: "#",
      icon: Image,
      id: "export",
      description: "View generated images"
    },
  ]

  const adminItems = isAdmin ? [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      id: "admin-dashboard",
      description: "Admin overview"
    },
    {
      title: "Templates",
      url: "#",
      icon: Palette,
      id: "admin-templates",
      description: "Manage templates"
    },
    {
      title: "Teachers",
      url: "#",
      icon: Users,
      id: "admin-teachers",
      description: "Manage teachers"
    },
  ] : []

  const allItems = [...mainItems, ...adminItems]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Project GA</h2>
            <p className="text-sm text-muted-foreground">Art Generator</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{item.title}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t px-2 py-2">
        <div className="flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground truncate">
            {userEmail}
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
