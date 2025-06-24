
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas } from 'fabric';
import { getTextContent } from './textUtils';
import { renderTextElement } from './textRenderer';
import { renderTextBoxElement } from './boxRenderer';

// Store position adjustments globally for this rendering session
let globalPositionAdjustments: Map<string, number> = new Map();

export const resetPositionAdjustments = () => {
  globalPositionAdjustments.clear();
};

export const addElementToCanvas = async (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number,
  format: string,
  allElements?: any[]
) => {
  let type = element.type;
  const { field } = element;
  console.log(`📌 Processing element: field=${field}, type=${type}, format=${format}`);

  // Special handling for bannerGCO format - skip ALL elements (only background image)
  if (format === 'bannerGCO') {
    console.log(`🚫 Skipping ALL elements for bannerGCO format - only background image allowed`);
    return;
  }

  // Special handling for destaque format - only render classTheme
  if (format === 'destaque' && field !== 'classTheme') {
    console.log(`🚫 Skipping field ${field} for destaque format - only classTheme allowed`);
    return;
  }

  // FORÇA TIPO text_box PARA classTheme
  if (field === 'classTheme' && type !== 'text_box') {
    console.warn('🚨 Forçando type text_box para classTheme dentro do renderer');
    type = 'text_box';
  }
  
  if (type === "image" && (field === "teacherImages" || field === "professorPhotos")) {
    return;
  }
  
  const textContent = getTextContent(field, eventData);
  if (!textContent) return;

  if (type === "text_box" && field === "classTheme") {
    await renderTextBoxElement(
      canvas, 
      element, 
      eventData, 
      canvasWidth, 
      format, 
      globalPositionAdjustments, 
      allElements
    );
  } else if (type === "text") {
    await renderTextElement(
      canvas, 
      element, 
      eventData, 
      canvasWidth, 
      format, 
      globalPositionAdjustments
    );
  } else {
    // Fallback to regular text rendering for any other types
    await renderTextElement(
      canvas, 
      element, 
      eventData, 
      canvasWidth, 
      format, 
      globalPositionAdjustments
    );
  }
};
