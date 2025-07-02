
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { getTextContent, shouldApplyTextBreaking } from './textUtils';
import { breakTextToFitWidthSync } from './smartTextBreaker';
import { ensureFontLoaded, FontConfig } from './fontLoader';
import { getMaxTextWidthForFormat, getTextAlignmentForFormat } from './renderingUtils';

export const renderTextElement = async (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  format: string,
  globalPositionAdjustments: Map<string, number>
) => {
  const { field, position } = element;
  const textContent = getTextContent(field, eventData);
  
  if (!textContent) return;

  const userColors = getUserColors(eventData);
  const formatStyle = getStyleForField(format, field, userColors);
  
  // Ensure font is loaded before proceeding
  const fontConfig: FontConfig = {
    family: formatStyle.fontFamily,
    size: formatStyle.fontSize,
    weight: 'normal'
  };
  
  try {
    await ensureFontLoaded(fontConfig);
    console.log(`✅ Font loaded for ${field}: ${formatStyle.fontFamily}`);
  } catch (error) {
    console.warn(`⚠️ Font loading failed for ${field}, proceeding with fallback:`, error);
  }
  
  // Apply any global position adjustments
  let elementX = position?.x || 0;
  let elementY = (position?.y || 0) + (globalPositionAdjustments.get(field) || 0);

  console.log('✅ Processing regular text element for format:', format, 'field:', field);
  
  const needsTextBreaking = shouldApplyTextBreaking(field, eventData);
  let finalText = textContent;
  let needsLineBreak = false;
  const textAlignment = getTextAlignmentForFormat(format);
  
  if (needsTextBreaking) {
    const maxTextWidth = getMaxTextWidthForFormat(format, canvasWidth, elementX, field);
    
    // Apply smart text breaking to prevent truncation
    const textBreakResult = breakTextToFitWidthSync(
      textContent,
      maxTextWidth,
      formatStyle.fontSize,
      formatStyle.fontFamily
    );

    finalText = textBreakResult.lines.join('\n');
    needsLineBreak = textBreakResult.needsLineBreak;
    
    console.log('📝 Smart text breaking applied for regular text:', {
      field,
      textBroken: textBreakResult.needsLineBreak,
      lines: textBreakResult.lines.length,
      maxTextWidth: maxTextWidth,
      reason: 'conditional logic determined text breaking was needed'
    });
  } else {
    console.log('📝 No text breaking applied for regular text:', {
      field,
      reason: 'conditional logic determined text breaking was not needed'
    });
  }
  
  // Add extra debugging for teacher name truncation
  if (field === 'teacherName' && finalText !== textContent) {
    console.warn('⚠️ Teacher name text changed during processing:', {
      original: textContent,
      final: finalText,
      originalLength: textContent.length,
      finalLength: finalText.length,
      lastCharOriginal: textContent.charAt(textContent.length - 1),
      lastCharFinal: finalText.charAt(finalText.length - 1)
    });
  }
  
  // Create text properties with conditional line height for multi-line teacher names
  const textProperties: any = {
    left: elementX,
    top: elementY,
    fontSize: formatStyle.fontSize,
    fontFamily: formatStyle.fontFamily,
    fill: formatStyle.color,
    textAlign: textAlignment,
    selectable: false,
    evented: false
  };

  // Add line height rule for multi-line teacher names
  if (field === 'teacherName' && needsLineBreak) {
    textProperties.lineHeight = 0.8;
    console.log('📏 Applied line height 0.8 to multi-line teacher name');
  }

  const text = new FabricText(finalText, textProperties);

  console.log('📝 Regular text element added:', {
    field,
    fontSize: formatStyle.fontSize,
    fontFamily: formatStyle.fontFamily,
    text: finalText,
    smartBreakingApplied: needsTextBreaking,
    lineHeight: textProperties.lineHeight || 'default',
    position: { x: elementX, y: elementY }
  });

  canvas.add(text);
};
