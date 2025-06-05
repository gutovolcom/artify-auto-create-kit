
import { EventData } from "@/pages/Index";

// Helper function to normalize teacher photos to always be an array
export const normalizeTeacherPhotos = (eventData: EventData): string[] => {
  // Handle both teacherImages (array) and professorPhotos (string) fields
  if (eventData.teacherImages && Array.isArray(eventData.teacherImages)) {
    return eventData.teacherImages;
  }
  
  if (eventData.teacherImages && typeof eventData.teacherImages === 'string') {
    return [eventData.teacherImages];
  }
  
  if (eventData.professorPhotos && typeof eventData.professorPhotos === 'string') {
    return [eventData.professorPhotos];
  }
  
  return [];
};

export const validateEventData = (eventData: EventData): { isValid: boolean; error?: string } => {
  if (!eventData.title || !eventData.date || !eventData.kvImageId) {
    return {
      isValid: false,
      error: "Informações incompletas. Preencha todos os campos obrigatórios."
    };
  }

  const teacherPhotos = normalizeTeacherPhotos(eventData);
  if (teacherPhotos.length === 0) {
    return {
      isValid: false,
      error: "Foto do professor é obrigatória."
    };
  }

  return { isValid: true };
};
