
import { EventData } from "@/pages/Index";

export const getPreviewText = (field: string): string => {
  const previewData: Record<string, string> = {
    title: 'Título do Evento',
    classTheme: 'Tema da Aula',
    teacherName: 'Nome do Professor',
    date: '25/01/2024',
    time: '19:00'
  };
  return previewData[field] || 'Texto de Exemplo';
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
