import { useState } from "react";
import { EventData } from "@/pages/Index";
import { platformConfigs } from "@/lib/platformConfigs";
import { toast } from "sonner";
import { renderCanvasWithTemplate } from "@/utils/canvasRenderer";

interface GeneratedImage {
  platform: string;
  format: string;
  url: string;
  bgImageUrl?: string;
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
      // Get the selected template image
      const selectedKvImage = document.querySelector(`[data-image-id="${eventData.kvImageId}"] img`) as HTMLImageElement;
      if (!selectedKvImage) {
        throw new Error("Template image not found");
      }
      
      const bgImageUrl = selectedKvImage.src;
      const newGeneratedImages: GeneratedImage[] = [];
      
      // Generate images for each selected platform
      for (const platformId of eventData.platforms) {
        const platform = platformConfigs[platformId];
        
        if (platform) {
          for (const format of platform.formats) {
            try {
              // Use the canvas renderer to create the image with the selected template
              const generatedImageUrl = await renderCanvasWithTemplate(
                bgImageUrl,
                eventData,
                platform.dimensions.width,
                platform.dimensions.height,
                platformId
              );
              
              newGeneratedImages.push({
                platform: platformId,
                format,
                url: generatedImageUrl,
                bgImageUrl: bgImageUrl,
              });
            } catch (error) {
              console.error(`Error generating image for ${platformId} ${format}:`, error);
              // Continue with other images even if one fails
            }
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
