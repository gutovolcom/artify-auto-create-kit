
import { GeneratedGallery } from "@/components/GeneratedGallery";
import { ExportButton } from "@/components/ExportButton";
import { EventData } from "@/pages/Index";
import { GeneratedImage } from "@/hooks/useImageGenerator/types";

interface ExportTabContentProps {
  generatedImages: GeneratedImage[];
  eventData: EventData;
  onExport: () => void;
}

export const ExportTabContent = ({
  generatedImages,
  eventData,
  onExport
}: ExportTabContentProps) => {
  return (
    <div className="space-y-8">
      <GeneratedGallery images={generatedImages} eventData={eventData} />
      <div className="flex justify-center">
        <ExportButton onClick={onExport} disabled={generatedImages.length === 0} />
      </div>
    </div>
  );
};
