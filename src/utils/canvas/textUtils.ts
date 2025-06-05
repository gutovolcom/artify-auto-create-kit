
import { EventData } from "@/pages/Index";

export const getTextContent = (field: string, eventData: EventData): string => {
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

export const formatDate = (dateString: string, timeString?: string): string => {
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
