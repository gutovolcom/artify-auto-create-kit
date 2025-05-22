
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { platformConfigs } from "@/lib/platformConfigs";
import { toast } from "sonner";

interface GeneratedImage {
  platform: string;
  format: string;
  url: string;
}

export const useImageGenerator = () => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImages = async (eventData: EventData) => {
    if (!eventData.title || !eventData.date || !eventData.kvImageId) {
      setError("Informações incompletas. Preencha todos os campos obrigatórios.");
      toast.error("Preencha todos os campos obrigatórios");
      return [];
    }

    setIsGenerating(true);
    setError(null);

    try {
      // In a real app, this would be an API call to generate images
      // Here we'll simulate the generation with a timeout
      
      const newGeneratedImages: GeneratedImage[] = [];
      
      // For each selected platform, generate images in their formats
      for (const platformId of eventData.platforms) {
        const platform = platformConfigs[platformId];
        
        if (platform) {
          for (const format of platform.formats) {
            // In a real implementation, this would be the URL returned from the backend
            // For now, we'll use placeholder.svg, but in a real app this would be 
            // actual generated image URLs with the styling we're showing in the preview
            newGeneratedImages.push({
              platform: platformId,
              format,
              // We're using the same placeholder for simulation
              url: "/placeholder.svg", 
            });
          }
        }
      }
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setGeneratedImages(newGeneratedImages);
      toast.success("Imagens geradas com sucesso!");
      return newGeneratedImages;
    } catch (err) {
      const errorMessage = "Erro ao gerar imagens. Tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = async () => {
    if (generatedImages.length === 0) {
      const errorMessage = "Nenhuma imagem para exportar.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }

    setIsGenerating(true);
    
    try {
      // In a real app, this would call an API to create and download a ZIP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulated successful download
      toast.success("Arquivo ZIP baixado com sucesso!");
      return true;
    } catch (err) {
      const errorMessage = "Erro ao criar arquivo ZIP. Tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatedImages,
    isGenerating,
    error,
    generateImages,
    downloadZip
  };
};
