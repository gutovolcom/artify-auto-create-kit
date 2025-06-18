
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { MainLayout } from "@/components/MainLayout";
import { EventForm } from "@/components/EventForm";
import { ImageSelector } from "@/components/ImageSelector";
import { GeneratedGallery } from "@/components/GeneratedGallery";
import { ExportButton } from "@/components/ExportButton";
import { GenerateButton } from "@/components/GenerateButton";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg"
        >
          Carregando...
        </motion.div>
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

  const renderContent = () => {
    switch (activeTab) {
      case "input":
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold mb-2">Create New Artwork</h1>
              <p className="text-muted-foreground mb-8">
                Fill in the event details and select a template to generate your artwork
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <EventForm eventData={eventData} updateEventData={updateEventData} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ImageSelector
                  selectedImageId={eventData.kvImageId}
                  onSelect={(id) => updateEventData({ kvImageId: id })}
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-8"
            >
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
            </motion.div>
          </div>
        );

      case "export":
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold mb-2">Generated Artwork</h1>
              <p className="text-muted-foreground mb-8">
                Your artwork has been generated. Preview and download your images.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GeneratedGallery images={generatedImages} eventData={eventData} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <ExportButton onClick={handleExport} disabled={generatedImages.length === 0} />
            </motion.div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Section Coming Soon</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        );
    }
  };

  // Show user interface with new layout
  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
};

export default Index;
