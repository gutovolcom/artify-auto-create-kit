
import * as fabric from 'fabric';

export interface SnapPoint {
  x?: number;
  y?: number;
  type: 'edge' | 'center';
  direction: 'horizontal' | 'vertical' | 'both';
  sourceObject?: fabric.Object;
}

export interface SnapResult {
  snapX?: number;
  snapY?: number;
  guides: SnapGuide[];
}

export interface SnapGuide {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'horizontal' | 'vertical';
}

export const SNAP_THRESHOLD = 10; // pixels

// Get all snap points from canvas objects
export const getCanvasSnapPoints = (canvas: fabric.Canvas, excludeObject: fabric.Object): SnapPoint[] => {
  const snapPoints: SnapPoint[] = [];
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // Add canvas edge snap points
  snapPoints.push(
    { x: 0, type: 'edge', direction: 'vertical' },
    { x: canvasWidth, type: 'edge', direction: 'vertical' },
    { y: 0, type: 'edge', direction: 'horizontal' },
    { y: canvasHeight, type: 'edge', direction: 'horizontal' },
    { x: canvasWidth / 2, type: 'center', direction: 'vertical' },
    { y: canvasHeight / 2, type: 'center', direction: 'horizontal' }
  );

  // Add object snap points
  canvas.getObjects().forEach(obj => {
    if (obj === excludeObject || !obj.visible) return;

    const bounds = obj.getBoundingRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    // Object edges
    snapPoints.push(
      { x: bounds.left, type: 'edge', direction: 'vertical', sourceObject: obj },
      { x: bounds.left + bounds.width, type: 'edge', direction: 'vertical', sourceObject: obj },
      { y: bounds.top, type: 'edge', direction: 'horizontal', sourceObject: obj },
      { y: bounds.top + bounds.height, type: 'edge', direction: 'horizontal', sourceObject: obj }
    );

    // Object centers
    snapPoints.push(
      { x: centerX, type: 'center', direction: 'vertical', sourceObject: obj },
      { y: centerY, type: 'center', direction: 'horizontal', sourceObject: obj }
    );
  });

  return snapPoints;
};

// Calculate snap position for an object
export const calculateSnapPosition = (
  object: fabric.Object,
  snapPoints: SnapPoint[],
  threshold: number = SNAP_THRESHOLD
): SnapResult => {
  const bounds = object.getBoundingRect();
  const objectCenterX = bounds.left + bounds.width / 2;
  const objectCenterY = bounds.top + bounds.height / 2;

  let snapX: number | undefined;
  let snapY: number | undefined;
  const guides: SnapGuide[] = [];

  // Check vertical snapping (X-axis)
  const verticalPoints = snapPoints.filter(p => p.direction === 'vertical' || p.direction === 'both');
  for (const point of verticalPoints) {
    if (point.x === undefined) continue;

    // Snap left edge
    if (Math.abs(bounds.left - point.x) <= threshold) {
      snapX = point.x;
      guides.push({
        id: `v-${point.x}`,
        x1: point.x,
        y1: 0,
        x2: point.x,
        y2: bounds.top + bounds.height + 50,
        type: 'vertical'
      });
      break;
    }

    // Snap right edge
    if (Math.abs(bounds.left + bounds.width - point.x) <= threshold) {
      snapX = point.x - bounds.width;
      guides.push({
        id: `v-${point.x}`,
        x1: point.x,
        y1: 0,
        x2: point.x,
        y2: bounds.top + bounds.height + 50,
        type: 'vertical'
      });
      break;
    }

    // Snap center
    if (Math.abs(objectCenterX - point.x) <= threshold) {
      snapX = point.x - bounds.width / 2;
      guides.push({
        id: `v-center-${point.x}`,
        x1: point.x,
        y1: bounds.top - 20,
        x2: point.x,
        y2: bounds.top + bounds.height + 20,
        type: 'vertical'
      });
      break;
    }
  }

  // Check horizontal snapping (Y-axis)
  const horizontalPoints = snapPoints.filter(p => p.direction === 'horizontal' || p.direction === 'both');
  for (const point of horizontalPoints) {
    if (point.y === undefined) continue;

    // Snap top edge
    if (Math.abs(bounds.top - point.y) <= threshold) {
      snapY = point.y;
      guides.push({
        id: `h-${point.y}`,
        x1: 0,
        y1: point.y,
        x2: bounds.left + bounds.width + 50,
        y2: point.y,
        type: 'horizontal'
      });
      break;
    }

    // Snap bottom edge
    if (Math.abs(bounds.top + bounds.height - point.y) <= threshold) {
      snapY = point.y - bounds.height;
      guides.push({
        id: `h-${point.y}`,
        x1: 0,
        y1: point.y,
        x2: bounds.left + bounds.width + 50,
        y2: point.y,
        type: 'horizontal'
      });
      break;
    }

    // Snap center
    if (Math.abs(objectCenterY - point.y) <= threshold) {
      snapY = point.y - bounds.height / 2;
      guides.push({
        id: `h-center-${point.y}`,
        x1: bounds.left - 20,
        y1: point.y,
        x2: bounds.left + bounds.width + 20,
        y2: point.y,
        type: 'horizontal'
      });
      break;
    }
  }

  return { snapX, snapY, guides };
};
