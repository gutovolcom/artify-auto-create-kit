
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { EventForm } from "@/components/EventForm";
import { ImageSelector } from "@/components/ImageSelector";
import { GeneratedGallery } from "@/components/GeneratedGallery";
import { ExportButton } from "@/components/ExportButton";
import { GenerateButton } from "@/components/GenerateButton";
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
    
    try {
      const images = await generateImages(eventData);
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
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Bem-vindo, {user.email}
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <button
                onClick={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {userType === 'admin' ? 'Modo Usuário' : 'Painel Admin'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
          Gerador Automático de Artes para Redes Sociais
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="input">1. Dados do Evento</TabsTrigger>
            <TabsTrigger value="export">2. Exportação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <EventForm eventData={eventData} updateEventData={updateEventData} />
              </div>
              <div>
                <ImageSelector 
                  selectedImageId={eventData.kvImageId} 
                  onSelect={(id) => updateEventData({ kvImageId: id })}
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-8">
              <GenerateButton
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                disabled={!isFormReady}
                generationProgress={generationProgress}
                currentGeneratingFormat={currentGeneratingFormat}
                missingFields={[
                  !eventData.title && "Título do evento",
                  !eventData.date && "Data",
                  !eventData.kvImageId && "Template de imagem",
                  !eventData.professorPhotos && "Foto do professor"
                ].filter(Boolean) as string[]}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-8">
            <GeneratedGallery images={generatedImages} eventData={eventData} />
            <div className="flex justify-center">
              <ExportButton onClick={handleExport} disabled={generatedImages.length === 0} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 Gerador Automático de Artes</p>
      </footer>
    </div>
  );
};

export default Index;
