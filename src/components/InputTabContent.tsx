
import { EventForm } from "@/components/EventForm";
import { ImageSelector } from "@/components/ImageSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { EventData } from "@/pages/Index";

interface InputTabContentProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isFormReady: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
}

export const InputTabContent = ({
  eventData,
  updateEventData,
  onGenerate,
  isGenerating,
  isFormReady,
  generationProgress,
  currentGeneratingFormat
}: InputTabContentProps) => {
  const missingFields = [
    !eventData.title && "Título do evento",
    !eventData.date && "Data",
    !eventData.kvImageId && "Template de imagem",
    !eventData.professorPhotos && "Foto do professor"
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <EventForm eventData={eventData} updateEventData={updateEventData} />
        </div>
        <div>
          <ImageSelector 
            selectedImageId={eventData.kvImageId} 
            onSelect={(id) => updateEventData({ kvImageId: id })}
          />
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
        <GenerateButton
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          disabled={!isFormReady}
          generationProgress={generationProgress}
          currentGeneratingFormat={currentGeneratingFormat}
          missingFields={missingFields}
        />
      </div>
    </div>
  );
};
