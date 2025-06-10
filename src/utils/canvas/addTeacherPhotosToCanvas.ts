import { Image as FabricImage } from 'fabric';
import { teacherImageRules } from './photoPlacementRules';
import type { FabricCanvas } from './types';

export async function addTeacherPhotosToCanvas(
  canvas: FabricCanvas,
  imageUrls: string[],
  format: string,
  canvasWidth: number,
  canvasHeight: number
) {
  const rule = teacherImageRules[format]?.[imageUrls.length];

  if (!rule) {
    console.warn(`⚠️ No placement rule defined for ${format} with ${imageUrls.length} images.`);
    return;
  }

  const promises = imageUrls.map((url, index) => {
    return new Promise<void>((resolve) => {
      FabricImage.fromURL(url, (img) => {
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
        resolve();
      });
    });
  });

  await Promise.all(promises);
}
