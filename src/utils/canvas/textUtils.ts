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

// Helper function to determine if a field needs smart text breaking
export const shouldApplyTextBreaking = (field: string, eventData: EventData): boolean => {
  // Never apply text breaking to date and time fields - they have predictable sizes
  if (field === 'date' || field === 'time') {
    return false;
  }
  
  // For teacher names, only apply text breaking if multiple teachers
  if (field === 'teacherName') {
    const hasMultipleTeachers = eventData.teacherNames && eventData.teacherNames.length > 1;
    return hasMultipleTeachers || false;
  }
  
  // Apply text breaking for classTheme which might need it
  if (field === 'classTheme') {
    return true;
  }
  
  // Default: no text breaking for other fields
  return false;
};

// Improved and more consistent time formatting
export function formatDateTime(dateString: string, timeString?: string): string {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-"); // espera "YYYY-MM-DD"
  const dd = day.padStart(2, "0");
  const mm = month.padStart(2, "0");

  let result = `${dd}/${mm}`;

  if (timeString) {
    // Normalize time format and add consistent padding
    const [hour, minute] = timeString.split(":");
    const h = hour.padStart(2, "0");
    const min = minute.padStart(2, "0");
    
    // Apply the same logic as PlatformPreviews: only show minutes if not '00'
    if (min === '00') {
      result += ` às ${h}h`;
    } else {
      result += ` às ${h}h${min}`;
    }
    
    console.log('📅 Time formatted:', {
      original: timeString,
      formatted: min === '00' ? `${h}h` : `${h}h${min}`,
      fullResult: result,
      characterCount: result.length
    });
  }

  return result;
}

export const getTextContent = (field: string, eventData: EventData): string => {
  let content = '';
  
  switch (field) {
    case 'classTheme':
      content = eventData.classTheme || '';
      break;
    case 'teacherName':
      // Use combined teacher names with Portuguese formatting
      content = eventData.teacherNames && eventData.teacherNames.length > 0 
        ? formatTeacherNames(eventData.teacherNames)
        : eventData.teacherName || '';
      break;
    case 'date':
      content = formatDateTime(eventData.date, eventData.time);
      break;
    case 'time':
      content = "";
      break;
    default:
      content = '';
  }
  
  // Debug logging for problematic content
  if (field === 'date' && eventData.time) {
    console.log('📅 Date field processing:', {
      field,
      eventTime: eventData.time,
      eventDate: eventData.date,
      finalContent: content,
      contentLength: content.length
    });
  }
  
  if (field === 'teacherName' && content) {
    console.log('👨‍🏫 Teacher name processing:', {
      field,
      content,
      contentLength: content.length,
      lastChar: content.charAt(content.length - 1),
      teacherNames: eventData.teacherNames
    });
  }
  
  return content;
};
