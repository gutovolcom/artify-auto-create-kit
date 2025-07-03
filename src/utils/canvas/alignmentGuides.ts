
import * as fabric from 'fabric';
import { SnapGuide } from './snappingUtils';

export class AlignmentGuides {
  private canvas: fabric.Canvas;
  private guides: Map<string, fabric.Line> = new Map();
  private guideStyle = {
    stroke: '#ff6b6b',
    strokeWidth: 1,
    strokeDashArray: [5, 5],
    selectable: false,
    evented: false,
    excludeFromExport: true
  };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  // Show alignment guides
  showGuides(snapGuides: SnapGuide[]) {
    // Clear existing guides first
    this.clearGuides();

    snapGuides.forEach(guide => {
      const line = new fabric.Line([guide.x1, guide.y1, guide.x2, guide.y2], {
        ...this.guideStyle,
        id: guide.id
      });

      this.guides.set(guide.id, line);
      this.canvas.add(line);
    });

    this.canvas.renderAll();
  }

  // Clear all alignment guides
  clearGuides() {
    this.guides.forEach(guide => {
      this.canvas.remove(guide);
    });
    this.guides.clear();
    this.canvas.renderAll();
  }

  // Update guide styling
  updateGuideStyle(style: Partial<typeof this.guideStyle>) {
    this.guideStyle = { ...this.guideStyle, ...style };
  }

  // Check if an object is a guide
  isGuide(obj: fabric.Object): boolean {
    return this.guides.has((obj as any).id);
  }

  // Get all guide objects
  getGuideObjects(): fabric.Line[] {
    return Array.from(this.guides.values());
  }
}
