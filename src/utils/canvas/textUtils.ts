
import { EventData } from "@/pages/Index";

// Helper function to format teacher names in Portuguese
const formatTeacherNames = (names: string[]): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]}, e ${names[2]}`;
  
  // Fallback for more than 3 names
  const allButLast = names.slice(0, -1);
  const lastName = names[names.length - 1];
  return `${allButLast.join(', ')}, e ${lastName}`;
};

export function formatDateTime(dateString: string, timeString?: string): string {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-"); // espera "YYYY-MM-DD"
  const dd = day.padStart(2, "0");
  const mm = month.padStart(2, "0");

  let result = `${dd}/${mm}`;

  if (timeString) {
    const [hour, minute] = timeString.split(":");
    const h = hour.padStart(2, "0");
    const min = minute.padStart(2, "0");
    result += ` às ${h}h${min}`;
  }

  return result;
}

export const getTextContent = (field: string, eventData: EventData): string => {
  switch (field) {
    case 'title':
      return eventData.title;
    case 'classTheme':
      return eventData.classTheme || '';
    case 'teacherName':
      // Use combined teacher names with Portuguese formatting
      return eventData.teacherNames && eventData.teacherNames.length > 0 
        ? formatTeacherNames(eventData.teacherNames)
        : eventData.teacherName || '';
    case 'date':
      return formatDateTime(eventData.date, eventData.time);
    case 'time':
      return "";
    default:
      return '';
  }
};
