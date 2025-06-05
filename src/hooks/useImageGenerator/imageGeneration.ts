
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
  const allGeneratedImages: GeneratedImage[] = [];
  const teacherPhotos = normalizeTeacherPhotos(eventData);
  
  // Generate images for all formats sequentially
  const formats = Object.keys(platformConfigs) as (keyof typeof platformConfigs)[];
  const totalFormats = formats.length;
  
  for (let i = 0; i < formats.length; i++) {
    const formatId = formats[i];
    try {
      const platform = platformConfigs[formatId];
      const formatData = selectedTemplate?.formats?.find((f: any) => f.format_name === formatId);
      
      if (!formatData?.image_url) {
        console.warn(`No background image found for format: ${formatId}, skipping...`);
        continue;
      }
      
      setCurrentGeneratingFormat(platform.name);
      setGenerationProgress(Math.round((i / totalFormats) * 100));
      
      console.log(`Generating image for ${formatId}:`, {
        platform,
        backgroundUrl: formatData.image_url,
        eventData
      });
      
      // Force refresh layout configuration to get the latest saved data
      const layoutConfig = await getLayout(selectedTemplate.id, formatId, true);
      console.log(`Fresh layout config for ${formatId}:`, layoutConfig);
      
      // Prepare the complete event data for rendering with normalized teacher photos
      const completeEventData: EventData = {
        ...eventData,
        // Ensure teacherImages is always an array
        teacherImages: teacherPhotos,
        // Ensure all required fields are present
        classTheme: eventData.classTheme || "",
        teacherName: eventData.teacherName || "",
        boxColor: eventData.boxColor || "#dd303e",
        boxFontColor: eventData.boxFontColor || "#FFFFFF",
        textColor: eventData.textColor || "#FFFFFF"
      };
      
      console.log(`Complete event data for ${formatId}:`, completeEventData);
      
      // Use the canvas renderer to create the image with the correct background and fresh layout
      const generatedImageUrl = await renderCanvasWithTemplate(
        formatData.image_url, // Use the template's background image
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
      console.log(`Successfully generated image for ${formatId} with fresh layout data`);
      
    } catch (error) {
      console.error(`Error generating image for ${formatId}:`, error);
      // Continue with other images even if one fails
    }
  }
  
  return allGeneratedImages;
};
