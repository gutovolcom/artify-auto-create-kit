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
  currentGeneratingFormat: string | null;
  generatedImages: { url: string; format: string }[];
  onExport: () => void;
  hasStartedGeneration: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
  form: any;
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
      <div className="min-h-screen flex flex-col w-full">
        {/* NAVBAR */}
        <Navbar
          userEmail={userEmail}
          isAdmin={isAdmin}
          isAdminPanel={false}
          onAdminPanel={onAdminPanel}
          onLogout={onLogout}
        />

        {/* CONTENT WITH SIDEBAR LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          {/* FIXED SIDEBAR */}
          <div className="w-[360px] shrink-0 border-r bg-background">
            <AppSidebar
              eventData={eventData}
              updateEventData={updateEventData}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              currentGeneratingFormat={currentGeneratingFormat}
              form={form}
              isFormValid={isFormValid}
              formErrors={formErrors}
              onAdminPanel={onAdminPanel}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <MainContent
              eventData={eventData}
              generatedImages={generatedImages}
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
