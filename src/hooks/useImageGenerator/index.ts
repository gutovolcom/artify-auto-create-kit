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
      
      const selectedTemplate = templates.find(t => t.id === eventData.kvImageId);
      if (!selectedTemplate) {
        throw new Error("Template não encontrado. Tente atualizar a página.");
      }
      
      const allGeneratedImages = await generateImagesForFormats(
        eventData,
        selectedTemplate,
        getLayout,
        setGenerationProgress,
        setCurrentGeneratingFormat
      );
      
      setGenerationProgress(100);
      setCurrentGeneratingFormat("Finalizando...");
      
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
    }
  };

  const downloadZip = async (imagesToZip: GeneratedImage[], zipName: string): Promise<boolean> => {
    if (imagesToZip.length === 0) {
      toast.error("Nenhuma imagem para exportar.");
      return false;
    }

    setIsGenerating(true);
    toast.info("Preparando o arquivo .zip, por favor aguarde...");
    
    try {
      const zip = new JSZip();
      const sanitizedTitle = zipName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) || 'Artes';
      
      for (const image of imagesToZip) {
        try {
          const response = await fetch(image.url);
          if (!response.ok) throw new Error(`Falha ao buscar a imagem para ${image.platform}`);
          const blob = await response.blob();
          const filename = `${sanitizedTitle}_${image.platform}.png`;
          zip.file(filename, blob);
        } catch (imageError) {
          console.warn(`Falha ao adicionar ${image.platform} ao ZIP:`, imageError);
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
      link.download = `${sanitizedTitle}_artes.zip`;
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
