
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
    rule
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
        
        const scale = rule.height / img.height!;
        img.scale(scale);

        const x = canvasWidth - rule.width - (index * rule.xOffset);
        const y = canvasHeight - rule.height;

        img.set({
          left: x,
          top: y,
          selectable: false,
          evented: false,
        });

        canvas.add(img);
        console.log(`📷 Added teacher photo ${index + 1}:`, { x, y, width: rule.width, height: rule.height });
        
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
