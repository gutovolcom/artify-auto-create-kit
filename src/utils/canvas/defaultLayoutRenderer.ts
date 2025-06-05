
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, Group } from 'fabric';
import { getStyleForField, getUserColors } from '../formatStyleRules';
import { formatDate } from './textUtils';
import { getDefaultPositions } from './positionUtils';
import { addProfessorPhotoToCanvas } from './elementRenderer';

export const addDefaultElements = async (
  canvas: FabricCanvas,
  eventData: EventData,
  format: string,
  width: number,
  height: number
): Promise<void> => {
  const defaultPositions = getDefaultPositions(format, width, height);
  const userColors = getUserColors(eventData);
  
  // Add title with format-specific styling
  if (eventData.title) {
    const titleStyle = getStyleForField(format, 'title', userColors);
    const title = new FabricText(eventData.title, {
      left: defaultPositions.title.x,
      top: defaultPositions.title.y,
      fontSize: titleStyle.fontSize,
      fontFamily: titleStyle.fontFamily,
      fill: titleStyle.color,
      selectable: false,
      evented: false
    });
    canvas.add(title);
  }

  // Add date with format-specific styling
  if (eventData.date) {
    const dateStyle = getStyleForField(format, 'date', userColors);
    const date = new FabricText(formatDate(eventData.date, eventData.time), {
      left: defaultPositions.date.x,
      top: defaultPositions.date.y,
      fontSize: dateStyle.fontSize,
      fontFamily: dateStyle.fontFamily,
      fill: dateStyle.color,
      selectable: false,
      evented: false
    });
    canvas.add(date);
  }

  // Add teacher name with format-specific styling
  if (eventData.teacherName) {
    const teacherStyle = getStyleForField(format, 'teacherName', userColors);
    const teacherName = new FabricText(eventData.teacherName, {
      left: defaultPositions.teacherName.x,
      top: defaultPositions.teacherName.y,
      fontSize: teacherStyle.fontSize,
      fontFamily: teacherStyle.fontFamily,
      fill: teacherStyle.color,
      selectable: false,
      evented: false
    });
    canvas.add(teacherName);
  }

  // Add class theme with format-specific styling
  if (eventData.classTheme) {
    const themeStyle = getStyleForField(format, 'classTheme', userColors);
    const text = new FabricText(eventData.classTheme, {
      fontSize: themeStyle.fontSize,
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

  // Add professor photo with default positioning
  const teacherImageUrl = eventData.teacherImages?.[0];
  if (teacherImageUrl) {
    try {
      await addProfessorPhotoToCanvas(canvas, teacherImageUrl, null, width, height);
    } catch (error) {
      console.error('Error adding professor photo with default positioning:', error);
    }
  }

  canvas.renderAll();
};
