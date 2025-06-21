
import { Canvas as FabricCanvas, FabricImage } from 'fabric';

export const createFabricCanvas = (
  tempCanvas: HTMLCanvasElement,
  width: number,
  height: number
): FabricCanvas => {
  return new FabricCanvas(tempCanvas, {
    width: width,
    height: height,
    backgroundColor: '#ffffff'
  });
};

export const loadBackgroundImageToCanvas = async (
  fabricCanvas: FabricCanvas,
  backgroundImageUrl: string,
  width: number,
  height: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    FabricImage.fromURL(backgroundImageUrl, {
      crossOrigin: 'anonymous'
    }).then((bgImg) => {
      const scaleX = width / bgImg.width!;
      const scaleY = height / bgImg.height!;
      
      bgImg.set({
        scaleX: scaleX,
        scaleY: scaleY,
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });

      fabricCanvas.backgroundImage = bgImg;
      resolve();
    }).catch((error) => {
      console.error('Error loading background image:', error);
      reject(error);
    });
  });
};

export const setupCanvasContainer = (width: number, height: number): HTMLCanvasElement => {
  const existingCanvas = document.getElementById('temp-canvas') as HTMLCanvasElement;
  if (existingCanvas) {
    document.body.removeChild(existingCanvas);
  }

  const tempCanvas = document.createElement('canvas');
  tempCanvas.id = 'temp-canvas';
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  // Position the canvas completely off-screen and hidden during generation
  tempCanvas.style.position = 'fixed';
  tempCanvas.style.top = '-9999px';
  tempCanvas.style.left = '-9999px';
  tempCanvas.style.visibility = 'hidden';
  tempCanvas.style.pointerEvents = 'none';
  tempCanvas.style.zIndex = '-1000';
  
  document.body.appendChild(tempCanvas);
  return tempCanvas;
};

export const cleanupCanvas = (fabricCanvas: FabricCanvas, tempCanvas: HTMLCanvasElement): void => {
  fabricCanvas.dispose();
  document.body.removeChild(tempCanvas);
};
