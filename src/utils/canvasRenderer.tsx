
import { EventData } from "@/pages/Index";
import { createFabricCanvas, loadBackgroundImageToCanvas, setupCanvasContainer, cleanupCanvas } from './canvas/fabricCanvasSetup';
import { exportCanvasToDataURL } from './canvas/canvasExporter';
import { addElementToCanvas, addProfessorPhotoToCanvas } from './canvas/elementRenderer';
import { addDefaultElements } from './canvas/defaultLayoutRenderer';

export const renderCanvasWithTemplate = async (
  backgroundImageUrl: string,
  eventData: EventData,
  width: number,
  height: number,
  format: string,
  layoutConfig?: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Rendering canvas with template:', {
        backgroundImageUrl,
        format,
        width,
        height,
        layoutConfig,
        eventData
      });

      const tempCanvas = setupCanvasContainer(width, height);
      const fabricCanvas = createFabricCanvas(tempCanvas, width, height);

      loadBackgroundImageToCanvas(fabricCanvas, backgroundImageUrl, width, height).then(() => {
        if (layoutConfig?.elements) {
          console.log('Using layout configuration for positioning ONLY (ignoring any saved styles)');
          const promises: Promise<void>[] = [];
          
          layoutConfig.elements.forEach((element: any) => {
            // Handle both teacherImages and professorPhotos field names for backward compatibility
            if (element.type === 'image' && (element.field === 'teacherImages' || element.field === 'professorPhotos')) {
              const teacherImageUrl = eventData.teacherImages?.[0] || "";
              if (teacherImageUrl) {
                console.log('Adding teacher photo from field:', element.field, 'URL:', teacherImageUrl);
                const promise = addProfessorPhotoToCanvas(fabricCanvas, teacherImageUrl, element, width, height);
                promises.push(promise);
              } else {
                console.warn('No teacher image URL found in eventData.teacherImages');
              }
            } else {
              addElementToCanvas(fabricCanvas, element, eventData, width, height, format);
            }
          });

          Promise.all(promises).then(() => {
            fabricCanvas.renderAll();
            exportCanvasToDataURL(fabricCanvas, tempCanvas).then(resolve).catch(reject);
          }).catch((error) => {
            console.error('Error loading professor photos:', error);
            fabricCanvas.renderAll();
            exportCanvasToDataURL(fabricCanvas, tempCanvas).then(resolve).catch(reject);
          });
        } else {
          console.log('Using default layout for format:', format);
          addDefaultElements(fabricCanvas, eventData, format, width, height).then(() => {
            exportCanvasToDataURL(fabricCanvas, tempCanvas).then(resolve).catch(reject);
          }).catch((error) => {
            console.error('Error in default layout:', error);
            exportCanvasToDataURL(fabricCanvas, tempCanvas).then(resolve).catch(reject);
          });
        }
      }).catch((error) => {
        console.error('Error loading background image:', error);
        cleanupCanvas(fabricCanvas, tempCanvas);
        reject(error);
      });
    } catch (error) {
      console.error('Error in renderCanvasWithTemplate:', error);
      reject(error);
    }
  });
};
