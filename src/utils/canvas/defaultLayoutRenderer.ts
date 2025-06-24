
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { formatDateTime } from './textUtils';
import { getDefaultPositions } from './positionUtils';
import { addTeacherPhotosToCanvas } from './addTeacherPhotosToCanvas';
import { getLessonThemeStyle } from './lessonThemeUtils';
import { constrainTextToCanvas } from './textConstraints';


export const addDefaultElements = async (
  canvas: FabricCanvas,
  eventData: EventData,
  format: string,
  width: number,
  height: number
): Promise<void> => {
  const defaultPositions = getDefaultPositions(format, width, height);
  const userColors = getUserColors(eventData);
  
  // Removed title rendering logic - title field no longer exists

  // Add date with format-specific styling and text constraints
  if (eventData.date) {
    const dateStyle = getStyleForField(format, 'date', userColors);
    const dateText = formatDateTime(eventData.date, eventData.time);
    const textConstraints = constrainTextToCanvas(
      dateText,
      defaultPositions.date.x,
      defaultPositions.date.y,
      dateStyle.fontSize,
      dateStyle.fontFamily,
      width,
      height
    );
    
    const date = new FabricText(textConstraints.text, {
      left: defaultPositions.date.x,
      top: defaultPositions.date.y,
      fontSize: textConstraints.fontSize,
      fontFamily: dateStyle.fontFamily,
      fill: dateStyle.color,
      selectable: false,
      evented: false
    });
    canvas.add(date);
  }

  // Add teacher name with format-specific styling and text constraints
  if (eventData.teacherName) {
    const teacherStyle = getStyleForField(format, 'teacherName', userColors);
    const textConstraints = constrainTextToCanvas(
      eventData.teacherName,
      defaultPositions.teacherName.x,
      defaultPositions.teacherName.y,
      teacherStyle.fontSize,
      teacherStyle.fontFamily,
      width,
      height
    );
    
    const teacherName = new FabricText(textConstraints.text, {
      left: defaultPositions.teacherName.x,
      top: defaultPositions.teacherName.y,
      fontSize: textConstraints.fontSize,
      fontFamily: teacherStyle.fontFamily,
      fill: teacherStyle.color,
      selectable: false,
      evented: false
    });
    canvas.add(teacherName);
  }

  // Add class theme with unified lesson theme styling system
  if (eventData.classTheme) {
    const selectedStyleName = eventData.lessonThemeBoxStyle;
    const themeStyle = getLessonThemeStyle(selectedStyleName, eventData, format);
    
    if (themeStyle) {
      // Use the unified lesson theme styling system
      const formatStyle = getStyleForField(format, 'classTheme', userColors);
      const textConstraints = constrainTextToCanvas(
        eventData.classTheme,
        defaultPositions.classTheme.x,
        defaultPositions.classTheme.y,
        formatStyle.fontSize,
        formatStyle.fontFamily,
        width,
        height,
        40 // Extra padding for the box
      );

      const text = new FabricText(textConstraints.text, {
        fontSize: textConstraints.fontSize,
        fontFamily: formatStyle.fontFamily,
        fill: themeStyle.fontColor,
        textAlign: 'center'
      });

      const padding = 20;
      const background = new Rect({
        width: text.width! + (padding * 2),
        height: themeStyle.fixedBoxHeight,
        fill: themeStyle.boxColor,
        rx: 10,
        ry: 10
      });

      text.set({
        left: padding,
        top: (themeStyle.fixedBoxHeight - text.height!) / 2
      });

      const group = new Group([background, text], {
        left: defaultPositions.classTheme.x,
        top: defaultPositions.classTheme.y,
        selectable: false,
        evented: false
      });

      canvas.add(group);
      
      console.log('🎨 Default classTheme with unified styling:', {
        selectedStyle: selectedStyleName,
        boxColor: themeStyle.boxColor,
        fontColor: themeStyle.fontColor,
        fixedHeight: themeStyle.fixedBoxHeight
      });
    } else {
      // Fallback to original logic
      const themeStyle = getStyleForField(format, 'classTheme', userColors);
      const textConstraints = constrainTextToCanvas(
        eventData.classTheme,
        defaultPositions.classTheme.x,
        defaultPositions.classTheme.y,
        themeStyle.fontSize,
        themeStyle.fontFamily,
        width,
        height,
        40
      );

      const text = new FabricText(textConstraints.text, {
        fontSize: textConstraints.fontSize,
        fontFamily: themeStyle.fontFamily,
        fill: themeStyle.color,
        textAlign: 'center'
      });

      const padding = 20;
      const background = new Rect({
        width: text.width! + (padding * 2),
        height: text.height! + (padding * 2),
        fill: eventData.boxColor || '#dd303e',
        rx: 10,
        ry: 10
      });

      const group = new Group([background, text], {
        left: defaultPositions.classTheme.x,
        top: defaultPositions.classTheme.y,
        selectable: false,
        evented: false
      });

      canvas.add(group);
    }
  }

  // Add all professor photos with proper rules
  if (eventData.teacherImages && eventData.teacherImages.length > 0) {
    try {
      await addTeacherPhotosToCanvas(canvas, eventData.teacherImages, format, width, height);
    } catch (error) {
      console.error('Error adding professor photos with rules:', error);
    }
  }

  canvas.renderAll();
};
