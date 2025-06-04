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
        layoutConfig,
        eventData
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      document.body.appendChild(tempCanvas);

      const fabricCanvas = new FabricCanvas(tempCanvas, {
        width: width,
        height: height,
        backgroundColor: '#ffffff'
      });

      FabricImage.fromURL(backgroundImageUrl, {
        crossOrigin: 'anonymous'
      }).then((bgImg) => {
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

        if (layoutConfig?.elements) {
          console.log('Using layout configuration for positioning');
          const promises: Promise<void>[] = [];
          
          layoutConfig.elements.forEach((element: any) => {
            if (element.type === 'image' && element.field === 'professorPhotos') {
              const teacherImageUrl = eventData.teacherImages?.[0] || "";
              if (teacherImageUrl) {
                const promise = addProfessorPhotoToCanvas(fabricCanvas, teacherImageUrl, element, width, height);
                promises.push(promise);
              }
            } else {
              addElementToCanvas(fabricCanvas, element, eventData, width, height);
            }
          });

          Promise.all(promises).then(() => {
            fabricCanvas.renderAll();
            exportCanvas(fabricCanvas, tempCanvas, resolve, reject);
          }).catch((error) => {
            console.error('Error loading professor photos:', error);
            fabricCanvas.renderAll();
            exportCanvas(fabricCanvas, tempCanvas, resolve, reject);
          });
        } else {
          console.log('Using default layout for format:', format);
          addDefaultElements(fabricCanvas, eventData, format, width, height).then(() => {
            exportCanvas(fabricCanvas, tempCanvas, resolve, reject);
          }).catch((error) => {
            console.error('Error in default layout:', error);
            exportCanvas(fabricCanvas, tempCanvas, resolve, reject);
          });
        }
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

const exportCanvas = (fabricCanvas: FabricCanvas, tempCanvas: HTMLCanvasElement, resolve: (value: string) => void, reject: (reason?: any) => void) => {
  setTimeout(() => {
    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
      });
      
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
};

const addElementToCanvas = (
  canvas: FabricCanvas,
  element: any,
  eventData: EventData,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { type, field, position, size } = element;
  
  if (type === 'image' && field === 'professorPhotos') {
    return; // Handled separately
  }

  const textContent = getTextContent(field, eventData);
  if (!textContent) return;

  // ALWAYS use form data for styling, NEVER layout config
  const fontFamily = getMargemFont(field);
  const fontSize = getDefaultFontSize(field);
  
  // ALWAYS use eventData colors
  let textColor = eventData.textColor || '#000000';
  
  if (field === 'classTheme') {
    textColor = eventData.boxFontColor || '#FFFFFF';
  }

  if (type === 'text_box' && field === 'classTheme') {
    const text = new FabricText(textContent, {
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      textAlign: 'center'
    });

    const padding = 20;
    const backgroundColor = eventData.boxColor || '#dd303e';
    const borderRadius = 10;

    const background = new Rect({
      width: text.width! + (padding * 2),
      height: text.height! + (padding * 2),
      fill: backgroundColor,
      rx: borderRadius,
      ry: borderRadius
    });

    const group = new Group([background, text], {
      left: position?.x || 0,
      top: position?.y || 0,
      selectable: false,
      evented: false
    });

    canvas.add(group);
  } else {
    const text = new FabricText(textContent, {
      left: position?.x || 0,
      top: position?.y || 0,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      selectable: false,
      evented: false
    });

    canvas.add(text);
  }
};

const addDefaultElements = async (
  canvas: FabricCanvas,
  eventData: EventData,
  format: string,
  width: number,
  height: number
): Promise<void> => {
  const defaultPositions = getDefaultPositions(format, width, height);
  
  // Add title with Margem-Black
  if (eventData.title) {
    const title = new FabricText(eventData.title, {
      left: defaultPositions.title.x,
      top: defaultPositions.title.y,
      fontSize: defaultPositions.title.fontSize,
      fontFamily: 'Margem-Black',
      fill: eventData.textColor || '#000000',
      selectable: false,
      evented: false
    });
    canvas.add(title);
  }

  // Add date with Margem-Regular
  if (eventData.date) {
    const date = new FabricText(formatDate(eventData.date, eventData.time), {
      left: defaultPositions.date.x,
      top: defaultPositions.date.y,
      fontSize: defaultPositions.date.fontSize,
      fontFamily: 'Margem-Regular',
      fill: eventData.textColor || '#000000',
      selectable: false,
      evented: false
    });
    canvas.add(date);
  }

  // Add teacher name with Margem-Regular
  if (eventData.teacherName) {
    const teacherName = new FabricText(eventData.teacherName, {
      left: defaultPositions.teacherName.x,
      top: defaultPositions.teacherName.y,
      fontSize: defaultPositions.teacherName.fontSize,
      fontFamily: 'Margem-Regular',
      fill: eventData.textColor || '#000000',
      selectable: false,
      evented: false
    });
    canvas.add(teacherName);
  }

  // Add class theme with Margem-Bold
  if (eventData.classTheme) {
    const text = new FabricText(eventData.classTheme, {
      fontSize: defaultPositions.classTheme.fontSize,
      fontFamily: 'Margem-Bold',
      fill: eventData.boxFontColor || '#FFFFFF',
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

const addProfessorPhotoToCanvas = async (
  canvas: FabricCanvas,
  photoUrl: string,
  photoElement: any | null,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Adding professor photo:', photoUrl);
    
    FabricImage.fromURL(photoUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (photoElement && photoElement.size) {
        // Use layout configuration for size and position
        const targetWidth = photoElement.size.width || 200;
        const targetHeight = photoElement.size.height || 200;
        
        img.set({
          left: photoElement.position?.x || 0,
          top: photoElement.position?.y || 0,
          scaleX: targetWidth / img.width!,
          scaleY: targetHeight / img.height!,
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
      resolve();
    }).catch((error) => {
      console.error('Error loading professor photo:', error);
      reject(error);
    });
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
      return formatDate(eventData.date, eventData.time);
    case 'time':
      return eventData.time || '';
    default:
      return '';
  }
};

const formatDate = (dateString: string, timeString?: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  let formattedDateTime = `${day}/${month}`;
  
  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    if (minutes === '00') {
      formattedDateTime += `, às ${hours}h`;
    } else {
      formattedDateTime += `, às ${hours}h${minutes}`;
    }
  }
  
  return formattedDateTime;
};

const getDefaultPositions = (format: string, width: number, height: number) => {
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

const getMargemFont = (field: string): string => {
  switch (field) {
    case 'title':
      return 'Margem-Black';
    case 'classTheme':
      return 'Margem-Bold';
    case 'teacherName':
      return 'Margem-Regular';
    case 'date':
    case 'time':
      return 'Margem-Regular';
    default:
      return 'Margem-Regular';
  }
};

const getDefaultFontSize = (field: string): number => {
  switch (field) {
    case 'title':
      return 48;
    case 'classTheme':
      return 28;
    case 'teacherName':
      return 32;
    case 'date':
    case 'time':
      return 24;
    default:
      return 24;
  }
};
