
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent } from './textUtils';
import { renderClassTheme } from './classThemeRenderer';
import { renderRegularText } from './textRenderer';

export const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number,
  format: string
) => {
  console.log(`[addElementToCanvas ENTRY] Field: ${element?.field}, Type: ${element?.type}, lessonThemeBoxStyle: ${eventData?.lessonThemeBoxStyle}, boxColor: ${eventData?.boxColor}`);
  const { type, field, position, size } = element;
  
  // Handle both teacherImages and professorPhotos field names
  if (type === 'image' && (field === 'teacherImages' || field === 'professorPhotos')) {
    return; // Handled separately
  }

  const textContent = getTextContent(field, eventData);
  if (!textContent) return;

  // Apply DIRECT coordinates from layout (already unscaled)
  const elementX = position?.x ?? 0;
  const elementY = position?.y ?? 0;
  
  console.log(`🎯 Applying DIRECT coordinates for ${field}:`, {
    x: elementX,
    y: elementY,
    canvasSize: { width: canvasWidth, height: canvasHeight },
    format
  });

  // Get format-specific styling
  const userColors = getUserColors(eventData);
  const formatStyle = getStyleForField(format, field, userColors);
  
  console.log(`✅ Applied format-specific style for ${format}.${field}:`, formatStyle);

  // Always treat classTheme as text_box regardless of the element type in layout
  if (field === 'classTheme') {
    renderClassTheme(canvas, textContent, eventData, formatStyle, elementX, elementY, format);
  } else {
    // Handle all other text fields normally
    renderRegularText(canvas, textContent, field, formatStyle, elementX, elementY);
  }
};

// Re-export for backward compatibility
export { addProfessorPhotoToCanvas } from './professorPhotoRenderer';
