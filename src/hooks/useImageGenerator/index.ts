// src/hooks/useImageGenerator/index.ts (CORRIGIDO)

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
    setGeneratedImages([]); // Limpa imagens anteriores
    setCurrentGeneratingFormat("");

    try {
      console.log('Starting image generation for event:', eventData);
      
      // Embora a gente vá forçar o refresh dentro do loop,
      // é uma boa prática garantir que o cache geral esteja limpo antes de começar.
      await refreshAllLayouts();
      
      // Busca a última versão dos templates
      const { data: updatedTemplates } = await refetchTemplates();
      const selectedTemplate = updatedTemplates?.find(t => t.id === eventData.kvImageId);
      
      if (!selectedTemplate) {
        throw new Error("Template não encontrado. Verifique se ele existe ou atualize a página.");
      }
      
      console.log('Using template for generation with fresh data:', selectedTemplate);
      
      const allGeneratedImages = await generateImagesForFormats(
        eventData,
        selectedTemplate,
        getLayout, // Passamos a função getLayout
        setGenerationProgress,
        setCurrentGeneratingFormat
      );
      
      setGenerationProgress(100);
      setCurrentGeneratingFormat("Finalizando...");
      
      console.log('All images generated:', allGeneratedImages.length);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGeneratedImages(allGeneratedImages);
      
      if (allGeneratedImages.length > 0) {
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
      setGeneratedImages([]);
      return [];
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentGeneratingFormat("");
    }
  };

  const downloadZip = async (eventData?: EventData) => {
    if (generatedImages.length === 0) {
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
      
      for (const image of generatedImages) {
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
      toast.error("Erro ao criar arquivo ZIP. Tente novamente.");
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