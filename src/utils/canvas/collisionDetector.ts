export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SafeZone {
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number; // Higher priority zones are preferred
}

export const checkCollision = (bounds1: ElementBounds, bounds2: ElementBounds): boolean => {
  return !(
    bounds1.x + bounds1.width <= bounds2.x ||
    bounds2.x + bounds2.width <= bounds1.x ||
    bounds1.y + bounds1.height <= bounds2.y ||
    bounds2.y + bounds2.height <= bounds1.y
  );
};

export const calculateSafeZones = (
  canvasWidth: number,
  canvasHeight: number,
  occupiedAreas: ElementBounds[],
  format: string
): SafeZone[] => {
  const safeZones: SafeZone[] = [];
  const padding = 20;

  // Define format-specific preferred zones
  const formatZones = getFormatSpecificZones(format, canvasWidth, canvasHeight);

  for (const zone of formatZones) {
    // Check if this zone collides with any occupied area
    const hasCollision = occupiedAreas.some(occupied => 
      checkCollision(zone, occupied)
    );

    if (!hasCollision) {
      safeZones.push({
        ...zone,
        width: zone.width - padding * 2,
        height: zone.height - padding * 2,
        x: zone.x + padding,
        y: zone.y + padding
      });
    } else {
      // Try to create smaller safe zones around the collision
      const subZones = createSubZones(zone, occupiedAreas, padding);
      safeZones.push(...subZones);
    }
  }

  // Sort by priority (higher first) and then by area (larger first)
  return safeZones.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return (b.width * b.height) - (a.width * a.height);
  });
};

const getFormatSpecificZones = (
  format: string,
  canvasWidth: number,
  canvasHeight: number
): (ElementBounds & { priority: number })[] => {
  const zones: (ElementBounds & { priority: number })[] = [];

  switch (format) {
    case 'youtube':
      zones.push(
        { x: 0, y: 0, width: canvasWidth * 0.6, height: canvasHeight * 0.4, priority: 10 }, // Top left
        { x: 0, y: canvasHeight * 0.6, width: canvasWidth, height: canvasHeight * 0.4, priority: 8 }, // Bottom
        { x: canvasWidth * 0.6, y: 0, width: canvasWidth * 0.4, height: canvasHeight * 0.6, priority: 6 } // Top right
      );
      break;
    
    case 'stories':
      zones.push(
        { x: 0, y: 0, width: canvasWidth, height: canvasHeight * 0.3, priority: 10 }, // Top
        { x: 0, y: canvasHeight * 0.7, width: canvasWidth, height: canvasHeight * 0.3, priority: 8 }, // Bottom
        { x: 0, y: canvasHeight * 0.3, width: canvasWidth * 0.5, height: canvasHeight * 0.4, priority: 6 } // Middle left
      );
      break;
    
    case 'feed':
      zones.push(
        { x: 0, y: 0, width: canvasWidth, height: canvasHeight * 0.25, priority: 10 }, // Top
        { x: 0, y: canvasHeight * 0.75, width: canvasWidth, height: canvasHeight * 0.25, priority: 9 }, // Bottom
        { x: 0, y: canvasHeight * 0.25, width: canvasWidth * 0.6, height: canvasHeight * 0.5, priority: 7 } // Middle left
      );
      break;
    
    default:
      // Default safe zones for other formats
      zones.push(
        { x: 0, y: 0, width: canvasWidth, height: canvasHeight * 0.3, priority: 10 },
        { x: 0, y: canvasHeight * 0.7, width: canvasWidth, height: canvasHeight * 0.3, priority: 8 },
        { x: 0, y: canvasHeight * 0.3, width: canvasWidth * 0.6, height: canvasHeight * 0.4, priority: 6 }
      );
  }

  return zones;
};

const createSubZones = (
  originalZone: ElementBounds & { priority: number },
  occupiedAreas: ElementBounds[],
  padding: number
): SafeZone[] => {
  const subZones: SafeZone[] = [];
  
  // Try to create zones around occupied areas
  for (const occupied of occupiedAreas) {
    // Zone above occupied area
    if (occupied.y > originalZone.y + padding) {
      const zone = {
        x: originalZone.x,
        y: originalZone.y,
        width: originalZone.width,
        height: occupied.y - originalZone.y - padding,
        priority: originalZone.priority - 1
      };
      if (zone.height > 30) subZones.push(zone);
    }

    // Zone below occupied area
    if (occupied.y + occupied.height < originalZone.y + originalZone.height - padding) {
      const zone = {
        x: originalZone.x,
        y: occupied.y + occupied.height + padding,
        width: originalZone.width,
        height: (originalZone.y + originalZone.height) - (occupied.y + occupied.height) - padding,
        priority: originalZone.priority - 1
      };
      if (zone.height > 30) subZones.push(zone);
    }

    // Zone to the left of occupied area
    if (occupied.x > originalZone.x + padding) {
      const zone = {
        x: originalZone.x,
        y: originalZone.y,
        width: occupied.x - originalZone.x - padding,
        height: originalZone.height,
        priority: originalZone.priority - 1
      };
      if (zone.width > 50) subZones.push(zone);
    }

    // Zone to the right of occupied area
    if (occupied.x + occupied.width < originalZone.x + originalZone.width - padding) {
      const zone = {
        x: occupied.x + occupied.width + padding,
        y: originalZone.y,
        width: (originalZone.x + originalZone.width) - (occupied.x + occupied.width) - padding,
        height: originalZone.height,
        priority: originalZone.priority - 1
      };
      if (zone.width > 50) subZones.push(zone);
    }
  }

  return subZones;
};

export const findBestTextPosition = (
  textWidth: number,
  textHeight: number,
  safeZones: SafeZone[],
  preferredPosition?: { x: number; y: number }
): { x: number; y: number } | null => {
  // If we have a preferred position, try to find the closest safe zone
  if (preferredPosition) {
    const validZones = safeZones.filter(zone => 
      zone.width >= textWidth && zone.height >= textHeight
    );

    if (validZones.length === 0) return null;

    // Find the zone closest to preferred position
    const closestZone = validZones.reduce((closest, zone) => {
      const closestDistance = Math.sqrt(
        Math.pow(closest.x - preferredPosition.x, 2) + 
        Math.pow(closest.y - preferredPosition.y, 2)
      );
      const zoneDistance = Math.sqrt(
        Math.pow(zone.x - preferredPosition.x, 2) + 
        Math.pow(zone.y - preferredPosition.y, 2)
      );
      return zoneDistance < closestDistance ? zone : closest;
    });

    return { x: closestZone.x, y: closestZone.y };
  }

  // Otherwise, use the highest priority zone that fits
  for (const zone of safeZones) {
    if (zone.width >= textWidth && zone.height >= textHeight) {
      return { x: zone.x, y: zone.y };
    }
  }

  return null;
};
