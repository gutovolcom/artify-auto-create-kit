
import { Image, Canvas } from 'fabric';

type FabricCanvas = Canvas;

export const loadBackgroundImage = async (
  canvas: FabricCanvas,
  backgroundImageUrl: string,
  scale: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Loading background image:', backgroundImageUrl, 'Scale:', scale);
    
    if (!backgroundImageUrl) {
      console.error('No background image URL provided');
      reject(new Error('No background image URL provided'));
      return;
    }
    
    Image.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      console.log('Background image loaded successfully');
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      console.log('Image dimensions:', img.width, 'x', img.height);
      
      // Scale the background image to fit the canvas exactly
      if (canvas.width && canvas.height) {
        const scaleX = canvas.width / img.width!;
        const scaleY = canvas.height / img.height!;
        
        console.log('Background scaling factors:', { scaleX, scaleY });
        
        img.set({
          scaleX: scaleX,
          scaleY: scaleY,
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          excludeFromExport: false
        });
      }
      
      // Set background image using the correct v6 API
      canvas.backgroundImage = img;
      canvas.renderAll();
      console.log('Background image set successfully');
      resolve();
    }).catch((error) => {
      console.error('Error loading background image:', error);
      reject(error);
    });
  });
};
