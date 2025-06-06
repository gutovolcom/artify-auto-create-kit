
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, Group } from 'fabric';
import { getUserColors } from '../formatStyleRules';
import { lessonThemeStyleColors, CLASS_THEME_BOX_HEIGHTS } from './themeStyles';

export const renderClassTheme = (
  canvas: FabricCanvas,
  textContent: string,
  eventData: EventData,
  formatStyle: any,
  elementX: number,
  elementY: number,
  format: string
) => {
  console.log(`[renderClassTheme] Processing classTheme with lessonThemeBoxStyle: ${eventData?.lessonThemeBoxStyle}`);
  
  const selectedStyleName = eventData.lessonThemeBoxStyle;
  const styleConfig = selectedStyleName ? lessonThemeStyleColors[selectedStyleName] : null;
  const userColors = getUserColors(eventData);

  console.log('🎨 Processing classTheme with style:', {
    selectedStyleName,
    styleConfig,
    userBoxColor: eventData.boxColor,
    userBoxFontColor: eventData.boxFontColor
  });

  if (styleConfig) {
    if (styleConfig.boxColor === null) { // 'Transparent' style
      const text = new FabricText(textContent, {
        fontSize: formatStyle.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: userColors.textColor, // Use eventData.textColor
        textAlign: 'center',
        left: elementX,
        top: elementY,
        selectable: false,
        evented: false
      });
      canvas.add(text);
      console.log('✅ Added transparent classTheme text with user textColor');
    } else { // 'Green', 'Red', 'White' styles
      const text = new FabricText(textContent, {
        fontSize: formatStyle.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: styleConfig.fontColor, // Use fontColor from styleConfig
        textAlign: 'center'
      });

      // @ts-ignore
      const fixedBoxHeight = CLASS_THEME_BOX_HEIGHTS[format] || CLASS_THEME_BOX_HEIGHTS.default;
      const horizontalPadding = 20;
      const borderRadius = 10;

      const backgroundWidth = text.width + (horizontalPadding * 2);
      const backgroundHeight = fixedBoxHeight;

      const background = new Rect({
        left: 0, // Relative to group
        top: 0,  // Relative to group
        width: backgroundWidth,
        height: backgroundHeight,
        fill: styleConfig.boxColor, // Use boxColor from styleConfig
        rx: borderRadius,
        ry: borderRadius
      });

      // Adjust text position to be centered within the background rect in the group
      text.set({
        left: horizontalPadding, // Text starts after left padding
        top: (fixedBoxHeight - text.height) / 2 // Vertically center text
      });

      console.log('🎨 classTheme Styled Box Details:', {
        format: format,
        selectedStyle: selectedStyleName,
        styleBoxColor: styleConfig.boxColor,
        styleFontColor: styleConfig.fontColor,
        fixedBoxHeight: fixedBoxHeight,
        textWidth: text.width,
        textHeight: text.height,
        rectWidth: background.width,
        rectHeight: background.height
      });

      const group = new Group([background, text], {
        left: elementX, // Position of the group on the canvas
        top: elementY,  // Position of the group on the canvas
        selectable: false,
        evented: false
      });
      canvas.add(group);
      console.log('✅ Added styled classTheme box with predefined colors');
    }
  } else { // Fallback: use user's custom boxColor when no lessonThemeBoxStyle is set
    const text = new FabricText(textContent, {
      fontSize: formatStyle.fontSize,
      fontFamily: formatStyle.fontFamily,
      fill: userColors.boxFontColor, // Use user's boxFontColor
      textAlign: 'center'
    });

    const padding = 20;
    const backgroundColor = eventData.boxColor || '#dd303e'; // Use user's boxColor
    const borderRadius = 10;

    const background = new Rect({
      left: 0,
      top: 0,
      width: text.width! + (padding * 2),
      height: text.height! + (padding * 2),
      fill: backgroundColor,
      rx: borderRadius,
      ry: borderRadius
    });

    // Center text within background
    text.set({
      left: padding,
      top: padding
    });

    console.log('🎨 classTheme Fallback Box Details:', {
      format: format,
      userBoxColor: backgroundColor,
      userBoxFontColor: userColors.boxFontColor,
      textWidth: text.width,
      textHeight: text.height,
      rectWidth: background.width,
      rectHeight: background.height
    });

    const group = new Group([background, text], {
      left: elementX,
      top: elementY,
      selectable: false,
      evented: false
    });
    canvas.add(group);
    console.log('✅ Added fallback classTheme box with user colors');
  }
};
