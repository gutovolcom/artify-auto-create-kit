
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { EventData } from "@/pages/Index";
import { GeneratedImage } from "@/hooks/useImageGenerator/types";
import { Navbar } from "@/components/Navbar";
import { UseFormReturn } from "react-hook-form";
import { EventFormValues } from "@/lib/validators";

interface MainLayoutProps {
  userEmail: string;
  isAdmin: boolean;
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  generatedImages: GeneratedImage[];
  onExport: () => void;
  hasStartedGeneration: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
  form: UseFormReturn<EventFormValues>;
  isFormValid: boolean;
  formErrors: any;
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
  generatedImages,
  onExport,
  hasStartedGeneration,
  onAdminPanel,
  onLogout,
  form,
  isFormValid,
  formErrors,
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

        {/* CONTEÚDO COM LAYOUT FIXO */}
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR FIXA */}
          <div className="w-[360px] shrink-0 border-r bg-white">
            <AppSidebar
              userEmail={userEmail}
              isAdmin={isAdmin}
              eventData={eventData}
              updateEventData={updateEventData}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              onAdminPanel={onAdminPanel}
              onLogout={onLogout}
              form={form}
              isFormValid={isFormValid}
              formErrors={formErrors}
            />
          </div>

          {/* MAIN CONTENT ao lado da sidebar */}
          <div className="flex-1 overflow-hidden flex flex-col">
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
      </div>
    </SidebarProvider>
  );
};
