import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "@/components/Navbar";
import { TemplateManager } from "@/components/TemplateManager";
import { TeacherManager } from "@/components/TeacherManager";

interface AdminLayoutProps {
  userEmail: string;
  onLogout: () => void;
  onSwitchToUser?: () => void;
}

export const AdminLayout = ({ userEmail, onLogout, onSwitchToUser }: AdminLayoutProps) => {
  const [activeSection, setActiveSection] = useState("templates");

  const renderContent = () => {
    switch (activeSection) {
      case "templates":
        return <TemplateManager />;
      case "teachers":
        return <TeacherManager />;
      default:
        return <TemplateManager />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* NAVBAR */}
        <Navbar
          userEmail={userEmail}
          isAdmin={true}
          isAdminPanel={true}
          onAdminPanel={() => {}}
          onUserPanel={onSwitchToUser}
          onLogout={onLogout}
        />

        {/* CONTENT WITH SIDEBAR LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          {/* FIXED SIDEBAR */}
          <div className="w-[360px] shrink-0 border-r bg-background">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-hidden flex flex-col bg-background">
            <div className="flex-1 overflow-auto">
              <div className="container mx-auto px-6 pt-8 pb-0">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
