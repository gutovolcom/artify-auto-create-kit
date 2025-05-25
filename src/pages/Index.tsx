
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { EventForm } from "@/components/EventForm";
import { ImageSelector } from "@/components/ImageSelector";
import { PlatformPreviews } from "@/components/PlatformPreviews";
import { GeneratedGallery } from "@/components/GeneratedGallery";
import { ExportButton } from "@/components/ExportButton";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { toast } from "sonner";

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
  backgroundColorType?: string;
  selectedTeacherId?: string;
  teacherName?: string;
  professorPhotos?: string;
}

const Index = () => {
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    subtitle: "",
    date: "",
    time: "",
    kvImageId: null,
    teacherImages: [],
    platforms: ["youtube", "instagram", "linkedin"],
    classTheme: "",
    boxColor: "#dd303e",
    boxFontColor: "#FFFFFF",
    fontColor: "#000000",
    backgroundColorType: "red",
    selectedTeacherId: "",
    teacherName: "",
    professorPhotos: "",
  });
  
  const [activeTab, setActiveTab] = useState("input");
  const { generatedImages, isGenerating, generateImages, downloadZip } = useImageGenerator();
  
  const updateEventData = (data: Partial<EventData>) => {
    setEventData((prev) => ({ ...prev, ...data }));
  };
  
  const handleGenerate = async () => {
    const images = await generateImages(eventData);
    if (images.length > 0) {
      toast.success("Imagens geradas com sucesso!");
      setActiveTab("export");
    }
  };

  const handleExport = async () => {
    const success = await downloadZip();
    if (success) {
      toast.success("Arquivo ZIP baixado com sucesso!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
          Gerador Automático de Artes para Redes Sociais
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="input">1. Dados do Evento</TabsTrigger>
            <TabsTrigger value="preview">2. Pré-visualização</TabsTrigger>
            <TabsTrigger value="export">3. Exportação</TabsTrigger>
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
          </TabsContent>
          
          <TabsContent value="preview">
            <PlatformPreviews
              eventData={eventData}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </TabsContent>
          
          <TabsContent value="export">
            <GeneratedGallery images={generatedImages.map(img => img.url)} eventData={eventData} />
            <div className="mt-8 flex justify-center">
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
