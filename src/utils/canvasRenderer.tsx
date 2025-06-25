import { EventData } from "@/pages/Index";
import { createFabricCanvas, loadBackgroundImageToCanvas, setupCanvasContainer, cleanupCanvas } from './canvas/fabricCanvasSetup';
import { exportCanvasToDataURL } from './canvas/canvasExporter';
import { addElementToCanvas, resetPositionAdjustments } from './canvas/elementRenderer';
import { addTeacherPhotosToCanvas } from './canvas/addTeacherPhotosToCanvas';
import { addDefaultElements } from './canvas/defaultLayoutRenderer';

export const renderCanvasWithTemplate = async (
  backgroundImageUrl: string,
  eventData: EventData,
  width: number,
  height: number,
  format: string,
  layoutConfig?: any
): Promise<string> => {
  console.log("[DEBUG] layoutConfig received:", layoutConfig);
  console.log("[DEBUG] Canvas dimensions for generation:", width, "x", height);
  console.log("[DEBUG] Format:", format);

  // Passo 1: O canvas e seu container são criados no início.
  const tempCanvas = setupCanvasContainer(width, height);
  const fabricCanvas = createFabricCanvas(tempCanvas, width, height);

  try {
    console.log('Rendering canvas with template:', {
      backgroundImageUrl,
      format,
      width,
      height,
      layoutConfig,
      eventData
    });

    // Reset position adjustments for this rendering session
    resetPositionAdjustments();

    await loadBackgroundImageToCanvas(fabricCanvas, backgroundImageUrl, width, height);

    if (layoutConfig?.elements && layoutConfig.elements.length > 0) {
      console.log('🎯 Using layout configuration with smart text breaking');
      
      layoutConfig.elements.forEach((element: any) => {
        console.log('📍 Processing element with smart formatting:', {
          field: element.field,
          type: element.type,
          position: element.position,
          size: element.size
        });
        
        // Skip teacher image elements - they're handled by placement rules
        if (element.type === 'image' && (element.field === 'teacherImages' || element.field === 'professorPhotos')) {
          console.log('🖼️ Skipping teacher image element - handled by placement rules');
          return;
        }
        
        console.log('📝 Adding element with smart text handling');
        addElementToCanvas(fabricCanvas, element, eventData, width, height, format, layoutConfig.elements);
      });

      // Always add teacher photos using placement rules after processing layout elements
      console.log('🖼️ Adding teacher photos using smart placement rules for format:', format);
      await addTeacherPhotosToCanvas(fabricCanvas, eventData.teacherImages || [], format, width, height, eventData);
      
    } else {
      console.log('Using default layout for format:', format);
      await addDefaultElements(fabricCanvas, eventData, format, width, height);
    }

    fabricCanvas.renderAll();

    // Passo 2: O exportador agora SÓ exporta a imagem, sem tentar fazer a limpeza.
    const dataURL = await exportCanvasToDataURL(fabricCanvas);
    return dataURL;
    
  } catch (error) {
    console.error('Error in renderCanvasWithTemplate:', error);
    // Rejeita a promessa em caso de erro. O 'finally' ainda será executado.
    throw error;
  } finally {
    // Passo 3: A limpeza ocorre aqui, no final, garantindo que o canvas e seu container sejam sempre removidos.
    console.log(`🧹 Cleaning up canvas for format: ${format}`);
    cleanupCanvas(fabricCanvas, tempCanvas);
  }
};