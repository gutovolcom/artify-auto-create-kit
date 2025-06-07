
import React from 'react';
import { EventData } from '@/pages/Index';
import { PlatformPreviews } from './PlatformPreviews';
import { ExportButton } from './ExportButton';
import { GeneratedImage } from '@/hooks/useImageGenerator/types';

interface ExportTabContentProps {
  eventData: EventData;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  onDownloadZip: () => void;
}

export const ExportTabContent: React.FC<ExportTabContentProps> = ({
  eventData,
  onGenerate,
  isGenerating,
  generatedImages,
  onDownloadZip
}) => {
  return (
    <div className="space-y-6">
      <PlatformPreviews 
        eventData={eventData}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
      />
      
      {generatedImages.length > 0 && (
        <div className="flex justify-center pt-6 border-t">
          <ExportButton
            disabled={isGenerating || generatedImages.length === 0}
            onClick={onDownloadZip}
          />
        </div>
      )}
    </div>
  );
};
