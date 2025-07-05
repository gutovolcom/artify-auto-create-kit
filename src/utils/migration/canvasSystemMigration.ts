// Migration utilities for transitioning to unified canvas system
import { 
  UnifiedCanvasElement, 
  CanvasElementConfig 
} from '@/types/canvas';

/**
 * Convert old CanvasElementConfig to new UnifiedCanvasElement
 */
export function migrateCanvasElementConfig(
  oldElement: CanvasElementConfig,
  mode: 'layout-editor' | 'art-generation' = 'layout-editor'
): UnifiedCanvasElement {
  return {
    id: oldElement.id || `migrated_${Date.now()}`,
    field: oldElement.field,
    type: oldElement.type,
    position: oldElement.position,
    size: oldElement.size || { width: 100, height: 50 },
    mode,
    style: oldElement.style,
    imageUrl: oldElement.imageUrl,
    constraints: oldElement.constraints
  };
}

/**
 * Convert multiple old elements to new format
 */
export function migrateCanvasElements(
  oldElements: CanvasElementConfig[],
  mode: 'layout-editor' | 'art-generation' = 'layout-editor'
): UnifiedCanvasElement[] {
  return oldElements.map(element => migrateCanvasElementConfig(element, mode));
}

/**
 * Convert old layout data to new format
 */
export function migrateLayoutData(oldLayoutData: any): any {
  if (!oldLayoutData?.layout_config?.elements) {
    return oldLayoutData;
  }

  const migratedElements = oldLayoutData.layout_config.elements.map((element: any) => {
    return {
      id: element.id,
      field: element.field,
      type: element.type,
      position: element.position,
      size: element.size || { width: 100, height: 50 },
      style: element.style,
      constraints: element.constraints
    };
  });

  return {
    ...oldLayoutData,
    layout_config: {
      ...oldLayoutData.layout_config,
      elements: migratedElements
    }
  };
}

/**
 * Check if element needs migration
 */
export function needsMigration(element: any): boolean {
  // Check if element has old structure
  return (
    element &&
    typeof element.field === 'string' &&
    typeof element.type === 'string' &&
    element.position &&
    !element.mode // New elements have mode property
  );
}

/**
 * Batch migrate elements with validation
 */
export function batchMigrateElements(
  elements: any[],
  mode: 'layout-editor' | 'art-generation' = 'layout-editor'
): { migrated: UnifiedCanvasElement[]; errors: any[] } {
  const migrated: UnifiedCanvasElement[] = [];
  const errors: any[] = [];

  elements.forEach((element, index) => {
    try {
      if (needsMigration(element)) {
        const migratedElement = migrateCanvasElementConfig(element, mode);
        migrated.push(migratedElement);
      } else {
        // Element is already in new format or invalid
        migrated.push(element);
      }
    } catch (error) {
      errors.push({
        index,
        element,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return { migrated, errors };
} 