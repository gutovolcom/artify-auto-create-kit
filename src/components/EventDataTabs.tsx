
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputTabContent } from './InputTabContent';
import { ExportTabContent } from './ExportTabContent';
import { EventData } from '@/pages/Index';
import { useImageGenerator } from '@/hooks/useImageGenerator';

interface EventDataTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  eventData: EventData;
  setEventData: (data: EventData) => void;
}

export const EventDataTabs: React.FC<EventDataTabsProps> = ({
  activeTab,
  setActiveTab,
  eventData,
  setEventData
}) => {
  const {
    generatedImages,
    isGenerating,
    generationProgress,
    currentGeneratingFormat,
    generateImages,
    downloadZip
  } = useImageGenerator();

  const updateEventData = (data: Partial<EventData>) => {
    setEventData({ ...eventData, ...data });
  };

  const handleGenerate = async () => {
    console.log('Starting image generation with data:', eventData);
    const images = await generateImages(eventData);
    
    // Switch to preview tab after successful generation
    if (images.length > 0) {
      console.log('Generation successful, switching to preview tab');
      setActiveTab('preview');
    }
  };

  const handleDownloadZip = async () => {
    await downloadZip();
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="input">Dados do Evento</TabsTrigger>
        <TabsTrigger value="preview">Prévia das Artes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="input" className="space-y-6">
        <InputTabContent
          eventData={eventData}
          updateEventData={updateEventData}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          currentGeneratingFormat={currentGeneratingFormat}
        />
      </TabsContent>
      
      <TabsContent value="preview" className="space-y-6">
        <ExportTabContent
          eventData={eventData}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          generatedImages={generatedImages}
          onDownloadZip={handleDownloadZip}
        />
      </TabsContent>
    </Tabs>
  );
};
