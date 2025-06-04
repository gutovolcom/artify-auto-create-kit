
interface TeacherImage {
  src: string;
  width: number;
  height: number;
}

export const loadImageFromSrc = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const drawYouTubeFormat = (
  ctx: CanvasRenderingContext2D,
  professorImages: HTMLImageElement[],
  eventName: string,
  classTheme: string,
  professorName: string,
  eventDate: string,
  textColor: string,
  boxColor: string,
  boxFontColor: string,
  width: number,
  height: number,
  additionalThemes: string[] = []
) => {
  const leftMargin = 120;
  const topMargin = 430;
  const lineSpacing = 80;
  const rightMargin = 30;

  // Handle professor images based on quantity
  if (professorImages.length === 1) {
    const professorImageHeight = 1000;
    const professorImageWidth = (professorImages[0].width / professorImages[0].height) * professorImageHeight;
    const professorX = width - professorImageWidth - rightMargin;
    const professorY = height - professorImageHeight;
    ctx.drawImage(professorImages[0], professorX, professorY, professorImageWidth, professorImageHeight);
  } else if (professorImages.length === 2) {
    const professorImageHeight = 700;
    const professorImageWidth = (professorImages[0].width / professorImages[0].height) * professorImageHeight;

    const photo1X = width - professorImageWidth - rightMargin;
    const photo1Y = height - professorImageHeight;
    const photo2X = photo1X - professorImageWidth + 100;
    const photo2Y = height - professorImageHeight;

    const drawCroppedImage = (image: HTMLImageElement, x: number, y: number, targetWidth: number, targetHeight: number, alignBottom = false) => {
      const aspectRatio = image.width / image.height;
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (drawWidth / drawHeight > aspectRatio) {
        drawWidth = drawHeight * aspectRatio;
        offsetX = (targetWidth - drawWidth) / 2;
      } else {
        drawHeight = drawWidth / aspectRatio;
        if (alignBottom) {
          offsetY = targetHeight - drawHeight;
        } else {
          offsetY = (targetHeight - drawHeight) / 2;
        }
      }

      ctx.drawImage(image, 0, 0, image.width, image.height, x + offsetX, y + offsetY, drawWidth, drawHeight);
    };

    drawCroppedImage(professorImages[1], photo2X, photo2Y, professorImageWidth, professorImageHeight, true);
    drawCroppedImage(professorImages[0], photo1X, photo1Y, professorImageWidth, professorImageHeight);
  } else if (professorImages.length === 3) {
    const professorImageHeight = 550;
    const professorImageWidth = (professorImages[0].width / professorImages[0].height) * professorImageHeight;

    const photo1X = width - professorImageWidth - rightMargin;
    const photo1Y = height - professorImageHeight;
    const photo2X = photo1X - professorImageWidth + 100;
    const photo2Y = height - professorImageHeight;
    const photo3X = photo2X - professorImageWidth + 130;
    const photo3Y = height - professorImageHeight;

    ctx.drawImage(professorImages[2], photo3X, photo3Y, professorImageWidth, professorImageHeight);
    ctx.drawImage(professorImages[1], photo2X, photo2Y, professorImageWidth, professorImageHeight);
    ctx.drawImage(professorImages[0], photo1X, photo1Y, professorImageWidth, professorImageHeight);
  }

  // Event name with MargemBlack font - use textColor
  ctx.font = '140px Arial Black'; // Fallback since custom fonts aren't loaded
  ctx.fillStyle = textColor;
  ctx.fillText(eventName, leftMargin, topMargin);

  // Class theme with rounded box
  ctx.font = '68px Arial Bold';
  ctx.fillStyle = boxColor;
  const classThemePadding = 20;
  const classThemeWidth = ctx.measureText(classTheme).width + (2 * classThemePadding);
  const classThemeHeight = 60 + (2 * classThemePadding);
  const classThemeX = leftMargin;
  const classThemeY = topMargin + lineSpacing;
  
  // Draw rounded rectangle for class theme
  ctx.beginPath();
  ctx.moveTo(classThemeX + 10, classThemeY);
  ctx.lineTo(classThemeX + classThemeWidth - 10, classThemeY);
  ctx.quadraticCurveTo(classThemeX + classThemeWidth, classThemeY, classThemeX + classThemeWidth, classThemeY + 10);
  ctx.lineTo(classThemeX + classThemeWidth, classThemeY + classThemeHeight - 10);
  ctx.quadraticCurveTo(classThemeX + classThemeWidth, classThemeY + classThemeHeight, classThemeX + classThemeWidth - 10, classThemeY + classThemeHeight);
  ctx.lineTo(classThemeX + 10, classThemeY + classThemeHeight);
  ctx.quadraticCurveTo(classThemeX, classThemeY + classThemeHeight, classThemeX, classThemeY + classThemeHeight - 10);
  ctx.lineTo(classThemeX, classThemeY + 10);
  ctx.quadraticCurveTo(classThemeX, classThemeY, classThemeX + 10, classThemeY);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = boxFontColor;
  ctx.fillText(classTheme, leftMargin + classThemePadding, classThemeY + 50 + classThemePadding);

  let currentY = classThemeY + classThemeHeight + lineSpacing;

  // Additional themes
  if (additionalThemes.length > 0) {
    currentY = classThemeY + classThemeHeight + 30;
    additionalThemes.forEach((additionalTheme) => {
      ctx.font = '68px Arial Bold';
      ctx.fillStyle = boxColor;
      const additionalThemePadding = 20;
      const additionalThemeWidth = ctx.measureText(additionalTheme).width + (2 * additionalThemePadding);
      const additionalThemeHeight = 60 + (2 * additionalThemePadding);
      
      ctx.beginPath();
      ctx.moveTo(classThemeX + 10, currentY);
      ctx.lineTo(classThemeX + additionalThemeWidth - 10, currentY);
      ctx.quadraticCurveTo(classThemeX + additionalThemeWidth, currentY, classThemeX + additionalThemeWidth, currentY + 10);
      ctx.lineTo(classThemeX + additionalThemeWidth, currentY + additionalThemeHeight - 10);
      ctx.quadraticCurveTo(classThemeX + additionalThemeWidth, currentY + additionalThemeHeight, classThemeX + additionalThemeWidth - 10, currentY + additionalThemeHeight);
      ctx.lineTo(classThemeX + 10, currentY + additionalThemeHeight);
      ctx.quadraticCurveTo(classThemeX, currentY + additionalThemeHeight, classThemeX, currentY + additionalThemeHeight - 10);
      ctx.lineTo(classThemeX, currentY + 10);
      ctx.quadraticCurveTo(classThemeX, currentY, classThemeX + 10, currentY);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = boxFontColor;
      ctx.fillText(additionalTheme, classThemeX + additionalThemePadding, currentY + additionalThemeHeight / 2 + 22);

      currentY += additionalThemeHeight + lineSpacing;
    });
  }

  // Event date with TorokaWide font - use textColor
  ctx.font = '66px Arial';
  ctx.fillStyle = textColor;
  ctx.fillText(formatDate(eventDate), leftMargin, currentY);

  currentY += lineSpacing;

  // Professor name with MargemMedium font - use textColor
  ctx.font = '66px Arial';
  ctx.fillText(professorName, leftMargin, currentY);
};

