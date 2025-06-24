
import { Image as FabricImage, Canvas } from 'fabric';
import { teacherImageRules } from './photoPlacementRules';
import { EventData } from "@/pages/Index";

type FabricCanvas = Canvas;

export async function addTeacherPhotosToCanvas(
  canvas: FabricCanvas,
  imageUrls: string[],
  format: string,
  canvasWidth: number,
  canvasHeight: number,
  eventData?: EventData
) {
  // Skip photo placement for bannerGCO format completely
  if (format === 'bannerGCO') {
    console.log('🚫 Skipping teacher photos for bannerGCO format - only background image allowed');
    return;
  }

  const rule = teacherImageRules[format]?.[imageUrls.length];

  if (!rule) {
    console.warn(`⚠️ No placement rule defined for ${format} with ${imageUrls.length} images.`);
    return;
  }

  if (imageUrls.length === 0) {
    console.log('📸 No teacher images to add');
    return;
  }

  console.log('🎯 Adding teacher photos:', {
    format,
    imageCount: imageUrls.length,
    rule,
    canvasDimensions: { width: canvasWidth, height: canvasHeight }
  });

  // Add photos only - teacher names are now handled by layout editor positioning
  const photoPromises = imageUrls.map((url, index) => {
    return new Promise<void>((resolve) => {
      FabricImage.fromURL(url, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        if (!img) {
          resolve();
          return;
        }
        
        // Calculate scale to fit the specified dimensions
        const scaleX = rule.width / img.width!;
        const scaleY = rule.height / img.height!;
        const scale = Math.min(scaleX, scaleY); // Use minimum to maintain aspect ratio
        
        img.scale(scale);

        const x = canvasWidth - rule.width - (index * rule.xOffset);
        const y = canvasHeight - rule.height;

        // Ensure photo stays within canvas bounds
        const finalX = Math.max(0, Math.min(x, canvasWidth - rule.width));
        const finalY = Math.max(0, Math.min(y, canvasHeight - rule.height));

        img.set({
          left: finalX,
          top: finalY,
          selectable: false,
          evented: false,
        });

        canvas.add(img);
        console.log(`📷 Added teacher photo ${index + 1}:`, { 
          originalSize: { width: img.width! / scale, height: img.height! / scale },
          scaledSize: { width: rule.width, height: rule.height },
          scale: scale,
          position: { x: finalX, y: finalY }
        });
        
        resolve();
      }).catch((error) => {
        console.error('Error loading teacher photo:', error);
        resolve();
      });
    });
  });

  await Promise.all(photoPromises);
  
  console.log('🎯 All teacher photos added successfully');
}
