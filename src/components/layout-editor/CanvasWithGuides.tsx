
import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { getAlignmentGuides, isNearGuideline, getCanvasCenter } from './alignmentUtils';

type FabricCanvas = fabric.Canvas;

interface CanvasWithGuidesProps {
  canvas: FabricCanvas | null;
  scale: number;
}

export const CanvasWithGuides: React.FC<CanvasWithGuidesProps> = ({ canvas, scale }) => {
  const guidesRef = useRef<fabric.Line[]>([]);

  const createCenterGuides = () => {
    if (!canvas) return;

    // Remove existing guides
    guidesRef.current.forEach(guide => canvas.remove(guide));
    guidesRef.current = [];

    const center = getCanvasCenter(canvas);
    
    // Horizontal center line
    const hLine = new fabric.Line([0, center.y, canvas.width!, center.y], {
      stroke: '#3b82f6',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      opacity: 0.3,
      selectable: false,
      evented: false,
      excludeFromExport: true
    });

    // Vertical center line
    const vLine = new fabric.Line([center.x, 0, center.x, canvas.height!], {
      stroke: '#3b82f6',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      opacity: 0.3,
      selectable: false,
      evented: false,
      excludeFromExport: true
    });

    canvas.add(hLine, vLine);
    guidesRef.current = [hLine, vLine];
    
    // Send guides to back using correct Fabric.js v6 API
    canvas.sendObjectToBack(hLine);
    canvas.sendObjectToBack(vLine);
    canvas.renderAll();
  };

  const showDynamicGuides = (activeObject: fabric.FabricObject) => {
    if (!canvas || !activeObject) return;

    const center = getCanvasCenter(canvas);
    const objCenter = activeObject.getCenterPoint();
    
    // Clear previous dynamic guides
    const dynamicGuides = canvas.getObjects().filter((obj: any) => obj.isDynamicGuide);
    dynamicGuides.forEach(guide => canvas.remove(guide));

    const guides: fabric.Line[] = [];

    // Show horizontal center guide if object is near center
    if (isNearGuideline(objCenter.y, center.y, 10)) {
      const hGuide = new fabric.Line([0, center.y, canvas.width!, center.y], {
        stroke: '#ef4444',
        strokeWidth: 2,
        opacity: 0.8,
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      (hGuide as any).isDynamicGuide = true;
      guides.push(hGuide);
    }

    // Show vertical center guide if object is near center
    if (isNearGuideline(objCenter.x, center.x, 10)) {
      const vGuide = new fabric.Line([center.x, 0, center.x, canvas.height!], {
        stroke: '#ef4444',
        strokeWidth: 2,
        opacity: 0.8,
        selectable: false,
        evented: false,
        excludeFromExport: true
      });
      (vGuide as any).isDynamicGuide = true;
      guides.push(vGuide);
    }

    if (guides.length > 0) {
      canvas.add(...guides);
      guides.forEach(guide => canvas.sendObjectToBack(guide));
      canvas.renderAll();
    }
  };

  const hideDynamicGuides = () => {
    if (!canvas) return;
    
    const dynamicGuides = canvas.getObjects().filter((obj: any) => obj.isDynamicGuide);
    dynamicGuides.forEach(guide => canvas.remove(guide));
    canvas.renderAll();
  };

  useEffect(() => {
    if (!canvas) return;

    createCenterGuides();

    // Add event listeners for dynamic guides
    const handleObjectMoving = (e: fabric.ModifiedEvent) => {
      if (e.target) {
        showDynamicGuides(e.target);
      }
    };

    const handleObjectMoved = () => {
      hideDynamicGuides();
    };

    const handleSelectionCleared = () => {
      hideDynamicGuides();
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:modified', handleObjectMoved);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:modified', handleObjectMoved);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas]);

  return null; // This component only manages guides, no UI
};
