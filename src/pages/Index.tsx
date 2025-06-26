
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { usePersistentState } from '@/hooks/usePersistentState';

export interface EventData {
  subtitle: string;
  date: string;
  time: string;
  kvImageId: string | null;
  teacherImages: string[];
  teacherNames?: string[];
  platforms: string[];
  classTheme?: string;
  boxColor?: string;
  boxFontColor?: string;
  fontColor?: string;
  textColor?: string;
  backgroundColorType?: string;
  selectedTeacherIds?: string[];
  teacherName?: string;
  professorPhotos?: string;
  lessonThemeBoxStyle?: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
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

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
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

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin
  const isAdmin = user.email === "henriquetocheto@gmail.com";

  // Show admin panel for admin users
  if (isAdmin && userType === 'admin') {
    return <AdminPanel onLogout={handleLogout} onSwitchToUser={handleSwitchToUser} />;
  }

  // Show user interface with new sidebar layout
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="flex flex-col w-full">
          <Navbar 
            userEmail={user.email} 
            isAdmin={isAdmin}
            onAdminPanel={handleAdminPanel}
            onLogout={handleLogout}
          />
          
          <div className="flex flex-1">
            <AppSidebar
              eventData={eventData}
              updateEventData={updateEventData}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              currentGeneratingFormat={currentGeneratingFormat}
              missingFields={missingFields}
            />
            
            <MainContent
              generatedImages={generatedImages}
              eventData={eventData}
              onExport={handleExport}
              hasStartedGeneration={hasStartedGeneration}
            />
          </div>
          
          <footer className="bg-blue-800 text-white py-4 text-center">
            <p>© 2025 Gerador Automático de Artes</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
