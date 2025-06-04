
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { renderCanvasWithTemplate } from "@/utils/canvasRenderer";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";

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
  const { templates, refetch: refetchTemplates } = useSupabaseTemplates();
  const { logActivity } = useActivityLog();
  const { getLayout } = useLayoutEditor();

  const generateImages = async (eventData: EventData) => {
    if (!eventData.title || !eventData.date || !eventData.kvImageId) {
      setError("Informações incompletas. Preencha todos os campos obrigatórios.");
      toast.error("Preencha todos os campos obrigatórios");
      return [];
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]); // Clear previous images

    try {
      console.log('Starting image generation for event:', eventData);
      
      // Refresh templates to get the latest data
      await refetchTemplates();
      
      // Get the selected template from the refreshed data
      const selectedTemplate = templates.find(t => t.id === eventData.kvImageId);
      if (!selectedTemplate) {
        // Try to fetch templates again if not found
        await refetchTemplates();
        const updatedTemplate = templates.find(t => t.id === eventData.kvImageId);
        if (!updatedTemplate) {
          throw new Error("Template não encontrado. Tente atualizar a página.");
        }
      }
      
      const templateToUse = selectedTemplate || templates.find(t => t.id === eventData.kvImageId);
      console.log('Using template for generation:', templateToUse);
      
      const allGeneratedImages: GeneratedImage[] = [];
      
      // Generate images for all formats sequentially
      const formats = Object.keys(platformConfigs) as (keyof typeof platformConfigs)[];
      
      for (const formatId of formats) {
        try {
          const platform = platformConfigs[formatId];
          const formatData = templateToUse?.formats?.find(f => f.format_name === formatId);
          
          if (!formatData?.image_url) {
            console.warn(`No background image found for format: ${formatId}, skipping...`);
            continue;
          }
          
          console.log(`Generating image for ${formatId}:`, {
            platform,
            backgroundUrl: formatData.image_url,
            eventData
          });
          
          // Get layout configuration for this format
          const layoutConfig = await getLayout(templateToUse.id, formatId);
          console.log(`Layout config for ${formatId}:`, layoutConfig);
          
          // Prepare the complete event data for rendering
          const completeEventData = {
            ...eventData,
            // Ensure professor photo is available
            professorPhotos: eventData.professorPhotos || eventData.teacherImages?.[0] || "",
            // Ensure all required fields are present
            classTheme: eventData.classTheme || "",
            teacherName: eventData.teacherName || "",
            boxColor: eventData.boxColor || "#dd303e",
            boxFontColor: eventData.boxFontColor || "#FFFFFF",
            textColor: eventData.textColor || "#FFFFFF"
          };
          
          console.log(`Complete event data for ${formatId}:`, completeEventData);
          
          // Use the canvas renderer to create the image
          const generatedImageUrl = await renderCanvasWithTemplate(
            formatData.image_url,
            completeEventData,
            platform.width,
            platform.height,
            formatId,
            layoutConfig?.layout_config || null
          );
          
          const newImage = {
            platform: formatId,
            format: platform.name,
            url: generatedImageUrl,
            bgImageUrl: formatData.image_url,
          };
          
          allGeneratedImages.push(newImage);
          console.log(`Successfully generated image for ${formatId}`);
          
        } catch (error) {
          console.error(`Error generating image for ${formatId}:`, error);
          // Continue with other images even if one fails
        }
      }
      
      console.log('All images generated:', allGeneratedImages.length);
      
      // Only set images after ALL are generated
      setGeneratedImages(allGeneratedImages);
      
      if (allGeneratedImages.length > 0) {
        // Log the activity
        try {
          await logActivity(eventData, allGeneratedImages.map(img => img.platform));
        } catch (logError) {
          console.warn('Failed to log activity:', logError);
        }
        
        toast.success(`${allGeneratedImages.length} imagens geradas com sucesso!`);
      } else {
        toast.error("Nenhuma imagem foi gerada. Verifique os templates e tente novamente.");
      }
      
      return allGeneratedImages;
    } catch (err) {
      console.error('Image generation error:', err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao gerar imagens. Tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      setGeneratedImages([]); // Clear any partial results
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
