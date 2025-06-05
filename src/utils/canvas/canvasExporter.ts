
import { Canvas as FabricCanvas } from 'fabric';

export const exportCanvasToDataURL = (
  fabricCanvas: FabricCanvas,
  tempCanvas: HTMLCanvasElement
): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1.0,
          multiplier: 1
        });
        
        fabricCanvas.dispose();
        document.body.removeChild(tempCanvas);
        
        resolve(dataURL);
      } catch (exportError) {
        console.error('Error exporting canvas:', exportError);
        fabricCanvas.dispose();
        document.body.removeChild(tempCanvas);
        reject(exportError);
      }
    }, 500);
  });
};
