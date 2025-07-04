
import { EventData } from "@/pages/Index";
import { calculateSmartPositionAdjustments } from './designSpacingCalculator';

export const preCalculatePositionAdjustments = async (
  elements: any[],
  eventData: EventData,
  canvasWidth: number,
  format: string,
  useDesignSpacing: boolean = true
): Promise<Map<string, number>> => {
  
  if (useDesignSpacing) {
    // Use the smart spacing approach that respects layout editor spacing
    console.log('📐 Using smart design spacing approach for format:', format);
    return await calculateSmartPositionAdjustments(elements, eventData, canvasWidth, format);
  } else {
    // Fallback to the old approach
    console.log('📐 Using legacy spacing approach for format:', format);
    // Return empty map for now since we're focusing on the smart approach
    return new Map();
  }
};
