import { EventData } from "@/pages/Index";
import { createFabricCanvas, loadBackgroundImageToCanvas, setupCanvasContainer, cleanupCanvas } from './canvas/fabricCanvasSetup';
import { exportCanvasToDataURL } from './canvas/canvasExporter';
import { addElementToCanvas, resetPositionAdjustments } from './canvas/elementRenderer';
import { addTeacherPhotosToCanvas } from './canvas/addTeacherPhotosToCanvas';
import { addDefaultElements } from './canvas/defaultLayoutRenderer';
import { batchLoadFonts, FontConfig } from './canvas/fontLoader';
import { getStyleForField, getUserColors } from './formatStyleRules';

// Types for better type safety
interface LayoutElement {
  field: string;
  type: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

interface LayoutConfig {
  elements: LayoutElement[];
}

// Font preloading cache to avoid reloading fonts
const fontPreloadCache = new Set<string>();

const preloadAllFonts = async (eventData: EventData, format: string, layoutConfig?: LayoutConfig): Promise<void> => {
  const fontConfigs: FontConfig[] = [];
  const userColors = getUserColors(eventData);
  const cacheKey = `${format}-${JSON.stringify(layoutConfig?.elements?.map(e => e.field) || [])}`;

  // Skip if fonts already preloaded for this configuration
  if (fontPreloadCache.has(cacheKey)) {
    console.log('🔤 Fonts already preloaded for configuration');
    return;
  }

  try {
    // Collect all fonts that will be used
    if (layoutConfig?.elements) {
      for (const element of layoutConfig.elements) {
        if (element.type === 'text' || element.type === 'text_box') {
          const formatStyle = getStyleForField(format, element.field, userColors);
          fontConfigs.push({
            family: formatStyle.fontFamily,
            size: formatStyle.fontSize,
            weight: 'normal'
          });
        }
      }
    } else {
      // Default fonts for fallback layout
      const fields = ['classTheme', 'teacherName', 'date'];
      for (const field of fields) {
        const formatStyle = getStyleForField(format, field, userColors);
        fontConfigs.push({
          family: formatStyle.fontFamily,
          size: formatStyle.fontSize,
          weight: 'normal'
        });
      }
    }

    // Remove duplicates
    const uniqueFonts = fontConfigs.filter((font, index, self) => 
      index === self.findIndex(f => 
        f.family === font.family && 
        f.size === font.size && 
        f.weight === font.weight
      )
    );

    if (uniqueFonts.length === 0) return;

    console.log(`🔤 Preloading ${uniqueFonts.length} fonts for first generation fix`);
    
    // Load all fonts in parallel with timeout
    const loadResults = await Promise.race([
      batchLoadFonts(uniqueFonts),
      new Promise<boolean[]>((_, reject) => 
        setTimeout(() => reject(new Error('Font loading timeout')), 3000)
      )
    ]);
    
    const loadedCount = loadResults.filter(Boolean).length;
    
    if (loadedCount > 0) {
      fontPreloadCache.add(cacheKey);
      console.log(`✅ Font preloading completed: ${loadedCount}/${uniqueFonts.length} fonts loaded`);
    }
    
    // Small delay to ensure fonts are fully available
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (error) {
    console.warn('⚠️ Font preloading failed, continuing with fallback fonts:', error);
  }
};

export const renderCanvasWithTemplate = async (
  backgroundImageUrl: string,
  eventData: EventData,
  width: number,
  height: number,
  format: string,
  layoutConfig?: LayoutConfig
): Promise<string> => {
  // Input validation
  if (!backgroundImageUrl || !eventData || !width || !height || !format) {
    throw new Error("Missing required parameters for canvas rendering");
  }

  // Validate critical fields
  const missingFields: string[] = [];
  if (!eventData.classTheme?.trim()) missingFields.push('classTheme');
  if (!eventData.date?.trim()) missingFields.push('date');
  if (!eventData.time?.trim()) missingFields.push('time');

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const tempCanvas = setupCanvasContainer(width, height);
  const fabricCanvas = createFabricCanvas(tempCanvas, width, height, format);

  try {
    // Preload fonts before rendering
    await preloadAllFonts(eventData, format, layoutConfig);
    
    // Reset position adjustments BEFORE processing elements
    resetPositionAdjustments();
    console.log('🧹 Starting new generation - position adjustments reset');

    // CRITICAL FIX: Load background image and wait for proper initialization
    await loadBackgroundImageToCanvas(fabricCanvas, backgroundImageUrl, width, height);
    
    // Additional delay to ensure background is fully loaded and positioned
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('🖼️ Background loaded, proceeding with layout elements');

    // Process elements with improved timing
    if (layoutConfig?.elements && layoutConfig.elements.length > 0) {
      console.log(`📐 Loading saved layout with ${layoutConfig.elements.length} elements for format: ${format}`);
      
      // Ensure classTheme is processed first for position adjustments
      const sortedElements = [...layoutConfig.elements].sort((a, b) => {
        if (a.field === 'classTheme') return -1;
        if (b.field === 'classTheme') return 1;
        return 0;
      });
      
      console.log('🔄 Processing elements in order:', sortedElements.map(e => `${e.field}(${e.position?.x},${e.position?.y})`));
      
      // Process elements sequentially with proper delays
      for (const element of sortedElements) {
        // Skip teacher image elements - handled by placement rules
        if (element.type === 'image' && (element.field === 'teacherImages' || element.field === 'professorPhotos')) {
          continue;
        }
        
        try {
          console.log(`📍 Processing element ${element.field} at position:`, element.position);
          await addElementToCanvas(fabricCanvas, element, eventData, width, height, format, sortedElements);
          
          // Small delay between elements to ensure proper positioning
          await new Promise(resolve => setTimeout(resolve, 25));
        } catch (elementError) {
          console.error(`Error processing element ${element.field}:`, elementError);
          // Continue with other elements
        }
      }

      // Add teacher photos after layout elements
      try {
        await addTeacherPhotosToCanvas(fabricCanvas, eventData.teacherImages || [], format, width, height, eventData);
      } catch (photoError) {
        console.error('Error adding teacher photos:', photoError);
      }
      
      // CRITICAL VALIDATION: Log final element positions for debugging
      console.log('🔍 Final validation - Element positions after load:');
      fabricCanvas.getObjects().forEach((obj: any) => {
        if (obj.fieldMapping) {
          console.log(`  📍 ${obj.fieldMapping}: (${obj.left}, ${obj.top}) - Size: ${obj.getScaledWidth()}x${obj.getScaledHeight()}`);
        }
      });
      
    } else {
      console.log('📋 No saved layout found, using default elements');
      await addDefaultElements(fabricCanvas, eventData, format, width, height);
    }

    // Final render and validation
    fabricCanvas.renderAll();
    
    // Position validation summary
    const elementCount = fabricCanvas.getObjects().filter((obj: any) => obj.fieldMapping).length;
    console.log(`✅ Canvas generation completed for ${format} with ${elementCount} positioned elements`);

    // Export canvas
    const dataURL = await exportCanvasToDataURL(fabricCanvas);
    console.log(`✅ Canvas exported successfully for format: ${format}`);
    return dataURL;
    
  } catch (error) {
    console.error(`💥 Error rendering canvas for format ${format}:`, error);
    throw error;
  } finally {
    // Always cleanup
    cleanupCanvas(fabricCanvas, tempCanvas);
  }
};

// Clear font cache when needed (e.g., on app restart)
export const clearFontPreloadCache = () => {
  fontPreloadCache.clear();
  console.log('🧹 Font preload cache cleared');
};
