// src/hooks/useImageGenerator/index.ts (CORRIGIDO E FINALIZADO)

import { useState } from "react";
import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { validateEventData } from "./helpers";
import { generateImagesForFormats } from "./imageGeneration";
import { GeneratedImage, UseImageGeneratorReturn } from "./types";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client"; // Importa o cliente Supabase

export const useImageGenerator = (): UseImageGeneratorReturn => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingFormat, setCurrentGeneratingFormat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
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
    setGeneratedImages([]);
    setCurrentGeneratingFormat("");

    try {
      console.log('Starting image generation for event:', eventData);

      // Limpa o cache de layouts para garantir que os layouts também sejam buscados novamente
      await refreshAllLayouts();
      
      // *** A CORREÇÃO PRINCIPAL ESTÁ AQUI ***
      // Em vez de usar a lista de templates do estado (que pode estar stale),
      // buscamos diretamente o template selecionado do banco de dados.
      console.log(`Fetching fresh data for template ID: ${eventData.kvImageId}...`);
      const { data: selectedTemplate, error: templateError } = await supabase
        .from('templates')
        .select('*, formats:template_formats(*)')
        .eq('id', eventData.kvImageId)
        .single();

      if (templateError || !selectedTemplate) {
        console.error('Template fetching error:', templateError);
        throw new Error("O template selecionado não pôde ser encontrado. Tente atualizar a página.");
      }
      
      console.log('Using fresh template for generation:', selectedTemplate);
      
      const allGeneratedImages = await generateImagesForFormats(
        eventData,
        selectedTemplate,
        getLayout, // Passamos a função getLayout, que já força o refresh de cada layout
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
          if (!response.ok) throw new Error(`Failed to fetch image for ${image.platform}`);
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