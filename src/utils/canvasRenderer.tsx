
import { EventData } from "@/pages/Index";
import { Canvas as FabricCanvas, FabricText, Rect, FabricImage, Group } from 'fabric';

export const renderCanvasWithTemplate = async (
  backgroundImageUrl: string,
  eventData: EventData,
  width: number,
  height: number,
  format: string,
  layoutConfig?: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Rendering canvas with template:', {
        backgroundImageUrl,
        format,
        width,
        height,
        layoutConfig
      });

      // Create a temporary canvas element
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      document.body.appendChild(tempCanvas);

      const fabricCanvas = new FabricCanvas(tempCanvas, {
        width: width,
        height: height,
        backgroundColor: '#ffffff'
      });

      // Load background image
      FabricImage.fromURL(backgroundImageUrl, {
        crossOrigin: 'anonymous'
      }).then((bgImg) => {
        // Scale background image to fit canvas
        const scaleX = width / bgImg.width!;
        const scaleY = height / bgImg.height!;
        
        bgImg.set({
          scaleX: scaleX,
          scaleY: scaleY,
          left: 0,
          top: 0,
          selectable: false,
          evented: false
        });

        fabricCanvas.backgroundImage = bgImg;

        // Add text elements based on layout configuration or default positions
        if (layoutConfig?.elements) {
          console.log('Using custom layout configuration');
          layoutConfig.elements.forEach((element: any) => {
            addElementToCanvas(fabricCanvas, element, eventData, width, height);
          });
        } else {
          console.log('Using default layout for format:', format);
          addDefaultElements(fabricCanvas, eventData, format, width, height);
        }

        // Add professor photo if available
        if (eventData.professorPhotos) {
          addProfessorPhoto(fabricCanvas, eventData.professorPhotos, layoutConfig, width, height);
        }

        // Render and export
        fabricCanvas.renderAll();
        
        setTimeout(() => {
          try {
            const dataURL = fabricCanvas.toDataURL({
              format: 'png',
              quality: 1.0,
              multiplier: 1
            });
            
            // Clean up
            fabricCanvas.dispose();
            document.body.removeChild(tempCanvas);
            
            resolve(dataURL);
          } catch (exportError) {
            console.error('Error exporting canvas:', exportError);
            fabricCanvas.dispose();
            document.body.removeChild(tempCanvas);
            reject(exportError);
          }
        }, 500);
      }).catch((error) => {
        console.error('Error loading background image:', error);
        fabricCanvas.dispose();
        document.body.removeChild(tempCanvas);
        reject(error);
      });
    } catch (error) {
      console.error('Error in renderCanvasWithTemplate:', error);
      reject(error);
    }
  });
};

const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { type, field, position, style } = element;
  
  if (type === 'image' && field === 'professorPhotos') {
    // Skip professor photos here, they're handled separately
    return;
  }

  const textContent = getTextContent(field, eventData);
  if (!textContent) return;

  const fontSize = style.fontSize || 24;
  const fontFamily = style.fontFamily || 'Margem-Regular';
  
  // Use textColor from eventData for most fields, except classTheme
  let textColor = style.color || style.textColor || eventData.textColor || '#000000';
  
  if (field === 'classTheme') {
    // For class theme, use the specific box colors from eventData
    textColor = eventData.boxFontColor || '#FFFFFF';
  }

  if (type === 'text_box' && field === 'classTheme') {
    // Create text box for class theme
    const text = new FabricText(textContent, {
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      textAlign: 'center'
    });

    const padding = style.padding || 20;
    const backgroundColor = eventData.boxColor || style.backgroundColor || '#dd303e';
    const borderRadius = style.borderRadius || 10;

    const background = new Rect({
      width: text.width! + (padding * 2),
      height: text.height! + (padding * 2),
      fill: backgroundColor,
      rx: borderRadius,
      ry: borderRadius
    });

    const group = new Group([background, text], {
      left: position.x,
      top: position.y,
      selectable: false,
      evented: false
    });

    canvas.add(group);
  } else {
    // Create regular text
    const text = new FabricText(textContent, {
      left: position.x,
      top: position.y,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      selectable: false,
      evented: false
    });

    canvas.add(text);
  }
};

const addDefaultElements = (
  canvas: FabricCanvas,
  eventData: EventData,
  format: string,
  width: number,
  height: number
) => {
  // Default positions based on format
  const defaultPositions = getDefaultPositions(format, width, height);
  
  // Add title
  if (eventData.title) {
    const title = new FabricText(eventData.title, {
      left: defaultPositions.title.x,
      top: defaultPositions.title.y,
      fontSize: defaultPositions.title.fontSize,
      fontFamily: 'Margem-Bold',
      fill: eventData.textColor || '#000000',
      selectable: false,
      evented: false
    });
    canvas.add(title);
  }

  // Add other elements with default positioning...
  // This would include date, time, teacher name, etc.
};

const addProfessorPhoto = (
  canvas: FabricCanvas,
  photoUrl: string,
  layoutConfig: any,
  canvasWidth: number,
  canvasHeight: number
) => {
  const photoElement = layoutConfig?.elements?.find((el: any) => el.field === 'professorPhotos');
  
  FabricImage.fromURL(photoUrl, {
    crossOrigin: 'anonymous'
  }).then((img) => {
    if (photoElement) {
      // Use layout configuration
      img.set({
        left: photoElement.position.x,
        top: photoElement.position.y,
        scaleX: (photoElement.style.width || 200) / img.width!,
        scaleY: (photoElement.style.height || 200) / img.height!,
        selectable: false,
        evented: false
      });
    } else {
      // Use default positioning
      const defaultSize = Math.min(canvasWidth, canvasHeight) * 0.2;
      img.set({
        left: canvasWidth - defaultSize - 20,
        top: canvasHeight - defaultSize - 20,
        scaleX: defaultSize / img.width!,
        scaleY: defaultSize / img.height!,
        selectable: false,
        evented: false
      });
    }
    
    canvas.add(img);
    canvas.renderAll();
  }).catch((error) => {
    console.error('Error loading professor photo:', error);
  });
};

const getTextContent = (field: string, eventData: EventData): string => {
  switch (field) {
    case 'title':
      return eventData.title;
    case 'classTheme':
      return eventData.classTheme || '';
    case 'teacherName':
      return eventData.teacherName || '';
    case 'date':
      return eventData.date;
    case 'time':
      return eventData.time;
    default:
      return '';
  }
};

const getDefaultPositions = (format: string, width: number, height: number) => {
  // Return default positions based on format
  switch (format) {
    case 'youtube':
      return {
        title: { x: 100, y: 100, fontSize: 48 },
        date: { x: 100, y: 200, fontSize: 24 },
        time: { x: 100, y: 250, fontSize: 24 },
        teacherName: { x: 100, y: 300, fontSize: 32 },
        classTheme: { x: 100, y: 400, fontSize: 28 }
      };
    case 'feed':
      return {
        title: { x: 50, y: 50, fontSize: 36 },
        date: { x: 50, y: 150, fontSize: 20 },
        time: { x: 50, y: 180, fontSize: 20 },
        teacherName: { x: 50, y: 220, fontSize: 24 },
        classTheme: { x: 50, y: 300, fontSize: 22 }
      };
    default:
      return {
        title: { x: 50, y: 50, fontSize: 24 },
        date: { x: 50, y: 100, fontSize: 16 },
        time: { x: 50, y: 130, fontSize: 16 },
        teacherName: { x: 50, y: 160, fontSize: 20 },
        classTheme: { x: 50, y: 200, fontSize: 18 }
      };
  }
};
