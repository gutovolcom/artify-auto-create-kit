
import { EventData } from "@/pages/Index";
import { createFabricCanvas, loadBackgroundImageToCanvas, setupCanvasContainer, cleanupCanvas } from './canvas/fabricCanvasSetup';
import { exportCanvasToDataURL } from './canvas/canvasExporter';
import { addElementToCanvas } from './canvas/elementRenderer';
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
  console.log("[DEBUG] layoutConfig.elements:", layoutConfig?.elements);
  console.log("[DEBUG] Canvas dimensions for generation:", width, "x", height);
  console.log("[DEBUG] Format:", format);
  
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

      loadBackgroundImageToCanvas(fabricCanvas, backgroundImageUrl, width, height).then(async () => {
        if (layoutConfig?.elements && layoutConfig.elements.length > 0) {
          console.log('🎯 Using layout configuration - applying DIRECT coordinates (no additional scaling)');
          
          layoutConfig.elements.forEach((element: any) => {
            console.log('📍 Processing element with coordinates:', {
              field: element.field,
              type: element.type,
              position: element.position,
              size: element.size,
              canvasDimensions: { width, height }
            });
            
            // Skip teacher image elements - they're handled by placement rules
            if (element.type === 'image' && (element.field === 'teacherImages' || element.field === 'professorPhotos')) {
              console.log('🖼️ Skipping teacher image element - handled by placement rules');
              return;
            }
            
            // Validate element is within canvas bounds
            if (element.position && element.size) {
              const elementRight = element.position.x + element.size.width;
              const elementBottom = element.position.y + element.size.height;
              
              if (elementRight > width || elementBottom > height || element.position.x < 0 || element.position.y < 0) {
                console.warn(`⚠️ Element ${element.field} may be out of bounds:`, {
                  elementBounds: { right: elementRight, bottom: elementBottom },
                  canvasBounds: { width, height },
                  position: element.position
                });
              }
            }
            
            console.log('📝 Adding text element with layout position:', element.position);
            addElementToCanvas(fabricCanvas, element, eventData, width, height, format);
          });

          // Always add teacher photos using placement rules after processing layout elements
          console.log('🖼️ Adding teacher photos using smart placement rules for format:', format);
          await addTeacherPhotosToCanvas(fabricCanvas, eventData.teacherImages || [], format, width, height, eventData);
          
          fabricCanvas.renderAll();
          exportCanvasToDataURL(fabricCanvas, tempCanvas).then(resolve).catch(reject);
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
