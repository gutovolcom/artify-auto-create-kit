
import { Image as FabricImage, Canvas, FabricText, Rect, Group } from 'fabric';
import { teacherImageRules } from './photoPlacementRules';
import { getUserColors } from '../formatStyleRules';
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

  console.log('🎯 Adding teacher photos with smart placement:', {
    format,
    imageCount: imageUrls.length,
    rule,
    eventData: !!eventData
  });

  // Add photos first
  const photoPromises = imageUrls.map((url, index) => {
    return new Promise<{ x: number; y: number; width: number; height: number }>((resolve) => {
      FabricImage.fromURL(url, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        if (!img) {
          resolve({ x: 0, y: 0, width: 0, height: 0 });
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
        
        resolve({ x, y, width: rule.width, height: rule.height });
      }).catch((error) => {
        console.error('Error loading teacher photo:', error);
        resolve({ x: 0, y: 0, width: 0, height: 0 });
      });
    });
  });

  const photoPositions = await Promise.all(photoPromises);

  // Add teacher names label if we have eventData and teacher names
  if (eventData?.teacherNames && eventData.teacherNames.length > 0) {
    const names = eventData.teacherNames;
    const label = names.length < 2 
      ? names[0] 
      : names.slice(0, -1).join(', ') + ' and ' + names.slice(-1);

    // Calculate center X of all photos
    const validPositions = photoPositions.filter(pos => pos.width > 0);
    if (validPositions.length > 0) {
      const leftmostX = Math.min(...validPositions.map(pos => pos.x));
      const rightmostX = Math.max(...validPositions.map(pos => pos.x + pos.width));
      const centerX = (leftmostX + rightmostX) / 2;
      
      // Position label above photos
      const labelY = validPositions[0].y - 60; // 60px above photos
      
      // Get user colors
      const userColors = getUserColors(eventData);
      const boxColor = userColors.teacherBoxColor || '#dd303e';
      const fontColor = userColors.teacherFontColor || '#FFFFFF';
      
      console.log('🏷️ Adding teacher name label:', {
        label,
        centerX,
        labelY,
        boxColor,
        fontColor
      });

      // Create text first to measure it
      const text = new FabricText(label, {
        fontSize: 16,
        fontFamily: 'Margem-Medium',
        fill: fontColor,
        textAlign: 'center',
        originX: 'center',
        originY: 'center'
      });

      // Create background box
      const padding = 12;
      const background = new Rect({
        width: text.width! + (padding * 2),
        height: text.height! + (padding * 2),
        fill: boxColor,
        rx: 8,
        ry: 8,
        originX: 'center',
        originY: 'center'
      });

      // Create group with background and text
      const labelGroup = new Group([background, text], {
        left: centerX,
        top: labelY,
        selectable: false,
        evented: false
      });

      canvas.add(labelGroup);
      console.log('✅ Teacher name label added successfully');
    }
  }
}
