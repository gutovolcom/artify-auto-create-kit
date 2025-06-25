
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
  const containerId = 'temp-canvas-container';
  
  // Remove any existing container to prevent orphaned elements
  const existingContainer = document.getElementById(containerId);
  if (existingContainer) {
    console.log('🧹 Removing existing canvas container');
    document.body.removeChild(existingContainer);
  }

  // Create a wrapper container for better cleanup control
  const container = document.createElement('div');
  container.id = containerId;
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1000';
  container.style.overflow = 'hidden';
  container.style.width = '0px';
  container.style.height = '0px';

  // Create the canvas element
  const tempCanvas = document.createElement('canvas');
  tempCanvas.id = 'temp-canvas';
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  // Add canvas to container, then container to body
  container.appendChild(tempCanvas);
  document.body.appendChild(container);
  
  console.log('🎨 Created canvas container with dimensions:', width, 'x', height);
  return tempCanvas;
};

export const cleanupCanvas = (fabricCanvas: FabricCanvas, tempCanvas: HTMLCanvasElement): void => {
  try {
    console.log('🧹 Starting canvas cleanup...');
    
    // First dispose the Fabric.js canvas
    fabricCanvas.dispose();
    
    // Find the container div that we created
    const ourContainer = document.getElementById('temp-canvas-container');
    if (ourContainer && ourContainer.parentElement === document.body) {
      document.body.removeChild(ourContainer);
      console.log('✅ Successfully removed our canvas container');
    }
    
    // Also handle any Fabric.js created canvas-container divs
    const fabricContainers = document.querySelectorAll('.canvas-container');
    fabricContainers.forEach((container, index) => {
      if (container.parentElement === document.body) {
        document.body.removeChild(container);
        console.log(`✅ Removed orphaned Fabric.js container ${index + 1}`);
      }
    });
    
    // Final cleanup: remove any remaining temp canvas elements
    const remainingCanvas = document.getElementById('temp-canvas');
    if (remainingCanvas && remainingCanvas.parentElement) {
      const parent = remainingCanvas.parentElement;
      if (parent.parentElement === document.body) {
        document.body.removeChild(parent);
        console.log('✅ Removed remaining canvas parent element');
      }
    }
    
    console.log('🎉 Canvas cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Failed to cleanup canvas container:', error);
    
    // Fallback cleanup - try to remove any elements that might be left
    try {
      const allTempElements = document.querySelectorAll('[id*="temp-canvas"], .canvas-container');
      allTempElements.forEach((element) => {
        if (element.parentElement === document.body) {
          document.body.removeChild(element);
        }
      });
      console.log('🔄 Fallback cleanup completed');
    } catch (fallbackError) {
      console.error('❌ Fallback cleanup also failed:', fallbackError);
    }
  }
};
