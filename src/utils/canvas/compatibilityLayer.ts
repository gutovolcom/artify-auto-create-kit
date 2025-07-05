// Compatibility layer for gradual migration
import { CanvasElementConfig } from '@/components/layout-editor/types';
import { UnifiedCanvasElement, ElementRenderContext } from '@/types/canvas';
import { UnifiedElementSystem } from './unifiedElementSystem';

// Re-export old addElementToCanvas function with new implementation
export const addElementToCanvas = async (
  canvas: any,
  elementConfig: CanvasElementConfig,
  scale: number,
  format?: string
): Promise<void> => {
  console.log('🔄 Using compatibility layer for addElementToCanvas');
  
  // Create unified element system
  const elementSystem = new UnifiedElementSystem(scale, format || 'default');
  
  // Convert old element to new format
  const unifiedElement: UnifiedCanvasElement = {
    id: elementConfig.id || `compat_${Date.now()}`,
    field: elementConfig.field,
    type: elementConfig.type,
    position: elementConfig.position,
    size: elementConfig.size || { width: 100, height: 50 },
    mode: 'layout-editor',
    style: elementConfig.style,
    imageUrl: elementConfig.imageUrl,
    constraints: elementConfig.constraints
  };

  // Create context
  const context: ElementRenderContext = {
    mode: 'layout-editor',
    canvas,
    scale,
    format
  };

  // Use new system
  await elementSystem.addElementToCanvas(unifiedElement, context);
};

// Export wrapper for backward compatibility
export const addElementToCanvasLegacy = addElementToCanvas; 