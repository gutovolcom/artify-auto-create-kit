// src/hooks/useImageGenerator/index.ts (CORRIGIDO E COMPLETO)

import { useState } from "react";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { validateEventData } from "./helpers";
import { generateImagesForFormats } from "./imageGeneration";
import { GeneratedImage, UseImageGeneratorReturn } from "./types";
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

  const generateImages = async (eventData: EventData): Promise<GeneratedImage[]> => {
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      setError(validation.error!);
      toast.error(validation.error!);
      return [];
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setGeneratedImages([]);
    setCurrentGeneratingFormat("");

    try {
      console.log('Starting image generation for event:', eventData);
      
      console.log('Refreshing templates and layouts before generation...');
      await refetchTemplates();
      await refreshAllLayouts();
      
      // Acessamos a variável 'templates' que foi atualizada pelo refetch
      const selectedTemplate = templates.find(t => t.id === eventData.kvImageId);
      
      if (!selectedTemplate) {
        // Tenta uma segunda vez após um pequeno delay, caso o estado não tenha atualizado a tempo
        await new Promise(r => setTimeout(r, 200));
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
        getLayout,
        setGenerationProgress,
        setCurrentGeneratingFormat
      );
      
      setGenerationProgress(100);
      setCurrentGeneratingFormat("Finalizando...");
      
      console.log('All images generated with fresh layout data:', allGeneratedImages.length);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGeneratedImages(allGeneratedImages);
      
      if (allGeneratedImages.length > 0) {
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
      setGeneratedImages([]);
      return [];
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentGeneratingFormat("");
    }
  };

  // CORREÇÃO: A assinatura da função foi atualizada para corresponder aos tipos
  const downloadZip = async (images: GeneratedImage[], eventData?: EventData): Promise<boolean> => {
    if (images.length === 0) {
      toast.error("Nenhuma imagem para exportar.");
      return false;
    }

    setIsGenerating(true);
    
    try {
      const zip = new JSZip();
      
      const sanitizedTitle = eventData?.classTheme 
        ? eventData.classTheme.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
        : eventData?.date?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
        || 'Event';
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
          const response = await fetch(image.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image for ${image.platform}`);
          }
          const blob = await response.blob();
          const filename = `${sanitizedTitle}_${image.platform}.png`;
          zip.file(filename, blob);
        } catch (imageError) {
          console.warn(`Failed to add ${image.platform} to ZIP:`, imageError);
        }
      }
      
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizedTitle}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success("Arquivo ZIP baixado com sucesso!");
      return true;
      
    } catch (err) {
      console.error('ZIP creation error:', err);
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