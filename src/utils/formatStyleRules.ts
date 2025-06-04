
import { EventData } from "@/pages/Index";

export interface FormatStyleRule {
  fontSize: number;
  fontFamily: string;
  getColor: (eventData: EventData) => string;
}

export interface FormatStyleRules {
  [field: string]: FormatStyleRule;
}

export interface AllFormatRules {
  [format: string]: FormatStyleRules;
}

// Define format-specific styling rules
export const formatStyleRules: AllFormatRules = {
  youtube: {
    title: {
      fontSize: 140,
      fontFamily: 'Margem-Black',
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    },
    classTheme: {
      fontSize: 68,
      fontFamily: 'Margem-Bold',
      getColor: (eventData: EventData) => eventData.boxFontColor || '#FFFFFF'
    },
    teacherName: {
      fontSize: 66,
      fontFamily: 'Margem-Medium',
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    },
    date: {
      fontSize: 66,
      fontFamily: 'Roboto Condensed', // Using Roboto Condensed as TorokaWide alternative
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    },
    time: {
      fontSize: 66,
      fontFamily: 'Roboto Condensed', // Using Roboto Condensed as TorokaWide alternative
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    }
  },
  feed: {
    title: {
      fontSize: 36,
      fontFamily: 'Margem-Black',
      getColor: (eventData: EventData) => eventData.textColor || '#000000'
    },
    classTheme: {
      fontSize: 22,
      fontFamily: 'Margem-Bold',
      getColor: (eventData: EventData) => eventData.boxFontColor || '#FFFFFF'
    },
    teacherName: {
      fontSize: 24,
      fontFamily: 'Margem-Regular',
      getColor: (eventData: EventData) => eventData.textColor || '#000000'
    },
    date: {
      fontSize: 20,
      fontFamily: 'Margem-Regular',
      getColor: (eventData: EventData) => eventData.textColor || '#000000'
    },
    time: {
      fontSize: 20,
      fontFamily: 'Margem-Regular',
      getColor: (eventData: EventData) => eventData.textColor || '#000000'
    }
  },
  stories: {
    title: {
      fontSize: 48,
      fontFamily: 'Margem-Black',
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    },
    classTheme: {
      fontSize: 28,
      fontFamily: 'Margem-Bold',
      getColor: (eventData: EventData) => eventData.boxFontColor || '#FFFFFF'
    },
    teacherName: {
      fontSize: 32,
      fontFamily: 'Margem-Regular',
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    },
    date: {
      fontSize: 24,
      fontFamily: 'Margem-Regular',
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    },
    time: {
      fontSize: 24,
      fontFamily: 'Margem-Regular',
      getColor: (eventData: EventData) => eventData.textColor || '#FFFFFF'
    }
  }
};

// Get format-specific style for a field
export const getFormatSpecificStyle = (
  format: string,
  field: string,
  eventData: EventData
): { fontSize: number; fontFamily: string; color: string } => {
  const formatRules = formatStyleRules[format];
  
  if (!formatRules || !formatRules[field]) {
    // Fallback to default rules
    return {
      fontSize: getDefaultFontSize(field),
      fontFamily: getMargemFont(field),
      color: eventData.textColor || '#000000'
    };
  }
  
  const rule = formatRules[field];
  return {
    fontSize: rule.fontSize,
    fontFamily: rule.fontFamily,
    color: rule.getColor(eventData)
  };
};

// Fallback functions for compatibility
const getDefaultFontSize = (field: string): number => {
  switch (field) {
    case 'title': return 48;
    case 'classTheme': return 28;
    case 'teacherName': return 32;
    case 'date':
    case 'time': return 24;
    default: return 24;
  }
};

const getMargemFont = (field: string): string => {
  switch (field) {
    case 'title': return 'Margem-Black';
    case 'classTheme': return 'Margem-Bold';
    case 'teacherName': return 'Margem-Regular';
    case 'date':
    case 'time': return 'Margem-Regular';
    default: return 'Margem-Regular';
  }
};
