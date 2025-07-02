import { EventData } from "@/pages/Index";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { TemplateSection } from "@/components/sidebar/TemplateSection";
import { EventDetailsSection } from "@/components/sidebar/EventDetailsSection";
import { StyleSection } from "@/components/sidebar/StyleSection";
import { TeacherSection } from "@/components/sidebar/TeacherSection";
import { FormatsSection } from "@/components/sidebar/FormatsSection";
import { GenerationSection } from "@/components/sidebar/GenerationSection";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { UseFormReturn } from "react-hook-form";
import { EventFormValues } from "@/lib/validators";

interface AppSidebarProps {
  userEmail: string;
  isAdmin: boolean;
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
  form: UseFormReturn<EventFormValues>;
  isFormValid: boolean;
  formErrors: any;
}

const formatDisplayNames = {
  youtube: "YouTube",
  feed: "Feed",
  stories: "Stories",
  bannerGCO: "Banner GCO",
  ledStudio: "LED Studio",
  LP: "LP"
};

const lessonThemeStyleDefinition = {
  Green: { boxColor: '#CAFF39', fontColor: '#DD303E' },
  Red: { boxColor: '#DD303E', fontColor: '#CAFF39' },
  White: { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  Transparent: { boxColor: null, fontColor: null }
};

export const AppSidebar = ({
  userEmail,
  isAdmin,
  eventData,
  updateEventData,
  onGenerate,
  isGenerating,
  onAdminPanel,
  onLogout,
  form,
  isFormValid,
  formErrors,
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
    const newBoxColor = selectedStyle?.boxColor ?? 'transparent';
    const newBoxFontColor = selectedStyle?.fontColor ?? (eventData.textColor || '#FFFFFF');

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
    console.log('Teacher selection changed:', { teacherIds, teacherImages, teacherNames });
    updateEventData({
      selectedTeacherIds: teacherIds,
      teacherImages: teacherImages,
      teacherNames: teacherNames
    });
    
    // Update form field to trigger validation
    form.setValue('selectedTeacherIds', teacherIds);
    form.trigger('selectedTeacherIds');
  };

  const handleTemplateSelect = (id: string) => {
    console.log('Template selected:', id);
    
    // Find the selected template
    const selectedTemplate = templates.find(t => t.id === id);
    
    // SMART FIX: Auto-populate platforms with all available formats when template is selected
    // Only do this if no formats are currently selected (to respect user preferences)
    if (selectedTemplate && eventData.platforms.length === 0) {
      const availableFormatIds = selectedTemplate.formats?.map(f => f.format_name) || [];
      updateEventData({ 
        kvImageId: id, 
        platforms: availableFormatIds // Auto-select all available formats
      });
    } else {
      updateEventData({ kvImageId: id });
    }
    
    form.setValue('kvImageId', id);
    form.trigger('kvImageId');
  };

  const handleEventDetailsUpdate = (data: { classTheme?: string; date?: string; time?: string }) => {
    console.log('Event details updated:', data);
    updateEventData(data);
    
    // Update form fields
    if (data.classTheme !== undefined) {
      form.setValue('classTheme', data.classTheme);
      form.trigger('classTheme');
    }
    if (data.date !== undefined) {
      form.setValue('date', data.date);
      form.trigger('date');
    }
    if (data.time !== undefined) {
      form.setValue('time', data.time);
      form.trigger('time');
    }
  };

  return (
    <Sidebar className="border-r w-[360px] flex-shrink-0 bg-white overflow-hidden">
      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <img src="/logo-nova.svg" alt="Logo GRAN" className="h-5 w-auto" />
        </div>
        <p className="text-sm text-gray-600">Preencha os campos abaixo:</p>
      </SidebarHeader>

      <SidebarContent className="px-4 pb-4 space-y-3 overflow-hidden">
        <TemplateSection
          selectedTemplateId={eventData.kvImageId}
          onTemplateSelect={handleTemplateSelect}
          error={formErrors.kvImageId?.message}
        />

        <EventDetailsSection
          classTheme={eventData.classTheme || ""}
          date={eventData.date}
          time={eventData.time}
          onUpdate={handleEventDetailsUpdate}
          errors={{
            classTheme: formErrors.classTheme?.message,
            date: formErrors.date?.message,
            time: formErrors.time?.message,
          }}
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
          error={formErrors.selectedTeacherIds?.message}
        />

        <FormatsSection
          availableFormats={availableFormats}
          selectedPlatforms={eventData.platforms}
          onPlatformChange={(platforms) => updateEventData({ platforms })}
        />

        <GenerationSection
          isGenerating={isGenerating}
          isFormValid={isFormValid}
          onGenerate={onGenerate}
        />
      </SidebarContent>
    </Sidebar>
  );
};
