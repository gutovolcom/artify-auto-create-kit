
import { useState, useEffect } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { MainLayout } from "@/components/MainLayout";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useNotifications } from "@/hooks/useNotifications";
import { EventData } from "@/pages/Index";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormValues } from "@/lib/validators";
import { logger } from "@/utils/logger";

interface UserInterfaceProps {
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export const UserInterface = ({ userEmail, isAdmin, onLogout }: UserInterfaceProps) => {
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const notifications = useNotifications();
  
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
    logger.stateUpdate('UserInterface', 'eventData->form', eventData);
    setValue('kvImageId', eventData.kvImageId ?? "");
    setValue('classTheme', eventData.classTheme ?? "");
    setValue('selectedTeacherIds', eventData.selectedTeacherIds ?? []);
    setValue('date', eventData.date ?? "");
    setValue('time', eventData.time ?? "");
  }, [eventData, setValue]);

  // Bidirectional sync: form values -> eventData
  useEffect(() => {
    logger.stateUpdate('UserInterface', 'form->eventData', watchedValues);
    
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
      logger.stateUpdate('UserInterface', 'eventData', syncedEventData);
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
    logger.stateUpdate('UserInterface', 'eventData', data);
    setEventData((prev) => ({ ...prev, ...data }));
  };
  
  const handleGenerate = async () => {
    logger.info('Generate button clicked - starting validation');
    logger.formValidation('form', isValid, errors);
    logger.stateUpdate('UserInterface', 'eventData before sync', eventData);
    logger.stateUpdate('UserInterface', 'form values before sync', watchedValues);
    
    // Trigger validation for all fields
    const isFormValid = await trigger();
    logger.formValidation('complete form', isFormValid, errors);
    
    if (!isFormValid) {
      logger.warn('Form validation failed', { errors });
      notifications.error.requiredFields();
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

    logger.info('Pre-generation sync completed', { preGenerationEventData });

    setHasStartedGeneration(true);
    
    try {
      logger.info('Starting generation with directly passed event data', { preGenerationEventData });
      const images = await generateImages(preGenerationEventData);
      if (images.length > 0) {
        logger.info('Images generated successfully', { count: images.length });
        // TYPE FIX: Only update persistent state AFTER successful generation with complete type conversion
        const stateCompatibleData = {
          ...preGenerationEventData,
          // Ensure ALL properties match the expected state type with proper defaults
          teacherNames: preGenerationEventData.teacherNames || [],
          platforms: preGenerationEventData.platforms || [],
          teacherImages: preGenerationEventData.teacherImages || [],
          classTheme: preGenerationEventData.classTheme || "",
          boxColor: preGenerationEventData.boxColor || "#dd303e",
          boxFontColor: preGenerationEventData.boxFontColor || "#FFFFFF",
          fontColor: preGenerationEventData.fontColor || "#000000",
          textColor: preGenerationEventData.textColor || "#FFFFFF",
          backgroundColorType: preGenerationEventData.backgroundColorType || "red",
          lessonThemeBoxStyle: preGenerationEventData.lessonThemeBoxStyle || "Transparent",
          selectedTeacherIds: preGenerationEventData.selectedTeacherIds || [],
          teacherName: preGenerationEventData.teacherName || "",
          professorPhotos: preGenerationEventData.professorPhotos || "",
        };
        setEventData(stateCompatibleData);
        notifications.success.imagesGenerated(images.length);
      } else {
        logger.warn('No images generated');
        notifications.error.noImagesGenerated();
      }
    } catch (error) {
      logger.error('Generation error', { error });
      notifications.error.generationFailed();
    }
  };

  const handleExport = async () => {
    const success = await downloadZip(generatedImages, eventData.subtitle || "artes");
    if (success) {
      notifications.success.zipDownloaded();
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
    return (
      <AdminPanel 
        userEmail={userEmail}
        onLogout={onLogout} 
        onSwitchToUser={handleSwitchToUser}
      />
    );  
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
