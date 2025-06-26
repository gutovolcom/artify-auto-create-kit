import { EventData } from "@/pages/Index";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { TemplateSection } from "@/components/sidebar/TemplateSection";
import { EventDetailsSection } from "@/components/sidebar/EventDetailsSection";
import { StyleSection } from "@/components/sidebar/StyleSection";
import { TeacherSection } from "@/components/sidebar/TeacherSection";
import { FormatsSection } from "@/components/sidebar/FormatsSection";
import { GenerationSection } from "@/components/sidebar/GenerationSection";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormValues } from "@/lib/validators";

interface AppSidebarProps {
  userEmail: string;
  isAdmin: boolean;
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
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
}: AppSidebarProps) => {
  const { templates } = useSupabaseTemplates();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: "onChange",
    defaultValues: {
      kvImageId: eventData.kvImageId ?? "",
      classTheme: eventData.classTheme ?? "",
      selectedTeacherIds: eventData.selectedTeacherIds ?? [],
      date: eventData.date ?? "",
      time: eventData.time ?? "",
    }
  });

  const { errors, isValid, trigger } = form.formState;

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
    updateEventData({
      selectedTeacherIds: teacherIds,
      teacherImages: teacherImages,
      teacherNames: teacherNames
    });
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
          onTemplateSelect={(id) => updateEventData({ kvImageId: id })}
          error={errors.kvImageId?.message}
        />

        <EventDetailsSection
          classTheme={eventData.classTheme || ""}
          date={eventData.date}
          time={eventData.time}
          onUpdate={(data) => updateEventData(data)}
          errors={{
            classTheme: errors.classTheme?.message,
            date: errors.date?.message,
            time: errors.time?.message,
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
          error={errors.selectedTeacherIds?.message}
        />

        <FormatsSection
          availableFormats={availableFormats}
          selectedPlatforms={eventData.platforms}
          onPlatformChange={(platforms) => updateEventData({ platforms })}
        />

        <GenerationSection
          isGenerating={isGenerating}
          generationProgress={0}
          currentGeneratingFormat=""
          isFormReady={isValid}
          missingFields={Object.keys(errors)}
          onGenerate={async () => {
            const valid = await trigger();
            if (valid) onGenerate();
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
};
