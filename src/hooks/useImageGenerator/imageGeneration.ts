// src/hooks/useImageGenerator/imageGeneration.ts

import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { renderCanvasWithTemplate } from "@/utils/canvasRenderer";
import { platformConfigs } from "@/lib/platformConfigs";
import { normalizeTeacherPhotos } from "./helpers";
import { GeneratedImage } from "./types"; // Agora importa o tipo corrigido

export const generateImagesForFormats = async (
  eventData: EventData,
  selectedTemplate: any,
  getLayout: (templateId: string, formatName: string, forceRefresh?: boolean) => Promise<any>,
  setGenerationProgress: (progress: number) => void,
  setCurrentGeneratingFormat: (format: string) => void
): Promise<GeneratedImage[]> => {
  const teacherPhotos = normalizeTeacherPhotos(eventData);
  const warningsShown = new Set<string>();

  const formats = Object.keys(platformConfigs) as (keyof typeof platformConfigs)[];
  const totalFormats = formats.length;
  let generatedCount = 0;

  const generationPromises = formats.map(async (formatId) => {
    const platform = platformConfigs[formatId];
    try {
      setCurrentGeneratingFormat(platform.name);
      
      const formatData = selectedTemplate?.formats?.find((f: any) => f.format_name === formatId);
      
      if (!formatData?.image_url) {
        if (!warningsShown.has(formatId)) {
          toast.warning(`Formato ${platform.name} não encontrado no template.`);
          warningsShown.add(formatId);
        }
        return null;
      }

      const layoutConfig = await getLayout(selectedTemplate.id, formatId, true);

      const completeEventData: EventData = {
        ...eventData,
        teacherImages: teacherPhotos,
        classTheme: eventData.classTheme || "",
        teacherName: eventData.teacherName || "",
        boxColor: eventData.boxColor || "#dd303e",
        boxFontColor: eventData.boxFontColor || "#FFFFFF",
        textColor: eventData.textColor || "#FFFFFF"
      };

      const generatedImageUrl = await renderCanvasWithTemplate(
        formatData.image_url,
        completeEventData,
        platform.width,
        platform.height,
        formatId,
        layoutConfig?.layout_config || null
      );
      
      generatedCount++;
      setGenerationProgress(Math.round((generatedCount / totalFormats) * 100));

      return {
        platform: formatId,
        format: platform.name,
        url: generatedImageUrl,
        bgImageUrl: formatData.image_url,
      };

    } catch (error) {
      console.error(`Error generating image for ${formatId}:`, error);
      toast.error(`Erro ao gerar imagem para ${platform.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      generatedCount++;
      setGenerationProgress(Math.round((generatedCount / totalFormats) * 100));
      return null;
    }
  });

  const results = await Promise.all(generationPromises);
  
  // O predicado de tipo agora funciona perfeitamente
  const allGeneratedImages = results.filter((img): img is GeneratedImage => img !== null);

  if (warningsShown.size > 0) {
    toast.info(`${allGeneratedImages.length} imagens geradas. ${warningsShown.size} formatos não encontrados no template.`);
  } else if (allGeneratedImages.length > 0) {
    toast.success("Todas as artes foram geradas com sucesso!");
  } else {
    toast.error("Nenhuma arte pôde ser gerada.");
  }
  
  return allGeneratedImages;
};