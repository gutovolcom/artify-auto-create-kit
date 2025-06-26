
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { EventData } from "@/pages/Index";
import { GeneratedImage } from "@/hooks/useImageGenerator/types";

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
      <div className="min-h-screen flex flex-col w-full">
        {/* NAVBAR FIXA NO TOPO */}
        <Navbar
          userEmail={userEmail}
          isAdmin={isAdmin}
          onAdminPanel={onAdminPanel}
          onLogout={onLogout}
        />

        {/* ÁREA PRINCIPAL */}
        <div className="flex flex-1">
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

          <MainContent
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