
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Navbar } from "@/components/Navbar";
import { UserHeader } from "@/components/UserHeader";
import { EventDataTabs } from "@/components/EventDataTabs";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export interface EventData {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  kvImageId: string | null;
  teacherImages: string[];
  platforms: string[];
  classTheme?: string;
  boxColor?: string;
  boxFontColor?: string;
  fontColor?: string;
  textColor?: string;
  backgroundColorType?: string;
  selectedTeacherId?: string;
  teacherName?: string;
  professorPhotos?: string;
  lessonThemeBoxStyle?: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    subtitle: "",
    date: "",
    time: "",
    kvImageId: null,
    teacherImages: [],
    platforms: [],
    classTheme: "",
    boxColor: "#dd303e",
    boxFontColor: "#FFFFFF",
    fontColor: "#000000",
    textColor: "#FFFFFF",
    backgroundColorType: "red",
    lessonThemeBoxStyle: "Transparent",
    selectedTeacherId: "",
    teacherName: "",
    professorPhotos: "",
  });
  
  const [activeTab, setActiveTab] = useState("input");
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
    
    // TEMPORARY: Hardcode lessonThemeBoxStyle for testing
    const testEventData = {
      ...eventData,
      lessonThemeBoxStyle: "Green"
    };
    
    console.log('Testing with hardcoded lessonThemeBoxStyle:', testEventData);
    
    try {
      const images = await generateImages(testEventData);
      if (images.length > 0) {
        toast.success("Imagens geradas com sucesso!");
        setActiveTab("export");
      } else {
        toast.error("Nenhuma imagem foi gerada. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Erro durante a geração das imagens. Tente novamente.");
    }
  };

  const handleExport = async () => {
    const success = await downloadZip();
    if (success) {
      toast.success("Arquivo ZIP baixado com sucesso!");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  const handleSwitchToUser = () => {
    setUserType('user');
  };

  const handleToggleUserType = () => {
    setUserType(userType === 'admin' ? 'user' : 'admin');
  };

  // Check if form is ready for generation
  const isFormReady = eventData.title && eventData.date && eventData.kvImageId && eventData.professorPhotos;

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

  // Show user interface for regular users
  const fieldChecks = [
    { condition: !eventData.title, message: "Título do evento" },
    { condition: !eventData.date, message: "Data" },
    { condition: !eventData.kvImageId, message: "Template de imagem" },
    { condition: !eventData.professorPhotos, message: "Foto do professor" },
  ];
  const actualMissingFields = fieldChecks
    .filter(check => check.condition)
    .map(check => check.message);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <UserHeader
        userEmail={user.email}
        isAdmin={isAdmin}
        userType={userType}
        onToggleUserType={handleToggleUserType}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
          Gerador Automático de Artes para Redes Sociais
        </h1>
       
        <EventDataTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          eventData={eventData}
          updateEventData={updateEventData}
          onGenerate={handleGenerate}
          onExport={handleExport}
          isGenerating={isGenerating}
          isFormReady={isFormReady}
          generationProgress={generationProgress}
          currentGeneratingFormat={currentGeneratingFormat}
          generatedImages={generatedImages}
        />
      </main>
      
      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 Gerador Automático de Artes</p>
      </footer>
    </div>
  );
};

export default Index;
