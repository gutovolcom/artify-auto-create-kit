
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
      return formatDateTime(eventData.date, eventData.time);
    case 'time':
      return "";
    default:
      return '';
  }
};

export function formatDateTime(dateString: string, timeString?: string): string {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-"); // espera “YYYY-MM-DD”
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