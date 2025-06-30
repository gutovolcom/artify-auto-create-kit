
import { useState, useEffect } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { MainLayout } from "@/components/MainLayout";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { usePersistentState } from "@/hooks/usePersistentState";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormValues } from "@/lib/validators";

interface UserInterfaceProps {
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export const UserInterface = ({ userEmail, isAdmin, onLogout }: UserInterfaceProps) => {
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  
  const [eventData, setEventData] = usePersistentState('artGeneratorForm', {
    subtitle: "",
    date: "",
    time: "",
    kvImageId: null,
    teacherImages: [],
    teacherNames: [],
    platforms: [],
    classTheme: "",
    boxColor: "#dd303e",
    boxFontColor: "#FFFFFF",
    fontColor: "#000000",
    textColor: "#FFFFFF",
    backgroundColorType: "red",
    lessonThemeBoxStyle: "Transparent",
    selectedTeacherIds: [],
    teacherName: "",
    professorPhotos: "",
  });

  // Centralized form management
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

  const { setValue, watch, trigger, formState: { errors, isValid } } = form;

  // Watch form values for real-time sync
  const watchedValues = watch();

  // Sync eventData changes with form state (one-way: eventData -> form)
  useEffect(() => {
    console.log('🔄 Syncing eventData to form state:', eventData);
    setValue('kvImageId', eventData.kvImageId ?? "");
    setValue('classTheme', eventData.classTheme ?? "");
    setValue('selectedTeacherIds', eventData.selectedTeacherIds ?? []);
    setValue('date', eventData.date ?? "");
    setValue('time', eventData.time ?? "");
  }, [eventData, setValue]);

  // Bidirectional sync: form values -> eventData
  useEffect(() => {
    console.log('🔄 Syncing form values back to eventData:', watchedValues);
    
    // Create updated eventData from current form values
    const syncedEventData: Partial<typeof eventData> = {};
    
    if (watchedValues.kvImageId !== eventData.kvImageId) {
      syncedEventData.kvImageId = watchedValues.kvImageId || null;
    }
    if (watchedValues.classTheme !== eventData.classTheme) {
      syncedEventData.classTheme = watchedValues.classTheme || "";
    }
    if (JSON.stringify(watchedValues.selectedTeacherIds) !== JSON.stringify(eventData.selectedTeacherIds)) {
      syncedEventData.selectedTeacherIds = watchedValues.selectedTeacherIds || [];
    }
    if (watchedValues.date !== eventData.date) {
      syncedEventData.date = watchedValues.date || "";
    }
    if (watchedValues.time !== eventData.time) {
      syncedEventData.time = watchedValues.time || "";
    }

    // Only update if there are actual changes to prevent infinite loops
    if (Object.keys(syncedEventData).length > 0) {
      console.log('📝 Updating eventData with form changes:', syncedEventData);
      setEventData((prev) => ({ ...prev, ...syncedEventData }));
    }
  }, [watchedValues, eventData, setEventData]);
  
  const { 
    generatedImages, 
    isGenerating, 
    generationProgress,
    currentGeneratingFormat,
    generateImages, 
    downloadZip 
  } = useImageGenerator();
  
  const updateEventData = (data: Partial<EventData>) => {
    console.log('🔧 Updating eventData:', data);
    setEventData((prev) => ({ ...prev, ...data }));
  };
  
  const handleGenerate = async () => {
    console.log('🚀 Generate button clicked - starting validation...');
    console.log('📋 Current form state:', { isValid, errors });
    console.log('📊 Current eventData before sync:', eventData);
    console.log('📝 Current form values before sync:', watchedValues);
    
    // Trigger validation for all fields
    const isFormValid = await trigger();
    console.log('✅ Form validation result:', isFormValid);
    
    if (!isFormValid) {
      console.log('❌ Form validation failed:', errors);
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // CRITICAL FIX: Pre-generation state sync to ensure eventData is current
    const preGenerationEventData: EventData = {
      ...eventData,
      // Explicitly sync form values to ensure they're current
      kvImageId: watchedValues.kvImageId || eventData.kvImageId,
      classTheme: watchedValues.classTheme || eventData.classTheme,
      selectedTeacherIds: watchedValues.selectedTeacherIds || eventData.selectedTeacherIds,
      date: watchedValues.date || eventData.date,
      time: watchedValues.time || eventData.time,
      // Ensure all required properties are provided with defaults
      teacherNames: eventData.teacherNames || [],
      platforms: eventData.platforms || [],
      teacherImages: eventData.teacherImages || [],
    };

    console.log('🔄 Pre-generation sync completed:', preGenerationEventData);
    console.log('🎯 Text content check before generation:', {
      classTheme: preGenerationEventData.classTheme,
      date: preGenerationEventData.date,
      time: preGenerationEventData.time,
      teacherName: preGenerationEventData.teacherName,
      kvImageId: preGenerationEventData.kvImageId,
      selectedTeacherIds: preGenerationEventData.selectedTeacherIds
    });

    // RACE CONDITION FIX: Don't update state here, pass data directly to generateImages
    // This eliminates the async race condition that caused first-generation failures
    
    setHasStartedGeneration(true);
    
    try {
      console.log('🚀 Starting generation with directly passed event data (no state dependency):', preGenerationEventData);
      const images = await generateImages(preGenerationEventData);
      if (images.length > 0) {
        console.log('✅ Images generated successfully:', images.length);
        // TYPE FIX: Only update persistent state AFTER successful generation with proper type conversion
        const stateCompatibleData = {
          ...preGenerationEventData,
          // Ensure all properties match the expected state type
          teacherNames: preGenerationEventData.teacherNames || [],
          platforms: preGenerationEventData.platforms || [],
          teacherImages: preGenerationEventData.teacherImages || [],
        };
        setEventData(stateCompatibleData);
        toast.success("Imagens geradas com sucesso!");
      } else {
        console.log('❌ No images generated');
        toast.error("Nenhuma imagem foi gerada. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error('💥 Generation error:', error);
      toast.error("Erro durante a geração das imagens. Tente novamente.");
    }
  };

  const handleExport = async () => {
    const success = await downloadZip(generatedImages, eventData.subtitle || "artes");
    if (success) {
      toast.success("Arquivo ZIP baixado com sucesso!");
    }
  };

  const handleAdminPanel = () => {
    setUserType('admin');
  };

  const handleSwitchToUser = () => {
    setUserType('user');
  };

  // Show admin panel for admin users
  if (isAdmin && userType === 'admin') {
    return <AdminPanel onLogout={onLogout} onSwitchToUser={handleSwitchToUser} />;
  }

  // Show user interface with sidebar layout
  return (
    <MainLayout
      userEmail={userEmail}
      isAdmin={isAdmin}
      eventData={eventData}
      updateEventData={updateEventData}
      onGenerate={handleGenerate}
      isGenerating={isGenerating}
      generationProgress={generationProgress}
      currentGeneratingFormat={currentGeneratingFormat}
      generatedImages={generatedImages}
      onExport={handleExport}
      hasStartedGeneration={hasStartedGeneration}
      onAdminPanel={handleAdminPanel}
      onLogout={onLogout}
      form={form}
      isFormValid={isValid}
      formErrors={errors}
    />
  );
};
