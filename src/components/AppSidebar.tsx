
import { EventData } from "@/pages/Index";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { TemplateSection } from "@/components/sidebar/TemplateSection";
import { EventDetailsSection } from "@/components/sidebar/EventDetailsSection";
import { StyleSection } from "@/components/sidebar/StyleSection";
import { TeacherSection } from "@/components/sidebar/TeacherSection";
import { FormatsSection } from "@/components/sidebar/FormatsSection";
import { GenerationSection } from "@/components/sidebar/GenerationSection";

const formatDisplayNames = {
  youtube: "YouTube",
  feed: "Feed",
  stories: "Stories",
  bannerGCO: "Banner GCO",
  ledStudio: "LED Studio",
  LP: "LP"
};

const lessonThemeStyleDefinition = {
  'Green': { boxColor: '#CAFF39', fontColor: '#DD303E' },
  'Red': { boxColor: '#DD303E', fontColor: '#CAFF39' },
  'White': { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  'Transparent': { boxColor: null, fontColor: null }
};

interface AppSidebarProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  missingFields: string[];
}

export const AppSidebar = ({
  eventData,
  updateEventData,
  onGenerate,
  isGenerating,
  generationProgress,
  currentGeneratingFormat,
  missingFields,
}: AppSidebarProps) => {
  const { templates } = useSupabaseTemplates();

  const availableFormats = eventData.kvImageId 
    ? templates.find(t => t.id === eventData.kvImageId)?.formats?.map(f => ({
        id: f.format_name,
        label: formatDisplayNames[f.format_name as keyof typeof formatDisplayNames] || f.format_name
      })) || []
    : [];

  const handleLessonThemeStyleChange = (styleName: string) => {
    const selectedStyle = lessonThemeStyleDefinition[styleName as keyof typeof lessonThemeStyleDefinition];

    let newBoxColor = eventData.boxColor;
    let newBoxFontColor = eventData.boxFontColor;

    if (selectedStyle) {
      newBoxColor = selectedStyle.boxColor === null ? 'transparent' : selectedStyle.boxColor;
      newBoxFontColor = selectedStyle.fontColor === null ? (eventData.textColor || '#FFFFFF') : selectedStyle.fontColor;
    } else if (styleName === 'Transparent') {
      newBoxColor = 'transparent';
      newBoxFontColor = eventData.textColor || '#FFFFFF';
    }

    updateEventData({
      lessonThemeBoxStyle: styleName,
      boxColor: newBoxColor,
      boxFontColor: newBoxFontColor
    });
  };

  const handleTextColorChange = (value: string) => {
    updateEventData({ textColor: value });
    if (eventData.lessonThemeBoxStyle === 'Transparent') {
      updateEventData({ boxFontColor: value });
    }
  };

  const handleTeacherSelectionChange = (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => {
    updateEventData({
      selectedTeacherIds: teacherIds,
      teacherImages: teacherImages,
      teacherNames: teacherNames
    });
  };

  const isFormReady = eventData.date && eventData.kvImageId && 
    eventData.selectedTeacherIds && eventData.selectedTeacherIds.length > 0;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-semibold">Configurações do Evento</h2>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <div className="space-y-6">
          <TemplateSection
            selectedTemplateId={eventData.kvImageId}
            onTemplateSelect={(id) => updateEventData({ kvImageId: id })}
          />

          <EventDetailsSection
            classTheme={eventData.classTheme || ""}
            date={eventData.date}
            time={eventData.time}
            onUpdate={(data) => updateEventData(data)}
          />

          <StyleSection
            lessonThemeBoxStyle={eventData.lessonThemeBoxStyle || "Transparent"}
            textColor={eventData.textColor || "#FFFFFF"}
            onStyleChange={handleLessonThemeStyleChange}
            onTextColorChange={handleTextColorChange}
          />

          <TeacherSection
            selectedTeacherIds={eventData.selectedTeacherIds || []}
            onSelectionChange={handleTeacherSelectionChange}
          />

          <FormatsSection
            availableFormats={availableFormats}
            selectedPlatforms={eventData.platforms}
            onPlatformChange={(platforms) => updateEventData({ platforms })}
          />

          <GenerationSection
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            currentGeneratingFormat={currentGeneratingFormat}
            missingFields={missingFields}
            isFormReady={isFormReady}
            onGenerate={onGenerate}
          />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
