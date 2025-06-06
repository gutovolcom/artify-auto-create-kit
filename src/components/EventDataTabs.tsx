
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputTabContent } from "./InputTabContent";
import { ExportTabContent } from "./ExportTabContent";
import { EventData } from "@/pages/Index";
import { GeneratedImage } from "@/hooks/useImageGenerator/types";

interface EventDataTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  onExport: () => void;
  isGenerating: boolean;
  isFormReady: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  generatedImages: GeneratedImage[];
}

export const EventDataTabs = ({
  activeTab,
  setActiveTab,
  eventData,
  updateEventData,
  onGenerate,
  onExport,
  isGenerating,
  isFormReady,
  generationProgress,
  currentGeneratingFormat,
  generatedImages
}: EventDataTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="input">1. Dados do Evento</TabsTrigger>
        <TabsTrigger value="export">2. Exportação</TabsTrigger>
      </TabsList>
      
      <TabsContent value="input">
        <InputTabContent
          eventData={eventData}
          updateEventData={updateEventData}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          isFormReady={isFormReady}
          generationProgress={generationProgress}
          currentGeneratingFormat={currentGeneratingFormat}
        />
      </TabsContent>
      
      <TabsContent value="export">
        <ExportTabContent
          generatedImages={generatedImages}
          eventData={eventData}
          onExport={onExport}
        />
      </TabsContent>
    </Tabs>
  );
};
