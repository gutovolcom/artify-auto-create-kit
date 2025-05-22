
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { platformConfigs } from "@/lib/platformConfigs";

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
            newGeneratedImages.push({
              platform: platformId,
              format,
              url: "/placeholder.svg", // This would be the URL of the generated image
            });
          }
        }
      }
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setGeneratedImages(newGeneratedImages);
      return newGeneratedImages;
    } catch (err) {
      setError("Erro ao gerar imagens. Tente novamente.");
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadZip = async () => {
    if (generatedImages.length === 0) {
      setError("Nenhuma imagem para exportar.");
      return false;
    }

    setIsGenerating(true);
    
    try {
      // In a real app, this would call an API to create and download a ZIP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulated successful download
      return true;
    } catch (err) {
      setError("Erro ao criar arquivo ZIP. Tente novamente.");
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
