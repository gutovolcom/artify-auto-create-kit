import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { EventData } from "@/pages/Index";
import { GeneratedImage } from "@/hooks/useImageGenerator/types";
import { Navbar } from "@/components/Navbar";

interface MainLayoutProps {
  userEmail: string;
  isAdmin: boolean;
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  missingFields: string[];
  generatedImages: GeneratedImage[];
  onExport: () => void;
  hasStartedGeneration: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
}

export const MainLayout = ({
  userEmail,
  isAdmin,
  eventData,
  updateEventData,
  onGenerate,
  isGenerating,
  generationProgress,
  currentGeneratingFormat,
  missingFields,
  generatedImages,
  onExport,
  hasStartedGeneration,
  onAdminPanel,
  onLogout,
}: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-white">
        {/* NAVBAR */}
        <Navbar
          userEmail={userEmail}
          isAdmin={isAdmin}
          onAdminPanel={onAdminPanel}
          onLogout={onLogout}
        />

        {/* LAYOUT PRINCIPAL */}
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <AppSidebar
            userEmail={userEmail}
            isAdmin={isAdmin}
            eventData={eventData}
            updateEventData={updateEventData}
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            missingFields={missingFields}
            onAdminPanel={onAdminPanel}
            onLogout={onLogout}
          />

          {/* CONTEÚDO PRINCIPAL */}
          <MainContent
            className="flex-1 min-w-0"
            generatedImages={generatedImages}
            eventData={eventData}
            onExport={onExport}
            hasStartedGeneration={hasStartedGeneration}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            currentGeneratingFormat={currentGeneratingFormat}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};
