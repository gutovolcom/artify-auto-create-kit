
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventForm } from './EventForm';
import { PlatformPreviews } from './PlatformPreviews';
import { EventData } from '@/pages/Index';

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
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="input">Dados do Evento</TabsTrigger>
        <TabsTrigger value="preview">Prévia das Artes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="input" className="space-y-6">
        <EventForm 
          eventData={eventData} 
          setEventData={setEventData} 
        />
      </TabsContent>
      
      <TabsContent value="preview" className="space-y-6">
        <PlatformPreviews 
          eventData={eventData}
        />
      </TabsContent>
    </Tabs>
  );
};
