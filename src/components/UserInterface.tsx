
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { MainLayout } from "@/components/MainLayout";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { usePersistentState } from "@/hooks/usePersistentState";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";

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
  
  const { 
    generatedImages, 
    isGenerating, 
    generationProgress,
    currentGeneratingFormat,
    generateImages, 
    downloadZip 
  } = useImageGenerator();
  
  const updateEventData = (data: Partial<EventData>) => {
    setEventData((prev) => ({ ...prev, ...data }));
  };
  
  const handleGenerate = async () => {
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

  // Check if form is ready for generation
  const isFormReady = eventData.date && eventData.kvImageId && 
    eventData.selectedTeacherIds && eventData.selectedTeacherIds.length > 0;

  const missingFields = [
    !eventData.date && "Data",
    !eventData.kvImageId && "Template de imagem",
    !(eventData.selectedTeacherIds && eventData.selectedTeacherIds.length > 0) && "Professor selecionado"
  ].filter(Boolean) as string[];

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
      missingFields={missingFields}
      generatedImages={generatedImages}
      onExport={handleExport}
      hasStartedGeneration={hasStartedGeneration}
      onAdminPanel={handleAdminPanel}
      onLogout={onLogout}
    />
  );
};
