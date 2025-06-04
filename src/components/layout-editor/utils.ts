
import { EventData } from "@/pages/Index";

export const getPreviewText = (field: string, eventData?: any): string => {
  if (eventData) {
    // Use real event data if available
    switch (field) {
      case 'title':
        return eventData.title || 'Título do Evento';
      case 'classTheme':
        return eventData.classTheme || 'Tema da Aula';
      case 'teacherName':
        return eventData.teacherName || 'Nome do Professor';
      case 'date':
        return formatDate(eventData.date, eventData.time) || '25/01, às 19h';
      case 'time':
        return eventData.time || '19:00';
      default:
        return 'Texto de Exemplo';
    }
  }
  
  // Fallback to default preview text
  const previewData: Record<string, string> = {
    title: 'Título do Evento',
    classTheme: 'Tema da Aula',
    teacherName: 'Nome do Professor',
    date: '25/01, às 19h',
    time: '19:00'
  };
  return previewData[field] || 'Texto de Exemplo';
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

export const getSelectedElementField = (selectedObject: any): string | null => {
  if (!selectedObject) return null;
  return selectedObject.fieldMapping;
};

export const elementNeedsFontProperties = (field: string): boolean => {
  return ['title', 'teacherName', 'date', 'time', 'classTheme'].includes(field);
};

export const elementNeedsOnlyPositionAndSize = (field: string): boolean => {
  return field === 'professorPhotos';
};

export const getCurrentFontSize = (selectedObject: any, scale: number): string => {
  if (!selectedObject) return '';
  
  if (selectedObject.type === 'group') {
    const textObject = selectedObject.getObjects().find((obj: any) => obj.type === 'text');
    return textObject ? Math.round(textObject.fontSize / scale).toString() : '';
  }
  
  return selectedObject.fontSize ? Math.round(selectedObject.fontSize / scale).toString() : '';
};

export const getCurrentFontFamily = (selectedObject: any): string => {
  if (!selectedObject) return '';
  
  if (selectedObject.type === 'group') {
    const textObject = selectedObject.getObjects().find((obj: any) => obj.type === 'text');
    return textObject ? textObject.fontFamily || '' : '';
  }
  
  return selectedObject.fontFamily || '';
};

export const availableFonts = [
  'Margem-Regular',
  'Margem-Bold', 
  'Margem-Black'
];
