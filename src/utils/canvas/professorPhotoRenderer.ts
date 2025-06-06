
import { Canvas as FabricCanvas, FabricImage } from 'fabric';

export const addProfessorPhotoToCanvas = async (
  canvas: FabricCanvas,
  photoUrl: string,
  photoElement: any | null,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Adding professor photo:', photoUrl, 'with element config:', photoElement);
    
    FabricImage.fromURL(photoUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (photoElement && photoElement.position && photoElement.size) {
        // Use DIRECT layout coordinates (already unscaled)
        const targetWidth = photoElement.size.width || 200;
        const targetHeight = photoElement.size.height || 200;
        const elementX = photoElement.position.x;
        const elementY = photoElement.position.y;
        
        console.log('🖼️ Using DIRECT layout position for teacher photo:', {
          x: elementX,
          y: elementY,
          width: targetWidth,
          height: targetHeight,
          canvasSize: { width: canvasWidth, height: canvasHeight }
        });
        
        img.set({
          left: elementX,
          top: elementY,
          scaleX: targetWidth / img.width!,
          scaleY: targetHeight / img.height!,
          selectable: false,
          evented: false
        });
      } else {
        // Use default positioning
        const defaultSize = Math.min(canvasWidth, canvasHeight) * 0.2;
        console.log('Using default positioning for teacher photo:', {
          x: canvasWidth - defaultSize - 20,
          y: canvasHeight - defaultSize - 20,
          size: defaultSize
        });
        
        img.set({
          left: canvasWidth - defaultSize - 20,
          top: canvasHeight - defaultSize - 20,
          scaleX: defaultSize / img.width!,
          scaleY: defaultSize / img.height!,
          selectable: false,
          evented: false
        });
      }
      
      canvas.add(img);
      canvas.renderAll();
      console.log('Professor photo added successfully');
      resolve();
    }).catch((error) => {
      console.error('Error loading professor photo:', error);
      reject(error);
    });
  });
};
