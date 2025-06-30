
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { useNotifications } from "@/hooks/useNotifications";
import { validateEventData } from "./helpers";
import { generateImagesForFormats } from "./imageGeneration";
import { GeneratedImage, UseImageGeneratorReturn } from "./types";
import { logger } from "@/utils/logger";
import JSZip from "jszip";

export const useImageGenerator = (): UseImageGeneratorReturn => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingFormat, setCurrentGeneratingFormat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { templates, refetch: refetchTemplates } = useSupabaseTemplates();
  const { logActivity } = useActivityLog();
  const { getLayout, refreshAllLayouts } = useLayoutEditor();
  const notifications = useNotifications();

  const generateImages = async (eventData: EventData): Promise<GeneratedImage[]> => {
    logger.info('generateImages called with DIRECT eventData (no state dependency)', { eventData });
    
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      logger.error('Event data validation failed', { error: validation.error });
      setError(validation.error!);
      notifications.error.requiredFields();
      return [];
    }

    // CRITICAL: Additional state validation check with direct eventData parameter
    if (!eventData.classTheme || eventData.classTheme.trim() === '') {
      logger.error('Missing classTheme in DIRECT eventData parameter');
      notifications.error.requiredFields();
      return [];
    }

    if (!eventData.date || eventData.date.trim() === '') {
      logger.error('Missing date in DIRECT eventData parameter');
      notifications.error.requiredFields();
      return [];
    }

    if (!eventData.time || eventData.time.trim() === '') {
      logger.error('Missing time in DIRECT eventData parameter');
      notifications.error.requiredFields();
      return [];
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setGeneratedImages([]);
    setCurrentGeneratingFormat("");

    try {
      logger.info('Starting image generation with DIRECT eventData (first generation fix)', { eventData });
      
      logger.info('Refreshing templates and layouts before generation...');
      await refetchTemplates();
      await refreshAllLayouts();
      
      // Acessamos a variável 'templates' que foi atualizada pelo refetch
      const selectedTemplate = templates.find(t => t.id === eventData.kvImageId);
      
      if (!selectedTemplate) {
        // Tenta uma segunda vez após um pequeno delay, caso o estado não tenha atualizado a tempo
        await new Promise(r => setTimeout(r, 200));
        const updatedTemplate = templates.find(t => t.id === eventData.kvImageId);
        if (!updatedTemplate) {
          notifications.error.templateNotFound();
          throw new Error("Template não encontrado. Tente atualizar a página.");
        }
      }
      
      const templateToUse = selectedTemplate || templates.find(t => t.id === eventData.kvImageId);
      logger.info('Using template for generation with fresh data', { template: templateToUse });
      
      const allGeneratedImages = await generateImagesForFormats(
        eventData, // Pass the direct eventData parameter
        templateToUse,
        getLayout,
        setGenerationProgress,
        setCurrentGeneratingFormat
      );
      
      setGenerationProgress(100);
      setCurrentGeneratingFormat("Finalizando...");
      
      logger.info('All images generated with direct eventData and fresh layout data', { count: allGeneratedImages.length });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGeneratedImages(allGeneratedImages);
      
      if (allGeneratedImages.length > 0) {
        try {
          await logActivity(eventData, allGeneratedImages.map(img => img.platform));
        } catch (logError) {
          logger.warn('Failed to log activity', { error: logError });
        }
        
        notifications.success.imagesGenerated(allGeneratedImages.length);
      } else {
        notifications.error.noImagesGenerated();
      }
      
      return allGeneratedImages;
    } catch (err) {
      logger.error('Image generation error', { error: err });
      const errorMessage = err instanceof Error ? err.message : "Erro ao gerar imagens. Tente novamente.";
      setError(errorMessage);
      notifications.error.generationFailed();
      setGeneratedImages([]);
      return [];
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentGeneratingFormat("");
    }
  };

  const downloadZip = async (imagesToZip: GeneratedImage[], zipName: string): Promise<boolean> => {
    if (imagesToZip.length === 0) {
      notifications.error.noImagesToExport();
      return false;
    }

    setIsGenerating(true);
    
    try {
      const zip = new JSZip();
      
      const sanitizedTitle = zipName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50) || "Event";
      
      for (let i = 0; i < imagesToZip.length; i++) {
        const image = imagesToZip[i];

        try {
          const response = await fetch(image.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image for ${image.platform}`);
          }
          const blob = await response.blob();
          const filename = `${sanitizedTitle}_${image.platform}.png`;
          zip.file(filename, blob);
        } catch (imageError) {
          logger.warn(`Failed to add ${image.platform} to ZIP`, { error: imageError });
        }
      }
      
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizedTitle}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return true;

    } catch (err) {
      logger.error("ZIP creation error", { error: err });
      notifications.error.zipCreationFailed();
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatedImages,
    isGenerating,
    generationProgress,
    currentGeneratingFormat,
    error,
    generateImages,
    downloadZip
  };
};
