import { EventData } from "@/pages/Index";
import { toast } from "sonner";
import { renderCanvasWithTemplate } from "@/utils/canvasRenderer";
import { platformConfigs } from "@/lib/platformConfigs";
import { normalizeTeacherPhotos } from "./helpers";
import { GeneratedImage } from "./types";

export const generateImagesForFormats = async (
  eventData: EventData,
  selectedTemplate: any,
  getLayout: (templateId: string, formatName: string, forceRefresh?: boolean) => Promise<any>,
  setGenerationProgress: (progress: number) => void,
  setCurrentGeneratingFormat: (format: string) => void
): Promise<GeneratedImage[]> => {
  const teacherPhotos = normalizeTeacherPhotos(eventData);
  const warningsShown = new Set<string>(); // Usar um Set é mais eficiente para verificar duplicatas

  const formats = Object.keys(platformConfigs) as (keyof typeof platformConfigs)[];
  const totalFormats = formats.length;
  let generatedCount = 0;

  // 1. Mapeia cada formato para uma promessa de geração de imagem.
  //    Todas essas promessas começarão a ser executadas em paralelo.
  const generationPromises = formats.map(async (formatId) => {
    const platform = platformConfigs[formatId];
    try {
      setCurrentGeneratingFormat(platform.name);
      
      const formatData = selectedTemplate?.formats?.find((f: any) => f.format_name === formatId);
      
      if (!formatData?.image_url) {
        console.warn(`No background image found for format: ${formatId}, skipping...`);
        if (!warningsShown.has(formatId)) {
          toast.warning(`Formato ${platform.name} não encontrado no template.`);
          warningsShown.add(formatId);
        }
        return null; // Retorna nulo para formatos que não podem ser gerados
      }

      console.log(`Generating image for ${formatId}:`, {
        platform,
        backgroundUrl: formatData.image_url,
      });

      const layoutConfig = await getLayout(selectedTemplate.id, formatId, true);
      console.log(`Fresh layout config for ${formatId}:`, layoutConfig);

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

      console.log(`Successfully generated image for ${formatId} with fresh layout data`);
      
      // Atualiza o progresso de forma segura
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
      
      // Mesmo com erro, atualizamos o progresso para a barra não travar
      generatedCount++;
      setGenerationProgress(Math.round((generatedCount / totalFormats) * 100));
      return null; // Retorna nulo em caso de erro
    }
  });

  // 2. Promise.all aguarda que TODAS as promessas sejam resolvidas.
  const results = await Promise.all(generationPromises);
  
  // 3. Filtra os resultados para remover qualquer formato que tenha falhado (retornado nulo).
  const allGeneratedImages = results.filter((img): img is GeneratedImage => img !== null);

  // Exibe um resumo final se alguns formatos foram pulados
  if (warningsShown.size > 0) {
    toast.info(`${allGeneratedImages.length} imagens geradas. ${warningsShown.size} formatos não encontrados no template.`, {
      duration: 5000
    });
  } else if (allGeneratedImages.length > 0) {
    toast.success("Todas as artes foram geradas com sucesso!");
  } else {
    toast.error("Nenhuma arte pôde ser gerada. Verifique o template e os dados do evento.");
  }
  
  return allGeneratedImages;
};