export const renderCanvasWithTemplate = async (
  backgroundImageSrc: string,
  eventData: any,
  width: number,
  height: number,
  platform: string
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  try {
    console.log(`Rendering ${platform} format: ${width}x${height}`);
    
    // Load and draw background image
    const backgroundImg = await loadImageFromSrc(backgroundImageSrc);
    ctx.drawImage(backgroundImg, 0, 0, width, height);

    // Load professor images
    const professorImages: HTMLImageElement[] = [];
    if (eventData.teacherImages && Array.isArray(eventData.teacherImages)) {
      for (const teacherImageSrc of eventData.teacherImages) {
        try {
          const img = await loadImageFromSrc(teacherImageSrc);
          professorImages.push(img);
        } catch (error) {
          console.warn('Failed to load teacher image:', teacherImageSrc);
        }
      }
    }

    // Apply platform-specific rendering
    if (platform === 'youtube') {
      drawYouTubeFormat(
        ctx,
        professorImages,
        eventData.title || 'Título do Evento',
        eventData.classTheme || 'Tema da Aula',
        eventData.teacherName || 'Professor',
        eventData.date || '',
        eventData.textColor || '#FFFFFF',
        eventData.boxColor || '#dd303e',
        eventData.boxFontColor || '#FFFFFF',
        width,
        height,
        [] // additionalThemes - can be expanded later
      );
    } else {
      // For other platforms, use simplified overlay
      const scaleFactor = Math.min(width / 1080, height / 1080); // Base scale on 1080px
      
      // Title - use textColor
      const titleSize = Math.max(24, 48 * scaleFactor);
      ctx.fillStyle = eventData.textColor || '#FFFFFF';
      ctx.font = `bold ${titleSize}px Arial`;
      ctx.fillText(eventData.title || 'Título do Evento', 30 * scaleFactor, 60 * scaleFactor);
      
      // Class theme box
      if (eventData.classTheme) {
        const themeSize = Math.max(16, 32 * scaleFactor);
        const padding = 10 * scaleFactor;
        
        ctx.font = `bold ${themeSize}px Arial`;
        const themeText = eventData.classTheme;
        const textWidth = ctx.measureText(themeText).width;
        
        // Draw rounded rectangle
        const boxX = 30 * scaleFactor;
        const boxY = 80 * scaleFactor;
        const boxWidth = textWidth + (padding * 2);
        const boxHeight = themeSize + (padding * 2);
        
        ctx.fillStyle = eventData.boxColor || '#dd303e';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 5 * scaleFactor);
        ctx.fill();
        
        ctx.fillStyle = eventData.boxFontColor || '#FFFFFF';
        ctx.fillText(themeText, boxX + padding, boxY + themeSize + (padding / 2));
      }
      
      // Date - use textColor
      const dateSize = Math.max(14, 24 * scaleFactor);
      ctx.fillStyle = eventData.textColor || '#FFFFFF';
      ctx.font = `${dateSize}px Arial`;
      const dateY = height - (30 * scaleFactor);
      ctx.fillText(`${eventData.date} ${eventData.time || ''}`, 30 * scaleFactor, dateY);
      
      // Draw professor images for other platforms
      if (professorImages.length > 0) {
        const imgHeight = height * 0.6;
        const imgWidth = (professorImages[0].width / professorImages[0].height) * imgHeight;
        const x = width - imgWidth - (20 * scaleFactor);
        const y = height - imgHeight;
        ctx.drawImage(professorImages[0], x, y, imgWidth, imgHeight);
      }
    }

    console.log(`Successfully rendered ${platform} image`);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error(`Error rendering ${platform} canvas:`, error);
    throw error;
  }
};
