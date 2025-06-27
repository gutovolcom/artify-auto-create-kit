
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

  // Sync eventData changes with form state
  useEffect(() => {
    console.log('Syncing eventData with form state:', eventData);
    setValue('kvImageId', eventData.kvImageId ?? "");
    setValue('classTheme', eventData.classTheme ?? "");
    setValue('selectedTeacherIds', eventData.selectedTeacherIds ?? []);
    setValue('date', eventData.date ?? "");
    setValue('time', eventData.time ?? "");
  }, [eventData, setValue]);

  // Watch form changes and update eventData
  const watchedValues = watch();
  useEffect(() => {
    console.log('Form values changed:', watchedValues);
  }, [watchedValues]);
  
  const { 
    generatedImages, 
    isGenerating, 
    generationProgress,
    currentGeneratingFormat,
    generateImages, 
    downloadZip 
  } = useImageGenerator();
  
  const updateEventData = (data: Partial<EventData>) => {
    console.log('Updating eventData:', data);
    setEventData((prev) => ({ ...prev, ...data }));
  };
  
  const handleGenerate = async () => {
    console.log('Generate button clicked - validating form...');
    console.log('Current form state:', { isValid, errors });
    
    // Trigger validation for all fields
    const isFormValid = await trigger();
    console.log('Form validation result:', isFormValid);
    
    if (!isFormValid) {
      console.log('Form validation failed:', errors);
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    console.log('Starting generation with event data:', eventData);
    setHasStartedGeneration(true);
    
    try {
      const images = await generateImages(eventData);
      if (images.length > 0) {
        toast.success("Imagens geradas com sucesso!");
      } else {
        toast.error("Nenhuma imagem foi gerada. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error('Generation error:', error);
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
