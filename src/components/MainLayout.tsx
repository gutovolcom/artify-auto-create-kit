
import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
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
      <div className="min-h-screen flex w-full">
        <div className="flex flex-col w-full">
          <Navbar 
            userEmail={userEmail} 
            isAdmin={isAdmin}
            onAdminPanel={onAdminPanel}
            onLogout={onLogout}
          />
          
          <div className="flex flex-1">
            <AppSidebar
              eventData={eventData}
              updateEventData={updateEventData}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              currentGeneratingFormat={currentGeneratingFormat}
              missingFields={missingFields}
            />
            
            <MainContent
              generatedImages={generatedImages}
              eventData={eventData}
              onExport={onExport}
              hasStartedGeneration={hasStartedGeneration}
            />
          </div>
          
          <footer className="bg-blue-800 text-white py-4 text-center">
            <p>© 2025 Gerador Automático de Artes</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
