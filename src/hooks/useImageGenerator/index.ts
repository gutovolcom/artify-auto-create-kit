
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { validateEventData } from "./helpers";
import { generateImagesForFormats } from "./imageGeneration";
import { GeneratedImage, UseImageGeneratorReturn } from "./types";

export const useImageGenerator = (): UseImageGeneratorReturn => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingFormat, setCurrentGeneratingFormat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { templates, refetch: refetchTemplates } = useSupabaseTemplates();
  const { logActivity } = useActivityLog();
  const { getLayout, refreshAllLayouts } = useLayoutEditor();

  const generateImages = async (eventData: EventData) => {
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      setError(validation.error!);
      toast.error(validation.error!);
      return [];
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setGeneratedImages([]); // Clear previous images
    setCurrentGeneratingFormat("");

    try {
      console.log('Starting image generation for event:', eventData);
      
      // Refresh templates and layout data to get the latest versions
      console.log('Refreshing templates and layouts before generation...');
      await refetchTemplates();
      await refreshAllLayouts();
      
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
      console.log('Using template for generation with fresh data:', templateToUse);
      
      const allGeneratedImages = await generateImagesForFormats(
        eventData,
        templateToUse,
        getLayout, // This will force refresh layouts during generation
        setGenerationProgress,
        setCurrentGeneratingFormat
      );
      
      // Complete progress
      setGenerationProgress(100);
      setCurrentGeneratingFormat("Finalizando...");
      
      console.log('All images generated with fresh layout data:', allGeneratedImages.length);
      
      // Wait a moment before setting final results
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Only set images after ALL are generated
      setGeneratedImages(allGeneratedImages);
      
      if (allGeneratedImages.length > 0) {
        // Log the activity
        try {
          await logActivity(eventData, allGeneratedImages.map(img => img.platform));
        } catch (logError) {
          console.warn('Failed to log activity:', logError);
        }
        
        toast.success(`${allGeneratedImages.length} imagens geradas com layouts atualizados!`);
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
      setGenerationProgress(0);
      setCurrentGeneratingFormat("");
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
    generationProgress,
    currentGeneratingFormat,
    error,
    generateImages,
    downloadZip
  };
};
