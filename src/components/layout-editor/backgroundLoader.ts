
import * as fabric from 'fabric';

type FabricCanvas = fabric.Canvas;

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
    
    // Add stronger cache busting with timestamp and random string
    const cacheBustedUrl = `${backgroundImageUrl}?bust=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
    
    fabric.Image.fromURL(cacheBustedUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      console.log('Background image loaded successfully with enhanced cache bust');
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
      
      // Clear existing background and set new one
      canvas.backgroundImage = img;
      canvas.renderAll();
      console.log('Background image updated successfully with enhanced cache bust');
      resolve();
    }).catch((error) => {
      console.error('Error loading background image:', error);
      reject(error);
    });
  });
};
