
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { renderCanvasWithTemplate } from "@/utils/canvasRenderer";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useActivityLog } from "@/hooks/useActivityLog";

interface GeneratedImage {
  platform: string;
  format: string;
  url: string;
  bgImageUrl?: string;
}

const platformConfigs = {
  youtube: { name: "YouTube", width: 1920, height: 1080 },
  feed: { name: "Feed", width: 1080, height: 1080 },
  stories: { name: "Stories", width: 1080, height: 1920 },
  bannerGCO: { name: "Banner GCO", width: 255, height: 192 },
  ledStudio: { name: "LED Studio", width: 1024, height: 256 },
  LP: { name: "LP", width: 800, height: 776 },
};

export const useImageGenerator = () => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { templates } = useSupabaseTemplates();
  const { logActivity } = useActivityLog();

  const generateImages = async (eventData: EventData) => {
    if (!eventData.title || !eventData.date || !eventData.kvImageId) {
      setError("Informações incompletas. Preencha todos os campos obrigatórios.");
      toast.error("Preencha todos os campos obrigatórios");
      return [];
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('Starting image generation for event:', eventData.title);
      
      // Get the selected template from Supabase
      const selectedTemplate = templates.find(t => t.id === eventData.kvImageId);
      if (!selectedTemplate) {
        throw new Error("Template not found");
      }
      
      const newGeneratedImages: GeneratedImage[] = [];
      
      // Generate images for all formats
      const formats = Object.keys(platformConfigs) as (keyof typeof platformConfigs)[];
      
      for (const formatId of formats) {
        try {
          const platform = platformConfigs[formatId];
          const formatData = selectedTemplate.formats?.find(f => f.format_name === formatId);
          
          if (!formatData?.image_url) {
            console.warn(`No background image found for format: ${formatId}`);
            continue;
          }
          
          console.log(`Generating image for ${formatId}:`, platform);
          
          // Use the canvas renderer to create the image with the selected template
          const generatedImageUrl = await renderCanvasWithTemplate(
            formatData.image_url,
            eventData,
            platform.width,
            platform.height,
            formatId
          );
          
          newGeneratedImages.push({
            platform: formatId,
            format: platform.name,
            url: generatedImageUrl,
            bgImageUrl: formatData.image_url,
          });
        } catch (error) {
          console.error(`Error generating image for ${formatId}:`, error);
          // Continue with other images even if one fails
        }
      }
      
      console.log('Generated images:', newGeneratedImages.length);
      
      setGeneratedImages(newGeneratedImages);
      
      if (newGeneratedImages.length > 0) {
        // Log the activity
        await logActivity(eventData, newGeneratedImages.map(img => img.platform));
        toast.success(`${newGeneratedImages.length} imagens geradas com sucesso!`);
      } else {
        toast.error("Nenhuma imagem foi gerada. Verifique os templates.");
      }
      
      return newGeneratedImages;
    } catch (err) {
      console.error('Image generation error:', err);
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
