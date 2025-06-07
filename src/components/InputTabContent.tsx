
import React from 'react';
import { EventData } from '@/pages/Index';
import { EventForm } from './EventForm';
import { ImageSelector } from './ImageSelector';
import { GenerateButton } from './GenerateButton';

interface InputTabContentProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
}

export const InputTabContent: React.FC<InputTabContentProps> = ({
  eventData,
  updateEventData,
  onGenerate,
  isGenerating,
  generationProgress,
  currentGeneratingFormat
}) => {
  // Check for missing required fields
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!eventData.title) missing.push('Título do evento');
    if (!eventData.date) missing.push('Data do evento');
    if (!eventData.kvImageId) missing.push('Template selecionado');
    if (!eventData.classTheme) missing.push('Tema da aula');
    if (eventData.platforms.length === 0) missing.push('Pelo menos um formato');
    return missing;
  };

  const missingFields = getMissingFields();
  const isFormComplete = missingFields.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Event Form */}
      <div className="space-y-6">
        <EventForm 
          eventData={eventData} 
          updateEventData={updateEventData} 
        />
        
        <div className="flex justify-center">
          <GenerateButton
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            disabled={!isFormComplete}
            missingFields={missingFields}
            generationProgress={generationProgress}
            currentGeneratingFormat={currentGeneratingFormat}
          />
        </div>
      </div>

      {/* Right Column - Template Selector */}
      <div>
        <ImageSelector
          selectedImageId={eventData.kvImageId}
          onSelect={(id) => updateEventData({ kvImageId: id })}
        />
      </div>
    </div>
  );
};
