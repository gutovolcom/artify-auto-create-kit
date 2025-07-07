
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
      <div className="min-h-screen flex flex-col w-full bg-white">
        {/* NAVBAR */}
        <Navbar
          userEmail={userEmail}
          isAdmin={true}
          onAdminPanel={() => {}}
          onLogout={onLogout}
        />

        {/* CONTENT WITH SIDEBAR LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          {/* FIXED SIDEBAR */}
          <div className="w-[360px] shrink-0 border-r bg-white">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="container mx-auto px-6 py-8">
                {onSwitchToUser && (
                  <div className="mb-6">
                    <button
                      onClick={onSwitchToUser}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      ← Voltar ao Painel do Usuário
                    </button>
                  </div>
                )}
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
