
import { Image as FabricImage, Canvas, FabricText, Rect, Group } from 'fabric';
import { teacherImageRules } from './photoPlacementRules';
import { getUserColors } from '../formatStyleRules';
import { getStyleForField } from '../formatStyleRules';
import { EventData } from "@/pages/Index";

type FabricCanvas = Canvas;

// Helper function to format teacher names in Portuguese
const formatTeacherNames = (names: string[]): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]}, e ${names[2]}`;
  
  // Fallback for more than 3 names
  const allButLast = names.slice(0, -1);
  const lastName = names[names.length - 1];
  return `${allButLast.join(', ')}, e ${lastName}`;
};

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

  console.log('🎯 Adding teacher photos with name overlays:', {
    format,
    imageCount: imageUrls.length,
    rule,
    eventData: !!eventData
  });

  // Get user colors and format-specific styling for teacher names
  const userColors = getUserColors(eventData);
  const teacherNameStyle = getStyleForField(format, 'teacherName', userColors);
  
  console.log('🎨 Teacher name style for overlay:', teacherNameStyle);

  // Add photos and individual name overlays
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

        // Add individual name overlay for this teacher if we have teacher names
        if (eventData?.teacherNames && eventData.teacherNames[index]) {
          const teacherName = eventData.teacherNames[index];
          
          // Calculate center position of this specific photo
          const photoCenterX = x + (rule.width / 2);
          const photoCenterY = y + (rule.height / 2);
          
          console.log('🏷️ Adding individual name overlay for teacher:', {
            name: teacherName,
            photoCenterX,
            photoCenterY,
            photoIndex: index
          });

          // Create text with format-specific styling
          const text = new FabricText(teacherName, {
            fontSize: teacherNameStyle.fontSize,
            fontFamily: teacherNameStyle.fontFamily,
            fontWeight: teacherNameStyle.fontWeight,
            fill: teacherNameStyle.color,
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
          });

          // Create background box sized to fit the text
          const padding = 8;
          const backgroundWidth = text.width! + (padding * 2);
          const backgroundHeight = text.height! + (padding * 2);
          
          const background = new Rect({
            width: backgroundWidth,
            height: backgroundHeight,
            fill: userColors.teacherBoxColor || userColors.boxColor,
            rx: 6,
            ry: 6,
            originX: 'center',
            originY: 'center'
          });

          // Create group with background and text, positioned at photo center
          const nameOverlay = new Group([background, text], {
            left: photoCenterX,
            top: photoCenterY,
            selectable: false,
            evented: false
          });

          canvas.add(nameOverlay);
          console.log(`✅ Name overlay added for teacher ${index + 1} at photo center:`, {
            name: teacherName,
            centerX: photoCenterX,
            centerY: photoCenterY,
            backgroundSize: { width: backgroundWidth, height: backgroundHeight }
          });
        }
        
        resolve();
      }).catch((error) => {
        console.error('Error loading teacher photo:', error);
        resolve();
      });
    });
  });

  await Promise.all(photoPromises);
  
  console.log('🎯 All teacher photos and individual name overlays added successfully');
}
